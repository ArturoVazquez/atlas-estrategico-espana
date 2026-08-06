#!/usr/bin/env python3
"""Consulta las fuentes cartográficas oficiales y contrasta lo que el atlas dice.

`validar.py` comprueba lo que se lee del repo sin salir a la red. Esto es lo
otro: preguntar al IGN y al catastro minero **dónde están las cosas de verdad**,
que es el trabajo de la pasada de verificación humana (CONTRATO-DATOS.md §6.6).

    consultar.py toponimo "Mina las Navas"                 · NGBE por etiqueta
    consultar.py recuadro -4.60 38.70 -4.30 38.95 moto     · NGBE por recuadro
    consultar.py municipio -6.1767 37.9541                 · punto-en-polígono
    consultar.py catastro 06 "AGUA BLANCA"                 · derecho minero
    consultar.py contraste datos/capas/<capa>.geojson      · la pasada entera

Doctrina de este fichero, y no es adorno:

  - **NUNCA escribe.** Ni en `datos/` ni en `fuentes/`. Archivar una fuente es un
    acto con criterio —qué filas, qué título, qué sostiene— y lo firma una
    persona. Esto consulta y enseña; decidir es de quien mira.
  - **NUNCA corre en CI.** Toca la red, y un contrato que se cae porque el IGN
    está de mantenimiento no es un contrato. Sus pruebas sí corren (offline):
    `pipeline/pruebas/correr-consultar.py`.
  - **Sin dependencias.** Solo biblioteca estándar. `requirements.txt` tiene una
    sola dependencia a propósito y una herramienta de consulta no es motivo para
    romperlo.

Las dos fuentes vienen en ETRS89 (EPSG:4258), que a los 5 decimales que admite
el contrato es WGS84. No hay transformación que aplicar, y eso está razonado en
CONTRATO-DATOS.md §6.6 y en la cabecera del CSV archivado en `fuentes/`.
"""

from __future__ import annotations

import json
import math
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# `dentro()` nació aquí y se mudó a `validar.py` cuando R8 la necesitó (contrato
# 1.10): el validador es el que corre en CI y el que no toca la red. Se importa
# en vez de copiarse — dos ray-castings que tienen que dar el mismo resultado
# acaban no dándolo, y el desacuerdo se descubre pintando.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validar import dentro  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / ".cache"

IGN = "https://api-features.ign.es/collections"
CATASTRO = ("https://geoportal.minetur.gob.es/CatastroMinero/api/reportDerechosMineros"
            "?idCCAA=&idProv={prov}&idMuni=&geometria&extension=CSV")

# El servicio del IGN devuelve `numberMatched: 0` con `limit` alto en consultas
# que SÍ existen — sin error, sin aviso, sin código distinto. Con 100 responde.
# Se descubrió buscando «Minas de Escúzar», que a 500 no existía y a 20 sí.
LIMITE_IGN = 100

# El CSV del catastro publica el perímetro en grados/minutos/segundos.
VERTICE = re.compile(r"\((\d+). (\d+)' ([\d.]+)'' ([WE]), (\d+). (\d+)' ([\d.]+)'' ([NS])\)")
CAMPOS_CATASTRO = ["nombre", "empresa", "organismo", "situacion", "tipo", "frac",
                   "registro", "sustancia", "sustancia2", "superficie", "uds", "seccion"]


# ─────────────────────────── el IGN ───────────────────────────

def pedir(url: str) -> dict:
    peticion = urllib.request.Request(url, headers={"User-Agent": "atlas-estrategico"})
    with urllib.request.urlopen(peticion, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def _lugares(consulta: dict) -> list[tuple]:
    url = f"{IGN}/namedplace/items?{urllib.parse.urlencode({**consulta, 'f': 'json'})}"
    salida = []
    for f in pedir(url).get("features", []):
        lon, lat = f["geometry"]["coordinates"][:2]
        salida.append((f["properties"].get("etiqueta"),
                       f["properties"].get("tipo"),
                       round(lon, 5), round(lat, 5)))
    return salida


def toponimo(nombre: str) -> list[tuple]:
    """Nomenclátor Geográfico Básico de España. La etiqueta es EXACTA:
    «Matamulas» no encuentra «Cerro de Matamulas». Para explorar, `recuadro`."""
    return _lugares({"etiqueta": nombre, "limit": LIMITE_IGN})


def recuadro(x0: float, y0: float, x1: float, y1: float) -> list[tuple]:
    return _lugares({"bbox": f"{x0},{y0},{x1},{y1}", "limit": 1000})


# ─────────────────────────── punto en polígono ───────────────────────────
#
# `dentro()` se importa de `validar.py` (ver la cabecera). Aquí hace falta
# porque el `bbox` de la API del IGN devuelve lo que ROZA el recuadro, no lo que
# lo contiene: preguntar por un punto en un trifinio devuelve tres municipios, y
# solo uno es la respuesta.

def municipio(lon: float, lat: float) -> list[str]:
    """El municipio que CONTIENE el punto, no los que le pasan cerca."""
    q = urllib.parse.urlencode({"bbox": f"{lon},{lat},{lon},{lat}",
                                "limit": 30, "f": "json"})
    salida = []
    for f in pedir(f"{IGN}/administrativeunit/items?{q}").get("features", []):
        p = f["properties"]
        if p.get("nationallevelname") == "Municipio" and f.get("geometry"):
            if dentro(lon, lat, f["geometry"]):
                salida.append(p.get("nameunit"))
    return salida


# ─────────────────────────── el catastro minero ───────────────────────────

def csv_provincia(prov: str) -> str:
    """Descarga el CSV provincial y lo cachea. `.cache/` está en .gitignore: una
    copia de trabajo NO es una cita. La cita es el extracto curado de `fuentes/`."""
    destino = CACHE / f"catastro-{prov}.csv"
    if not destino.exists():
        CACHE.mkdir(exist_ok=True)
        # stderr no se reconfigura a UTF-8, así que este aviso va en ASCII: en la
        # consola de Windows cualquier otra cosa sale como basura.
        print(f"  ... descargando el catastro de la provincia {prov}", file=sys.stderr)
        with urllib.request.urlopen(CATASTRO.format(prov=prov), timeout=180) as r:
            destino.write_bytes(r.read())
    return destino.read_bytes().decode("latin-1")


def vertices(linea: str) -> list[tuple[float, float]]:
    salida = []
    for m in VERTICE.finditer(linea):
        lon = int(m[1]) + int(m[2]) / 60 + float(m[3]) / 3600
        lat = int(m[5]) + int(m[6]) / 60 + float(m[7]) / 3600
        salida.append((-lon if m[4] == "W" else lon, -lat if m[8] == "S" else lat))
    return salida


def medir(vs: list[tuple[float, float]]) -> tuple | None:
    """Centroide y extensión en km — y si el derecho viene en varias piezas.

    Las dos cosas importan y se aprendieron a base de tropezar: la reserva «AGUA
    BLANCA» son ~28 km² (su centroide no es una coordenada de nada) y la
    concesión «LAS CRUCES» tiene cuatro piezas disjuntas (su centroide cae donde
    no hay concesión). Por eso §6.6 dice que un punto no hereda la precisión de
    su polígono.
    """
    if len(vs) < 3:
        return None
    a = cx = cy = 0.0
    for i in range(len(vs)):
        x1, y1 = vs[i]
        x2, y2 = vs[(i + 1) % len(vs)]
        cruz = x1 * y2 - x2 * y1
        a, cx, cy = a + cruz, cx + (x1 + x2) * cruz, cy + (y1 + y2) * cruz
    if abs(a) < 1e-15:
        return None
    a /= 2
    cx, cy = cx / (6 * a), cy / (6 * a)
    lons, lats = [v[0] for v in vs], [v[1] for v in vs]
    saltos = sum(1 for i in range(1, len(vs))
                 if abs(vs[i][0] - vs[i - 1][0]) > 0.02 or abs(vs[i][1] - vs[i - 1][1]) > 0.02)
    return (round(cx, 5), round(cy, 5),
            round((max(lons) - min(lons)) * 111.32 * math.cos(math.radians(cy)), 2),
            round((max(lats) - min(lats)) * 110.57, 2),
            saltos > 1)


def catastro(prov: str, *claves: str):
    for linea in csv_provincia(prov).splitlines():
        U = linea.upper()
        if any(k.upper() in U for k in claves):
            yield dict(zip(CAMPOS_CATASTRO, linea.split("/"))), medir(vertices(linea))


# ─────────────────────────── los subcomandos ───────────────────────────

def mandar_toponimo(argv) -> int:
    encontrados = toponimo(argv[0])
    for e in encontrados:
        print(f"  {e[0]!r:<38} {e[1]:<34} [{e[2]}, {e[3]}]")
    if not encontrados:
        print(f"  0 resultados para {argv[0]!r}.")
        print("  OJO: un 0 NO es prueba de ausencia. La etiqueta es exacta, y el")
        print("  servicio del IGN devuelve 0 en silencio si algo va mal en la")
        print("  consulta. Confirma con `recuadro` antes de declarar un hueco.")
    return 0


def mandar_recuadro(argv) -> int:
    x0, y0, x1, y1 = (float(v) for v in argv[:4])
    patron = argv[4] if len(argv) > 4 else None
    lugares = recuadro(x0, y0, x1, y1)
    vistos = [l for l in lugares
              if not patron or re.search(patron, l[0] or "", re.I)]
    print(f"  {len(lugares)} topónimos en el recuadro"
          + (f"; {len(vistos)} coinciden con {patron!r}" if patron else ""))
    for l in vistos:
        print(f"  {l[0]!r:<38} {l[1]:<34} [{l[2]}, {l[3]}]")
    return 0


def mandar_municipio(argv) -> int:
    lon, lat = float(argv[0]), float(argv[1])
    hallados = municipio(lon, lat)
    print(f"  [{lon}, {lat}] → {hallados or 'ningún municipio lo contiene'}")
    return 0 if hallados else 1


def mandar_catastro(argv) -> int:
    for d, m in catastro(argv[0], *argv[1:]):
        print(f"  {d.get('nombre','?').strip()!r} | {d.get('empresa','?').strip()} "
              f"| {d.get('situacion')} | {d.get('tipo')} "
              f"| nº {d.get('registro','').strip()} | {d.get('sustancia')}")
        if m:
            aviso = "  ← MULTIPARTE: el centroide puede caer fuera" if m[4] else ""
            print(f"       centroide [{m[0]}, {m[1]}]   extensión {m[2]} x {m[3]} km{aviso}")
    return 0


def mandar_contraste(argv) -> int:
    """La pasada entera: ¿cae cada punto en el municipio que su ficha declara?"""
    doc = json.loads(Path(argv[0]).read_text(encoding="utf-8"))
    fallos = 0

    print(f"  {'registro':<20} {'precisión':<11} {'coordenada':<24} municipio")
    print("  " + "-" * 96)
    for f in doc.get("features", []):
        p = f.get("properties", {})
        geom = f.get("geometry") or {}
        if geom.get("type") != "Point":
            continue
        lon, lat = geom["coordinates"][:2]
        declarado = p.get("municipio", "")
        hallados = municipio(lon, lat)

        if not declarado:
            # Un registro puede NO tener municipio y estar perfectamente: la capa
            # del tablero incluye Gibraltar, las plazas de soberanía y Perejil,
            # que no están en ningún término español. Contarlo como discrepancia
            # sería inventar un conflicto donde no hay dos datos que comparar —
            # y un contraste que grita por lo que no puede comprobar acaba
            # ignorado, que es como se pierde el que sí importa.
            veredicto = "sin municipio declarado"
        elif any(h.lower() in declarado.lower() for h in hallados):
            veredicto = "ok"
        else:
            veredicto = "¡REVISAR!"
            fallos += 1

        print(f"  {p.get('slug',''):<20} {p.get('geo_precision',''):<11} "
              f"{f'[{lon}, {lat}]':<24} {declarado or '—'}"
              f"  →  {hallados or '—'}  {veredicto}")

    print()
    if fallos:
        print(f"  ✗ {fallos} punto(s) fuera del municipio que su ficha declara.")
        print("    No elijas entre los dos datos: uno de ellos está mal y no se")
        print("    sabe cuál. Se para y se declara el hueco (§6.6).")
        return 1
    print("  ✓ Todos los puntos caen en el municipio que su ficha declara.")
    return 0


MANDOS = {
    "toponimo": (mandar_toponimo, 1, "<nombre exacto>"),
    "recuadro": (mandar_recuadro, 4, "<lon0> <lat0> <lon1> <lat1> [patrón]"),
    "municipio": (mandar_municipio, 2, "<lon> <lat>"),
    "catastro": (mandar_catastro, 2, "<provincia INE> <clave>…"),
    "contraste": (mandar_contraste, 1, "<capa.geojson>"),
}


def main(argv: list[str]) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if not argv or argv[0] not in MANDOS:
        print(__doc__.split("Doctrina")[0].rstrip())
        return 2

    funcion, minimo, uso = MANDOS[argv[0]]
    if len(argv) - 1 < minimo:
        print(f"Uso: consultar.py {argv[0]} {uso}")
        return 2
    return funcion(argv[1:])


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
