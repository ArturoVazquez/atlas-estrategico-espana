#!/usr/bin/env python3
"""Validador del Atlas Estratégico de España — el contrato con dientes.

Comprueba las siete verificaciones de CONTRATO-DATOS.md §7 sobre las reglas de
doctrina R1–R9 de §6.4 — las nueve, desde el contrato 1.10. Corre en CI en cada
PR que toque `datos/`.

    python pipeline/validar.py                    # todas las capas del manifiesto
    python pipeline/validar.py fichero.geojson    # una o varias, sueltas

Devuelve 0 si nada BLOQUEA. Los AVISOS no cambian el código de salida: §7
distingue las dos cosas a propósito, porque hay citas que se archivan con
retraso y eso no debe parar un cambio de dato correcto.

Doctrina de este fichero: **valida y vigila, nunca genera datos** (§2). No
escribe. No corrige. No adivina.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:  # pragma: no cover
    sys.exit(
        "Falta la dependencia `jsonschema`.\n"
        "    python -m pip install -r pipeline/requirements.txt"
    )

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
ESQUEMAS = Path(__file__).resolve().parent / "esquemas"

# §7.4 · El recuadro del territorio, CANARIAS INCLUIDAS. Quien lo estreche
# «porque España está más al norte» deja fuera dos provincias.
BBOX_ESPANA = (-18.3, 27.5, 4.4, 43.9)

DECIMALES_MAX = 5          # §4 · ~1 m. Más que eso es ruido en el diff.
SUFIJO_META = re.compile(r"^(?P<base>[a-z][a-z0-9_]*)__(?P<clase>[vf])$")

BLOQUEA = "BLOQUEA"
AVISA = "AVISA"


@dataclass(frozen=True)
class Hallazgo:
    nivel: str      # BLOQUEA · AVISA
    codigo: str     # R1…R7 · §7.2 · §6.2 …
    donde: str      # id del feature, o del fichero
    mensaje: str

    def __str__(self) -> str:
        return f"  {self.nivel:<7} {self.codigo:<6} {self.donde}\n{' ' * 16}{self.mensaje}"


# ─────────────────────────── utilidades ───────────────────────────

def cargar(ruta: Path) -> dict:
    with ruta.open(encoding="utf-8") as f:
        return json.load(f)


def vocabularios() -> dict:
    """Los enums, de su única fuente de verdad. Nunca duplicados en los esquemas."""
    v = cargar(DATOS / "vocabularios.json")
    valores = lambda lista: {x["valor"] for x in lista}
    return {
        "verif": valores(v["registro"]["verif"]),
        "estado_registro": valores(v["registro"]["estado_registro"]),
        "geo_precision": valores(v["registro"]["geo_precision"]),
        "fase": valores(v["registro"]["fase"]),
        "fuente_tipo": valores(v["fuente"]["tipo"]),
        "categoria": {c: valores(l) for c, l in v["categoria"].items()},
    }


def coordenadas(geom: dict):
    """Aplana la geometría a una lista de pares (lon, lat), sea cual sea su tipo."""
    def bajar(nodo):
        if nodo and isinstance(nodo[0], (int, float)):
            yield nodo
        else:
            for hijo in nodo:
                yield from bajar(hijo)
    yield from bajar(geom.get("coordinates", []))


def anillos(geom: dict):
    """Los anillos de un Polygon/MultiPolygon, con su índice dentro del polígono."""
    tipo, coords = geom.get("type"), geom.get("coordinates", [])
    if tipo == "Polygon":
        yield from enumerate(coords)
    elif tipo == "MultiPolygon":
        for poligono in coords:
            yield from enumerate(poligono)


def area_con_signo(anillo) -> float:
    """Fórmula del cordón. Positiva = antihorario (RFC 7946 §3.1.6)."""
    return sum(
        anillo[i][0] * anillo[i + 1][1] - anillo[i + 1][0] * anillo[i][1]
        for i in range(len(anillo) - 1)
    ) / 2


def campos_meta(props: dict):
    """Los pares (campo_base, clase, valor) de todo sufijo `__v` / `__f`."""
    for clave, valor in props.items():
        if m := SUFIJO_META.match(clave):
            yield m["base"], m["clase"], valor, clave


def dentro(lon: float, lat: float, geom: dict) -> bool:
    """Ray casting: exterior sí, huecos no.

    Vive aquí, y no en `consultar.py` que fue donde nació, por dos motivos: este
    fichero es el que corre en CI y el que no toca la red, y sobre todo porque
    dos copias de un algoritmo que TIENEN que coincidir acaban no coincidiendo.
    `consultar.py` la importa de aquí; sus pruebas la siguen ejercitando, que es
    lo que la mantiene honesta (se probó con mutaciones deliberadas).
    """
    def en_anillo(anillo) -> bool:
        d = False
        for i in range(len(anillo)):
            x1, y1 = anillo[i][:2]
            x2, y2 = anillo[(i + 1) % len(anillo)][:2]
            if (y1 > lat) != (y2 > lat):
                if lon < x1 + (lat - y1) * (x2 - x1) / (y2 - y1):
                    d = not d
        return d

    tipo = geom.get("type")
    poligonos = geom.get("coordinates", [])
    if tipo == "Polygon":
        poligonos = [poligonos]
    elif tipo != "MultiPolygon":
        return False

    return any(en_anillo(p[0]) and not any(en_anillo(h) for h in p[1:])
               for p in poligonos if p)


# ─────────────────────────── comprobaciones ───────────────────────────

def comprobar_esquemas(doc: dict, capa: str) -> list[Hallazgo]:
    """§7.1 · Dos pasadas: el núcleo y, si existe, la extensión de la capa."""
    out = []
    pasadas = [("núcleo", ESQUEMAS / "nucleo.schema.json")]
    propia = ESQUEMAS / f"{capa}.schema.json"
    if propia.exists():
        pasadas.append((f"capa «{capa}»", propia))

    for nombre, ruta in pasadas:
        validador = Draft202012Validator(cargar(ruta), format_checker=FormatChecker())
        for err in sorted(validador.iter_errors(doc), key=lambda e: list(e.absolute_path)):
            camino = "/".join(str(p) for p in err.absolute_path) or "(raíz)"
            out.append(Hallazgo(BLOQUEA, "§7.1", camino,
                                f"Esquema {nombre}: {err.message}"))
    return out


def comprobar_identidad(doc: dict, capa: str) -> list[Hallazgo]:
    """§7.2 · slug únicos, id = capa:slug, y la colección dice de qué capa es."""
    out, vistos = [], {}

    declarada = doc.get("atlas", {}).get("capa")
    if declarada != capa:
        out.append(Hallazgo(BLOQUEA, "§7.2", "(raíz)",
                            f"La colección se declara de la capa «{declarada}» pero "
                            f"se valida como «{capa}»."))

    for f in doc.get("features", []):
        props = f.get("properties", {})
        slug, fid = props.get("slug"), f.get("id")

        esperado = f"{capa}:{slug}"
        if fid != esperado:
            out.append(Hallazgo(BLOQUEA, "§7.2", fid or "(sin id)",
                                f"El id debería ser «{esperado}». El id es la "
                                f"identidad permanente del registro (§4)."))
        if slug in vistos:
            out.append(Hallazgo(BLOQUEA, "§7.2", fid or slug,
                                f"El slug «{slug}» ya lo usa {vistos[slug]}. "
                                f"Deben ser únicos dentro de la capa."))
        else:
            vistos[slug] = fid
    return out


def comprobar_doctrina(doc: dict, registro_capa: str) -> list[Hallazgo]:
    """§7.3 · R1–R7 y R9 de §6.4, que son el proyecto entero en forma de test."""
    out = []

    for f in doc.get("features", []):
        props = f.get("properties", {})
        donde = f.get("id", "(sin id)")
        fuentes = {s["id"]: s for s in props.get("fuentes", []) if isinstance(s, dict)}
        tipos = {i: s.get("tipo") for i, s in fuentes.items()}
        confirmado = props.get("verif") == "confirmado"

        # R1 · un confirmado global exige al menos una primaria.
        if confirmado and "primaria" not in tipos.values():
            out.append(Hallazgo(BLOQUEA, "R1", donde,
                                "El registro es «confirmado» pero ninguna de sus "
                                "fuentes es primaria. Solo una fuente primaria "
                                "sostiene un confirmado."))

        # R4 · un hueco declarado impide el confirmado global.
        if confirmado and "hueco" in tipos.values():
            out.append(Hallazgo(BLOQUEA, "R4", donde,
                                "El registro declara un hueco (fuente pendiente) y "
                                "aun así se marca «confirmado». Un hueco reconocido "
                                "es precisamente lo que impide confirmar."))

        # R7 · `activo` es derivado (§6.5): jamás se escribe en el fichero.
        if "activo" in props:
            out.append(Hallazgo(BLOQUEA, "R7", donde,
                                "El campo «activo» no se escribe: se deriva de «fase» "
                                "o de «categoria» (§6.5). Escribirlo a mano son dos "
                                "fuentes de verdad que acabarán contradiciéndose."))

        # §6.2 · el doble guion bajo es espacio reservado del contrato.
        for clave in props:
            if "__" in clave and not SUFIJO_META.match(clave):
                out.append(Hallazgo(BLOQUEA, "§6.2", donde,
                                    f"El campo «{clave}» usa «__», que está reservado "
                                    f"para los sufijos de metadato «__v» y «__f»."))

        # R5 · una capa ilustrativa no verifica por campo ni finge precisión.
        if registro_capa == "ilustrativo":
            for _, _, _, clave in campos_meta(props):
                out.append(Hallazgo(BLOQUEA, "R5", donde,
                                    f"La capa es «ilustrativa» y no puede declarar "
                                    f"verificación por campo («{clave}»). Dibuja dónde, "
                                    f"no cuánto ni de quién."))
                break
            if props.get("geo_precision") != "ilustrativa":
                out.append(Hallazgo(BLOQUEA, "R5", donde,
                                    f"La capa es «ilustrativa», así que toda su "
                                    f"geometría debe ser «geo_precision: ilustrativa», "
                                    f"y esta dice «{props.get('geo_precision')}»."))

        # R2 · R3 · R6 — la frontera del confirmado por campo, y los huérfanos.
        estados = {b: v for b, c, v, _ in campos_meta(props) if c == "v"}
        apuntes = {b: v for b, c, v, _ in campos_meta(props) if c == "f"}

        for base, clase, valor, clave in campos_meta(props):
            # R6 · un metadato sin su campo es un dato que nadie sostiene.
            if base not in props:
                out.append(Hallazgo(BLOQUEA, "R6", donde,
                                    f"«{clave}» acompaña a un campo «{base}» que no "
                                    f"existe. Metadato huérfano."))
            if clase == "f" and valor not in fuentes:
                out.append(Hallazgo(BLOQUEA, "R6", donde,
                                    f"«{clave}» apunta a la fuente «{valor}», que no "
                                    f"está en «fuentes»."))

        for base, estado in estados.items():
            if estado != "confirmado":
                continue
            fid = apuntes.get(base)
            if fid is None:
                # R2 · confirmado sin nada detrás.
                out.append(Hallazgo(BLOQUEA, "R2", donde,
                                    f"«{base}» se declara confirmado pero no dice qué "
                                    f"fuente lo sostiene: falta «{base}__f»."))
            elif fid in fuentes and tipos.get(fid) != "primaria":
                # R3 · se coló una fuente que no puede sostenerlo.
                out.append(Hallazgo(BLOQUEA, "R3", donde,
                                    f"«{base}» se declara confirmado apoyándose en la "
                                    f"fuente «{fid}», de tipo «{tipos.get(fid)}». "
                                    f"Localiza fuente primaria o baja el campo a "
                                    f"«parcial» — el dato sube cuando sube su evidencia."))

        # R9 · una precisión que promete cartografía tiene que citarla (§6.6).
        # No lo cubren R2 ni R3: esas solo miran los campos declarados
        # «confirmado», y una geometría `exacta` marcada `parcial` sobre un
        # anuncio corporativo pasaba en verde. R9 mira la precisión DECLARADA,
        # que es lo que el mapa va a dibujar.
        if props.get("geo_precision") in ("exacta", "paraje"):
            precision, fid = props.get("geo_precision"), props.get("geo_fuente__f")
            if not props.get("geo_fuente"):
                out.append(Hallazgo(BLOQUEA, "R9", donde,
                                    f"Declara «geo_precision: {precision}» y no dice de "
                                    f"dónde sale la coordenada: falta «geo_fuente». Una "
                                    f"precisión que promete cartografía tiene que "
                                    f"citarla (§6.6)."))
            elif fid is None:
                out.append(Hallazgo(BLOQUEA, "R9", donde,
                                    f"Declara «geo_precision: {precision}» y describe su "
                                    f"origen en prosa, pero no lo ata a ninguna fuente: "
                                    f"falta «geo_fuente__f». La prosa no es una cita — "
                                    f"nadie puede comprobarla (§6.6)."))
            elif fid in fuentes and tipos.get(fid) != "primaria":
                out.append(Hallazgo(BLOQUEA, "R9", donde,
                                    f"La geometría se declara «{precision}» "
                                    f"apoyándose en «{fid}», de tipo «{tipos.get(fid)}». "
                                    f"Solo una fuente primaria concede esa precisión: "
                                    f"catastro minero, nomenclátor oficial o la resolución "
                                    f"que lo autoriza. Si no la hay, la geometría es "
                                    f"«municipio», y eso es un resultado legítimo (§6.6)."))

        # R3 también gobierna las `claves`: llevan su propio verif y su fuente.
        for i, clave in enumerate(props.get("claves", [])):
            if clave.get("verif") != "confirmado":
                continue
            fid = clave.get("fuente")
            if fid is None or fid not in fuentes:
                out.append(Hallazgo(BLOQUEA, "R2", donde,
                                    f"La clave «{clave.get('k')}» se declara confirmada "
                                    f"sin una fuente existente que la sostenga."))
            elif tipos.get(fid) != "primaria":
                out.append(Hallazgo(BLOQUEA, "R3", donde,
                                    f"La clave «{clave.get('k')}» se declara confirmada "
                                    f"apoyándose en «{fid}», de tipo «{tipos.get(fid)}»."))
    return out


def comprobar_geometria(doc: dict, ambito: str) -> list[Hallazgo]:
    """§7.4 · Recuadro según ámbito, precisión, anillos cerrados y orientados."""
    out = []
    lon0, lat0, lon1, lat1 = BBOX_ESPANA if ambito == "espana" else (-180, -90, 180, 90)

    for f in doc.get("features", []):
        geom, donde = f.get("geometry") or {}, f.get("id", "(sin id)")

        for lon, lat, *_ in coordenadas(geom):
            if not (lon0 <= lon <= lon1 and lat0 <= lat <= lat1):
                out.append(Hallazgo(BLOQUEA, "§7.4", donde,
                                    f"La coordenada ({lon}, {lat}) cae fuera del "
                                    f"recuadro de ámbito «{ambito}». ¿Están lon y lat "
                                    f"del revés? GeoJSON va (lon, lat)."))
                break
            for valor in (lon, lat):
                if abs(valor - round(valor, DECIMALES_MAX)) > 1e-12:
                    out.append(Hallazgo(BLOQUEA, "§7.4", donde,
                                        f"La coordenada {valor} pasa de "
                                        f"{DECIMALES_MAX} decimales. Más precisión de "
                                        f"la que hay es ruido en el diff (§4)."))
                    break

        for indice, anillo in anillos(geom):
            if anillo[0] != anillo[-1]:
                out.append(Hallazgo(BLOQUEA, "§7.4", donde,
                                    "Un anillo no cierra: el primer punto y el último "
                                    "deben coincidir (RFC 7946)."))
                continue
            area = area_con_signo(anillo)
            exterior = indice == 0
            if exterior and area < 0:
                out.append(Hallazgo(BLOQUEA, "§7.4", donde,
                                    "El anillo exterior va en sentido horario. RFC 7946 "
                                    "pide antihorario para el exterior."))
            elif not exterior and area > 0:
                out.append(Hallazgo(BLOQUEA, "§7.4", donde,
                                    "Un anillo interior (hueco) va en sentido "
                                    "antihorario. RFC 7946 pide horario para los huecos."))
    return out


def comprobar_fechas(doc: dict) -> list[Hallazgo]:
    """§7.5 · Orden, formato ISO y nada fechado en el futuro.

    «El futuro» necesita saber de quién es el ahora, y una fecha ISO no lleva
    huso. El atlas se cura en España (UTC+1/+2) y el CI corre en UTC: durante un
    par de horas cada noche, lo que aquí es hoy allí es mañana. Sin margen, un
    dato fechado correctamente a las 00:47 hace fallar la validación — y pasó.

    Un día de tolerancia. Esta comprobación existe para cazar un 2027 escrito
    donde iba 2017, no para arbitrar un desfase de dos horas.
    """
    out, hoy = [], date.today() + timedelta(days=1)

    for f in doc.get("features", []):
        props, donde = f.get("properties", {}), f.get("id", "(sin id)")
        fechas = {}
        for campo in ("fecha_alta", "fecha_verificacion"):
            crudo = props.get(campo)
            try:
                fechas[campo] = date.fromisoformat(crudo)
            except (TypeError, ValueError):
                out.append(Hallazgo(BLOQUEA, "§7.5", donde,
                                    f"«{campo}» no es una fecha ISO-8601: {crudo!r}."))

        alta, verif = fechas.get("fecha_alta"), fechas.get("fecha_verificacion")
        if alta and verif and verif < alta:
            out.append(Hallazgo(BLOQUEA, "§7.5", donde,
                                f"Se verificó ({verif}) antes de darse de alta ({alta})."))
        for campo, valor in fechas.items():
            if valor > hoy:
                out.append(Hallazgo(BLOQUEA, "§7.5", donde,
                                    f"«{campo}» está en el futuro ({valor})."))

        for fuente in props.get("fuentes", []):
            crudo = fuente.get("fecha")
            if crudo is None:
                continue
            try:
                if date.fromisoformat(crudo) > hoy:
                    out.append(Hallazgo(BLOQUEA, "§7.5", donde,
                                        f"La fuente «{fuente.get('id')}» está fechada "
                                        f"en el futuro ({crudo})."))
            except ValueError:
                out.append(Hallazgo(BLOQUEA, "§7.5", donde,
                                    f"La fuente «{fuente.get('id')}» tiene una fecha "
                                    f"que no es ISO-8601: {crudo!r}."))
    return out


def comprobar_vocabularios(doc: dict, capa: str, voc: dict) -> list[Hallazgo]:
    """§7.6 · Todo enum contra vocabularios.json, su única fuente de verdad."""
    out = []
    campos = [
        ("verif", voc["verif"]),
        ("estado_registro", voc["estado_registro"]),
        ("geo_precision", voc["geo_precision"]),
        ("fase", voc["fase"]),
        ("categoria", voc["categoria"].get(capa, set())),
    ]

    for f in doc.get("features", []):
        props, donde = f.get("properties", {}), f.get("id", "(sin id)")

        for campo, permitidos in campos:
            valor = props.get(campo)
            if valor is None or not permitidos:
                continue
            if valor not in permitidos:
                out.append(Hallazgo(BLOQUEA, "§7.6", donde,
                                    f"«{campo}: {valor}» no está en el vocabulario. "
                                    f"Admitidos: {', '.join(sorted(permitidos))}. "
                                    f"Añadir un valor es versión menor de contrato, "
                                    f"acto deliberado en vocabularios.json."))

        for _, clase, valor, clave in campos_meta(props):
            if clase == "v" and valor not in voc["verif"]:
                out.append(Hallazgo(BLOQUEA, "§7.6", donde,
                                    f"«{clave}: {valor}» no es un estado de "
                                    f"verificación válido."))

        for fuente in props.get("fuentes", []):
            if fuente.get("tipo") not in voc["fuente_tipo"]:
                out.append(Hallazgo(BLOQUEA, "§7.6", donde,
                                    f"La fuente «{fuente.get('id')}» tiene tipo "
                                    f"«{fuente.get('tipo')}», que no existe."))
    return out


def comprobar_archivo_fuentes(doc: dict) -> list[Hallazgo]:
    """§7.7 · Toda fuente citada por URL debería estar archivada. AVISA, no bloquea."""
    out = []
    for f in doc.get("features", []):
        donde = f.get("id", "(sin id)")
        for fuente in f.get("properties", {}).get("fuentes", []):
            if fuente.get("tipo") == "hueco" or not fuente.get("url"):
                continue
            archivo = fuente.get("archivo")
            if not archivo:
                out.append(Hallazgo(AVISA, "§7.7", donde,
                                    f"La fuente «{fuente.get('id')}» se cita por URL y "
                                    f"no está archivada. Las URLs se pudren."))
            elif not (RAIZ / archivo).exists():
                out.append(Hallazgo(AVISA, "§7.7", donde,
                                    f"«{archivo}» no existe. La cita quedaría colgando."))
    return out


def comprobar_r8(docs: dict[str, dict]) -> list[Hallazgo]:
    """§6.5 · R8 — la única regla que compara DOS capas entre sí.

    Un dominio `desarrollo` o `historico` no puede contener una mina en
    producción. Si la contiene, su `categoria` correcta es `mixto` o `activo`, y
    lo que hay es un error de dato.

    Nació de cerrar el matiz abierto de D3: al filtrar «en explotación» el
    dominio desaparecía aunque albergase una mina viva. La salida NO fue que el
    dominio mirase dentro de sí al pintar —eso disimula el fallo en pantalla y
    lo deja escrito mal en el fichero—, sino atraparlo aquí.

    Por vivir entre dos ficheros no cabe en `validar_capa()`: se comprueba
    cuando las dos capas entran en la misma pasada, que sin argumentos es
    siempre. Con una sola de las dos, calla — no puede saber si la otra existe y
    está bien, y una regla que grita por lo que no ha visto no se respeta mucho
    tiempo.
    """
    dominios, proyectos = docs.get("minerales-dominios"), docs.get("minerales-proyectos")
    if not dominios or not proyectos:
        return []

    vivas = [
        f for f in proyectos.get("features", [])
        if (f.get("properties") or {}).get("fase") == "produccion"
    ]

    out = []
    for d in dominios.get("features", []):
        props = d.get("properties") or {}
        if props.get("categoria") not in ("desarrollo", "historico"):
            continue
        dentro_de = [
            (p.get("properties") or {}).get("slug")
            for p in vivas if dentro(*(p.get("geometry") or {}).get("coordinates", (0, 0))[:2],
                                     d.get("geometry") or {})
        ]
        if dentro_de:
            out.append(Hallazgo(
                BLOQUEA, "R8", d.get("id", "(sin id)"),
                f"El dominio se declara «{props.get('categoria')}» y contiene "
                f"{len(dentro_de)} registro(s) de minerales-proyectos en producción "
                f"({', '.join(sorted(filter(None, dentro_de)))}). Un dominio que "
                f"alberga una mina viva es «mixto», o «activo» si no le queda nada "
                f"por abrir. Corregir el dominio, no la mina."))
    return out


def comprobar_manifiesto(manifiesto: dict) -> list[Hallazgo]:
    """§7.8 · El manifiesto no puede prometer capas que no están."""
    out = []
    for capa in manifiesto.get("capas", []):
        cid = capa.get("id", "(sin id)")
        preparacion = capa.get("en_preparacion", False)
        fichero = capa.get("fichero")

        if preparacion and fichero:
            out.append(Hallazgo(BLOQUEA, "§7.8", cid,
                                "Está «en preparación» y declara fichero. La regla del "
                                "horizonte (§3): una rama en gris no tiene datos."))
        if not preparacion and not fichero:
            out.append(Hallazgo(BLOQUEA, "§7.8", cid,
                                "No está «en preparación» y no declara fichero. O tiene "
                                "datos, o lo dice."))
        if fichero and not (DATOS / fichero).exists():
            out.append(Hallazgo(BLOQUEA, "§7.8", cid,
                                f"Declara «{fichero}», que no existe."))

        for obligatorio in ("id", "titulo", "arbol", "grupo"):
            if not capa.get(obligatorio):
                out.append(Hallazgo(BLOQUEA, "§7.8", cid,
                                    f"Le falta «{obligatorio}», obligatorio incluso "
                                    f"para una rama en preparación (§3)."))
    return out


# ─────────────────────────── orquestación ───────────────────────────

def validar_capa(doc: dict, ruta: Path, manifiesto: dict, voc: dict) -> list[Hallazgo]:
    capa = doc.get("atlas", {}).get("capa")
    entrada = next((c for c in manifiesto.get("capas", []) if c.get("id") == capa), None)
    if entrada is None:
        return [Hallazgo(BLOQUEA, "§7.8", ruta.name,
                         f"La colección se declara de la capa «{capa}», que no está en "
                         f"el manifiesto. Añadir una capa es añadir su entrada (§3).")]

    registro = entrada.get("registro", "verificado")
    ambito = entrada.get("ambito", "espana")

    return [
        *comprobar_esquemas(doc, capa),
        *comprobar_identidad(doc, capa),
        *comprobar_doctrina(doc, registro),
        *comprobar_geometria(doc, ambito),
        *comprobar_fechas(doc),
        *comprobar_vocabularios(doc, capa, voc),
        *comprobar_archivo_fuentes(doc),
    ]


def main(argv: list[str]) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    manifiesto = cargar(DATOS / "manifest.json")
    voc = vocabularios()

    hallazgos = {"manifest.json": comprobar_manifiesto(manifiesto)}

    if argv:
        rutas = [Path(a) for a in argv]
    else:
        rutas = [DATOS / c["fichero"] for c in manifiesto["capas"] if c.get("fichero")]

    # Los documentos se guardan por capa porque R8 los necesita a la vez: es la
    # única regla que compara dos ficheros, y por eso vive aquí y no dentro de
    # `validar_capa()`, que solo ve una colección.
    docs: dict[str, dict] = {}

    for ruta in rutas:
        if not ruta.exists():
            hallazgos[str(ruta)] = [Hallazgo(BLOQUEA, "§7.8", ruta.name, "No existe.")]
            continue
        try:
            doc = cargar(ruta)
        except json.JSONDecodeError as e:
            hallazgos[ruta.name] = [Hallazgo(BLOQUEA, "§7.1", ruta.name, f"JSON inválido: {e}")]
            continue
        docs[doc.get("atlas", {}).get("capa")] = doc
        hallazgos[ruta.name] = validar_capa(doc, ruta, manifiesto, voc)

    hallazgos["entre capas · R8"] = comprobar_r8(docs)

    bloqueos = avisos = 0
    for fichero, lista in hallazgos.items():
        if not lista:
            continue
        print(f"\n{fichero}")
        for h in sorted(lista, key=lambda x: (x.nivel != BLOQUEA, x.codigo, x.donde)):
            print(h)
            bloqueos += h.nivel == BLOQUEA
            avisos += h.nivel == AVISA

    revisadas = len(rutas)
    print()
    if bloqueos:
        print(f"✗ {bloqueos} incumplimiento(s) de contrato en {revisadas} capa(s)."
              f"{f' {avisos} aviso(s).' if avisos else ''}")
        print("  Cada código remite a CONTRATO-DATOS.md. La doctrina está ahí, no aquí.")
        return 1

    print(f"✓ Contrato cumplido en {revisadas} capa(s) y en el manifiesto."
          f"{f' {avisos} aviso(s), que no bloquean.' if avisos else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
