#!/usr/bin/env python3
"""La guardia semanal: capas caducadas y URLs muertas. Avisa; JAMÁS escribe.

`validar.py` comprueba que un dato esté bien sostenido **el día que entra**. Esto
comprueba lo otro: que siga estándolo. Son dos preocupaciones distintas y por eso
son dos programas — un dato puede ser impecable en su commit y estar podrido dos
años después sin que nadie haya tocado una línea.

    python pipeline/vigilar.py              # todo
    python pipeline/vigilar.py --sin-red    # solo la caducidad, sin salir

Dos vigilancias (CONTRATO-DATOS.md §7):

  - **Caducidad.** Una capa que pasa de su `cadencia_revision_dias` desde
    `verificado_a` lleva demasiado sin que un humano la mire. Offline.
  - **URLs muertas.** Toda fuente citada por URL. Muerta significa **404 o 410**:
    el documento ya no está. Un 403 o un 405 son ministerios que bloquean bots, y
    tratarlos como muerte es la forma segura de que este guion acabe desactivado
    a las tres semanas — el mismo aviso que `pruebas/correr.py` se hace a sí mismo.
    Esos se reportan aparte, como NO CONCLUYENTE, y no disparan la alarma.

Doctrina de este fichero:

  - **Jamás escribe datos.** Ni corrige, ni marca, ni abre expedientes. Señala, y
    el criterio humano decide (§12.6, y D7 del proyecto: la máquina instruye, la
    persona firma).
  - **No abre issues.** Avisa fallando: la Action se pone roja y GitHub avisa.
    Abrir issues exigiría dar permiso de ESCRITURA a un workflow programado de un
    repo público, y eso hay que justificarlo mejor que con la comodidad de tener
    historial. Si algún día pesa, se añade; al revés no se nota.
  - **Sin dependencias.** Solo biblioteca estándar.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"

ESPERA = 30           # segundos por petición
MUERTOS = {404, 410}  # y solo estos: el documento ya no está

ALARMA = "ALARMA"
NOTA = "NOTA"


@dataclass(frozen=True)
class Aviso:
    nivel: str      # ALARMA (rompe la guardia) · NOTA (se informa y ya)
    asunto: str     # la capa, o la URL
    mensaje: str

    def __str__(self) -> str:
        return f"  {self.nivel:<7} {self.asunto}\n{' ' * 10}{self.mensaje}"


# ─────────────────────────── caducidad ───────────────────────────

def caducidad(manifiesto: dict, hoy: date) -> list[Aviso]:
    """§3 · `cadencia_revision_dias` desde `verificado_a`. Sin red."""
    out = []
    for capa in manifiesto.get("capas", []):
        if capa.get("en_preparacion"):
            continue  # una rama en gris no tiene nada que revisar
        cid = capa.get("id", "(sin id)")
        cadencia = capa.get("cadencia_revision_dias")
        crudo = capa.get("verificado_a")
        if not cadencia or not crudo:
            out.append(Aviso(NOTA, cid,
                             "Publica datos y no declara `cadencia_revision_dias` "
                             "o `verificado_a`: nadie puede saber si ha caducado."))
            continue
        try:
            visto = date.fromisoformat(crudo)
        except ValueError:
            out.append(Aviso(NOTA, cid, f"`verificado_a` no es una fecha: {crudo!r}."))
            continue

        dias = (hoy - visto).days
        if dias > cadencia:
            out.append(Aviso(ALARMA, cid,
                             f"Sin revisar desde {crudo}: {dias} días, y su cadencia "
                             f"es {cadencia}. Toca pasada de verificación humana — o "
                             f"subir la cadencia a conciencia, no por comodidad."))
    return out


# ─────────────────────────── URLs ───────────────────────────

def clasificar(codigo: int | None, error: str | None) -> tuple[str, str]:
    """De un código de respuesta a un veredicto. Función pura: se prueba sin red.

    La frontera es estrecha a propósito. «Muerta» es una afirmación fuerte —dice
    que la cita del atlas ya no se puede seguir— y solo la sostienen 404 y 410.
    """
    if codigo in MUERTOS:
        return ALARMA, f"HTTP {codigo}: el documento ya no está donde se citó."
    if codigo is not None and 200 <= codigo < 400:
        return "", ""
    if codigo is not None:
        return NOTA, (f"HTTP {codigo}. No concluyente: puede ser bloqueo de bots o "
                      f"una caída pasajera, no que el documento haya desaparecido.")
    return NOTA, f"Sin respuesta ({error}). No concluyente."


def desajuste(tipo: str | None, url: str | None) -> str:
    """El «200 que miente». Función pura: se prueba sin red.

    Medido sobre las fuentes de este atlas: `web.igme.es` devuelve **HTTP 200**
    para un PDF que no existe, sirviendo una página de error en HTML; y EUR-Lex
    hace lo mismo con una referencia inventada. Un vigilante que solo mire el
    código estaría verde para siempre mientras las citas se pudren, que es peor
    que no tener vigilante: da una garantía falsa.

    La señal está en la **URL**, no en la copia archivada. Si la URL termina en
    `.pdf`, promete un PDF, y servir HTML es un enlace roto. Mirar en cambio la
    extensión del fichero de `fuentes/` fue el primer intento y estaba MAL: se
    archiva en PDF lo que se consultó en una página HTML —es lo que pasa con la
    Decisión del DOUE, cuya URL `/oj` es una portada legítima— y esa regla la
    marcaba como muerta cada semana. Un vigilante con falsos positivos se apaga,
    y entonces no vigila nada.

    Cuando la URL no promete formato no hay señal barata, y eso se DICE en la
    salida en vez de disimularse.
    """
    if not tipo or not url:
        return ""
    camino = urllib.parse.urlsplit(url).path.lower()
    if camino.endswith(".pdf") and "pdf" not in tipo.lower():
        return (f"HTTP 200 pero sirve «{tipo.split(';')[0]}» para una URL que "
                f"termina en «.pdf». Es el «200 que miente»: el servidor responde "
                f"con una página de error en vez del documento.")
    return ""


def promete_formato(url: str) -> bool:
    """¿Se puede comprobar de verdad esta URL? Solo si promete un formato."""
    return urllib.parse.urlsplit(url).path.lower().endswith(".pdf")


def tocar(url: str) -> tuple[int | None, str | None, str | None]:
    """HEAD y, si no gusta, GET. Muchos servidores oficiales no admiten HEAD.

    Devuelve también el `Content-Type`, que es lo único que delata un soft-404.
    """
    for metodo in ("HEAD", "GET"):
        peticion = urllib.request.Request(
            url, method=metodo,
            headers={"User-Agent": "atlas-estrategico-espana (vigilar.py)"})
        try:
            with urllib.request.urlopen(peticion, timeout=ESPERA) as r:
                return r.status, None, r.headers.get("Content-Type")
        except urllib.error.HTTPError as e:
            if metodo == "HEAD" and e.code in (403, 405, 501):
                continue  # el servidor no quiere HEAD; se prueba con GET
            return e.code, None, None
        except Exception as e:  # red, DNS, TLS, timeout
            if metodo == "HEAD":
                continue
            return None, type(e).__name__, None
    return None, "sin respuesta", None


def urls_citadas(manifiesto: dict) -> dict[str, dict]:
    """Toda URL de toda fuente publicada, con quién la cita y qué copia archivada
    le corresponde. Deduplicada: una URL citada por ocho registros se comprueba
    una vez."""
    citas: dict[str, dict] = {}
    for capa in manifiesto.get("capas", []):
        fichero = capa.get("fichero")
        if not fichero:
            continue
        doc = json.loads((DATOS / fichero).read_text(encoding="utf-8"))
        for f in doc.get("features", []):
            quien = f.get("id", "(sin id)")
            for fuente in f.get("properties", {}).get("fuentes", []):
                url = fuente.get("url")
                if not url:
                    continue
                cita = citas.setdefault(url, {"quienes": [], "archivo": None})
                cita["quienes"].append(quien)
                cita["archivo"] = cita["archivo"] or fuente.get("archivo")
    return citas


def enlaces(citas: dict[str, dict]) -> tuple[list[Aviso], int]:
    """Devuelve los avisos y cuántas URLs quedan SIN comprobar de verdad — las
    que responden 200 con una copia archivada que no es PDF, donde un soft-404 es
    indistinguible del documento. Ese número se dice en voz alta."""
    out, ciegas = [], 0
    for url, cita in sorted(citas.items()):
        codigo, error, tipo = tocar(url)
        nivel, mensaje = clasificar(codigo, error)
        if not nivel:
            mentira = desajuste(tipo, url)
            if mentira:
                nivel, mensaje = ALARMA, mentira
            else:
                ciegas += not promete_formato(url)
                continue
        quienes = cita["quienes"]
        cuantos = f"{len(quienes)} registros" if len(quienes) > 1 else quienes[0]
        out.append(Aviso(nivel, url, f"{mensaje} La citan: {cuantos}."))
    return out, ciegas


# ─────────────────────────── orquestación ───────────────────────────

def main(argv: list[str]) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    sin_red = "--sin-red" in argv
    manifiesto = json.loads((DATOS / "manifest.json").read_text(encoding="utf-8"))

    avisos = caducidad(manifiesto, date.today())
    citas: dict[str, dict] = {}
    ciegas = 0
    if not sin_red:
        citas = urls_citadas(manifiesto)
        nuevos, ciegas = enlaces(citas)
        avisos += nuevos

    alarmas = [a for a in avisos if a.nivel == ALARMA]
    notas = [a for a in avisos if a.nivel == NOTA]

    for a in alarmas + notas:
        print(a)

    print()
    if ciegas:
        # Lo que esta guardia NO puede comprobar, dicho antes que el resultado.
        # Un «sin alarmas» que se lea como «todas las citas siguen vivas» sería
        # justo la garantía falsa que este repo se pasa el día evitando.
        print(f"  {ciegas} URL(s) responden 200 y NO se pueden comprobar de verdad:")
        print("  su ruta no promete formato, así que un «200 que miente» —una página")
        print("  de error servida como éxito, que EUR-Lex y el IGME hacen— es")
        print("  indistinguible del documento. Para esas, la garantía es `fuentes/`,")
        print("  no esta comprobación.\n")

    publicadas = sum(1 for c in manifiesto["capas"] if c.get("fichero"))
    revisado = f"{publicadas} capa(s)" + ("" if sin_red else f" y {len(citas)} URL(s)")
    if alarmas:
        print(f"✗ {len(alarmas)} alarma(s) sobre {revisado}."
              f"{f' {len(notas)} nota(s).' if notas else ''}")
        print("  La guardia avisa; no corrige. Lo que toca es una pasada humana:")
        print("  este guion JAMÁS escribe datos (§12.6).")
        return 1

    print(f"✓ Sin alarmas sobre {revisado}."
          f"{f' {len(notas)} nota(s), que no son muerte de nada.' if notas else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
