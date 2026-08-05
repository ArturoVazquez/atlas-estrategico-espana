#!/usr/bin/env python3
"""Pruebas de `vigilar.py` — dónde pone la frontera, que es todo lo que importa.

Un vigilante se juzga por sus falsos positivos. Si grita cada semana porque
EUR-Lex devuelve 403 a un bot, alguien lo apaga y entonces no vigila nada: el
fallo no sería el 403, sería el silencio de después. Por eso lo que se prueba
aquí es exactamente **qué cuenta como muerte y qué no**.

Offline, sin una sola petición: `clasificar()` y `caducidad()` son funciones
puras. Probar que EUR-Lex responde sería probar que la Unión Europea está
levantada, y eso no es asunto de este repo.

    python pipeline/pruebas/correr-vigilar.py
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from vigilar import ALARMA, NOTA, caducidad, clasificar, desajuste  # noqa: E402


def nivel(codigo, error=None):
    return clasificar(codigo, error)[0] or "ok"


def manifiesto(**capa):
    return {"capas": [{"id": "prueba", **capa}]}


HOY = date(2026, 8, 5)


def avisos(**capa):
    return caducidad(manifiesto(**capa), HOY)


def solo_nivel(lista):
    return [a.nivel for a in lista]


CASOS = [
    # ── la frontera de la muerte ──────────────────────────────────────────
    ("200 está viva",                        nivel(200),          "ok"),
    ("301 está viva (redirección)",          nivel(301),          "ok"),
    ("399 sigue del lado bueno",             nivel(399),          "ok"),
    ("404 es muerte",                        nivel(404),          ALARMA),
    ("410 es muerte",                        nivel(410),          ALARMA),
    ("403 NO es muerte: bloqueo de bots",    nivel(403),          NOTA),
    ("405 NO es muerte: no admite HEAD",     nivel(405),          NOTA),
    ("429 NO es muerte: demasiadas peticiones", nivel(429),       NOTA),
    ("500 NO es muerte: el servidor falla",  nivel(500),          NOTA),
    ("503 NO es muerte: mantenimiento",      nivel(503),          NOTA),
    ("sin respuesta NO es muerte",           nivel(None, "TimeoutError"), NOTA),
    # 401 es el caso que más tienta a marcar muerto y no lo es: el documento
    # está, lo que falta es la llave.
    ("401 NO es muerte: falta autorización", nivel(401),          NOTA),

    # ── el «200 que miente» ───────────────────────────────────────────────
    # Medido contra las fuentes reales: web.igme.es devuelve 200 y una página
    # HTML de error para un PDF inexistente. Sin esto, la guardia estaría verde
    # para siempre mientras la cita se pudre.
    ("URL .pdf que sirve PDF: bien",
     desajuste("application/pdf", "https://web.igme.es/a/ESTRONCIO%202021.pdf") == "", True),
    ("URL .pdf que sirve HTML: es el 200 que miente",
     desajuste("text/html", "https://web.igme.es/a/NO-EXISTE.pdf") != "", True),
    ("mayúsculas y parámetros no despistan",
     desajuste("Application/PDF; charset=binary", "https://x/A.PDF?v=2") == "", True),
    # El caso que un primer intento marcaba como muerto cada semana: la URL de la
    # Decisión del DOUE es una PORTADA en HTML, y el PDF de `fuentes/` se sacó de
    # ella. La URL no promete formato, así que no hay nada que reprocharle.
    ("portada HTML del DOUE: no es mentira, es una portada",
     desajuste("text/html", "https://eur-lex.europa.eu/eli/dec/2025/840/oj") == "", True),
    ("la consulta con query no confunde a la extensión",
     desajuste("application/json",
               "https://api-features.ign.es/collections/namedplace/items?etiqueta=X") == "", True),
    ("sin URL no se puede afirmar nada",
     desajuste("text/html", None) == "", True),
    ("sin content-type tampoco",
     desajuste(None, "https://x/a.pdf") == "", True),

    # ── caducidad ─────────────────────────────────────────────────────────
    ("dentro de su cadencia, callado",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="2026-07-01",
                       cadencia_revision_dias=120)), []),
    ("pasada de cadencia, alarma",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="2026-01-01",
                       cadencia_revision_dias=120)), [ALARMA]),
    ("justo en el límite todavía no caduca",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="2026-04-07",
                       cadencia_revision_dias=120)), []),
    ("un día más y caduca",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="2026-04-06",
                       cadencia_revision_dias=120)), [ALARMA]),
    ("una rama en preparación no se vigila",
     solo_nivel(avisos(en_preparacion=True)), []),
    ("publica y no dice su cadencia: nota",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="2026-07-01")), [NOTA]),
    ("fecha ilegible: nota, no alarma",
     solo_nivel(avisos(fichero="c.geojson", verificado_a="ayer",
                       cadencia_revision_dias=120)), [NOTA]),
]


def main() -> int:
    print("Pruebas de vigilar.py — qué cuenta como muerte y qué no\n")
    fallos = []
    for nombre, obtenido, esperado in CASOS:
        if obtenido == esperado:
            print(f"  ✓ {nombre}")
        else:
            print(f"  ✗ {nombre}\n      esperado {esperado!r}, obtenido {obtenido!r}")
            fallos.append(nombre)

    print()
    if fallos:
        print(f"✗ {len(fallos)} prueba(s) de vigilar.py no cumplen.")
        return 1
    print(f"✓ {len(CASOS)} pruebas. Solo 404 y 410 son muerte; lo demás se informa")
    print("  sin dar la alarma, que es lo que impide que la guardia se apague.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
