#!/usr/bin/env python3
"""Pruebas de `consultar.py` — la parte que decide, y solo esa.

`dentro()` es lo que responde «¿esta coordenada cae en este municipio?». Si se
rompe, el atlas aprueba en silencio un punto en el término equivocado: un fallo
que no da error, no rompe el esquema y no lo ve nadie. Justo la clase de cosa
que este proyecto valida en vez de confiar.

Se prueba **offline y con polígonos a mano**. Ni una llamada a la red: el resto
de `consultar.py` son consultas al IGN y al catastro, y probar eso sería probar
que el ministerio está levantado, que no es asunto del repo. Por el mismo motivo
`consultar.py` no corre en CI y este fichero sí.

    python pipeline/pruebas/correr-consultar.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from consultar import dentro, medir, vertices  # noqa: E402

# Un cuadrado de 10x10 con un hueco central de 4x4. Exterior antihorario y hueco
# horario, como pide RFC 7946 — que es como vienen los límites del IGN.
CON_HUECO = {
    "type": "Polygon",
    "coordinates": [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[4, 4], [4, 6], [6, 6], [6, 4], [4, 4]],
    ],
}

# Dos piezas separadas: un municipio con enclave, o un derecho minero
# multiparte. El caso que hizo caer el centroide de «LAS CRUCES» fuera.
DOS_PIEZAS = {
    "type": "MultiPolygon",
    "coordinates": [
        [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
        [[[8, 8], [10, 8], [10, 10], [8, 10], [8, 8]]],
    ],
}

CASOS = [
    ("dentro del polígono",                 dentro(5, 2, CON_HUECO),      True),
    ("fuera del polígono",                  dentro(20, 20, CON_HUECO),    False),
    ("dentro del hueco NO cuenta",          dentro(5, 5, CON_HUECO),      False),
    ("justo fuera del hueco sí cuenta",     dentro(5, 3.9, CON_HUECO),    True),
    ("multipolígono: en la primera pieza",  dentro(1, 1, DOS_PIEZAS),     True),
    ("multipolígono: en la segunda pieza",  dentro(9, 9, DOS_PIEZAS),     True),
    ("multipolígono: en el aire de enmedio", dentro(5, 5, DOS_PIEZAS),    False),
    ("geometría que no es polígono",        dentro(5, 5, {"type": "Point",
                                                          "coordinates": [5, 5]}), False),
    ("polígono vacío no revienta",          dentro(5, 5, {"type": "Polygon",
                                                          "coordinates": []}), False),
]

# El lector del catastro, sobre una línea real del CSV del MITECO (Badajoz).
# Una cuadrícula minera: 1' de longitud por 20'' de latitud.
LINEA = ("EJEMPLO/EMPRESA/BADAJOZ/Otorgado/Concesión/12/12100/Granito//89.55/H/C///"
         "(5° 42' 44.82'' W, 38° 38' 15.55'' N)(5° 41' 44.82'' W, 38° 38' 15.55'' N)"
         "(5° 41' 44.82'' W, 38° 37' 55.55'' N)(5° 42' 44.82'' W, 38° 37' 55.55'' N)"
         "(5° 42' 44.82'' W, 38° 38' 15.55'' N)")

VS = vertices(LINEA)
MEDIDA = medir(VS)

CASOS += [
    ("el catastro da 5 vértices",           len(VS), 5),
    ("longitud W sale negativa",            VS[0][0] < 0, True),
    ("latitud N sale positiva",             VS[0][1] > 0, True),
    ("centroide dentro de su propio anillo", dentro(MEDIDA[0], MEDIDA[1],
                                                    {"type": "Polygon", "coordinates": [VS]}), True),
    ("una sola pieza, no multiparte",       MEDIDA[4], False),
]


def main() -> int:
    print("Pruebas de consultar.py — el punto-en-polígono y el lector del catastro\n")
    fallos = []
    for nombre, obtenido, esperado in CASOS:
        if obtenido == esperado:
            print(f"  ✓ {nombre}")
        else:
            print(f"  ✗ {nombre}\n      esperado {esperado!r}, obtenido {obtenido!r}")
            fallos.append(nombre)

    print()
    if fallos:
        print(f"✗ {len(fallos)} prueba(s) de consultar.py no cumplen.")
        return 1
    print(f"✓ {len(CASOS)} pruebas. El punto-en-polígono distingue el hueco del")
    print("  relleno y las piezas sueltas del aire que hay entre ellas.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
