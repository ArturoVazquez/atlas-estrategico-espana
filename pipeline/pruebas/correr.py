#!/usr/bin/env python3
"""Las pruebas del validador — el criterio de hecho de la fase F0.

PLAN.md lo pide con estas palabras: «`validar.py` pasa en verde sobre un fichero
de ejemplo y **falla correctamente ante cada violación de doctrina**».

«Correctamente» es la palabra que hace el trabajo. No basta con que el validador
falle: tiene que fallar por la regla que se ha violado **y por ninguna otra**.
Un validador que grita ante cualquier fichero raro no enseña nada a quien comete
el error, y acaba desactivado a las tres semanas.

    python pipeline/pruebas/correr.py
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
VALIDAR = AQUI.parent / "validar.py"

# fixture -> (códigos que DEBEN salir y ninguno más, código de salida esperado)
#
# El código de salida va explícito y no deducido de si hay hallazgos, porque el
# caso §7.7 es precisamente el que rompe esa correlación: señala algo y aun así
# sale en verde. Esa distinción es contrato (§7), no detalle de implementación.
CASOS: dict[str, tuple[set[str], int]] = {
    "valido.geojson":                                  (set(),      0),

    # Las reglas de doctrina de §6.4 — el criterio literal de F0.
    "invalido-r1-confirmado-sin-primaria.geojson":     ({"R1"},     1),
    "invalido-r2-confirmado-sin-fuente.geojson":       ({"R2"},     1),
    "invalido-r3-prensa-sostiene-confirmado.geojson":  ({"R3"},     1),
    "invalido-r4-hueco-con-confirmado.geojson":        ({"R4"},     1),
    "invalido-r5-ilustrativa-con-verificacion.geojson":({"R5"},     1),
    "invalido-r6-metadato-huerfano.geojson":           ({"R6"},     1),
    "invalido-r7-activo-escrito-a-mano.geojson":       ({"R7"},     1),

    # R9 va con DOS fixtures porque la regla tiene dos mitades y solo una es
    # obvia. La segunda es la que justifica que R9 exista: sin ella, R2 y R3
    # dejaban pasar una geometría «exacta» apoyada en una fuente corporativa,
    # con solo declararla «parcial». (R8 no tiene fixture: no tiene diente
    # todavía — necesita `minerales-dominios`, y el contrato lo dice en §6.5.)
    "invalido-r9-exacta-sin-fuente.geojson":           ({"R9"},     1),
    "invalido-r9-exacta-con-corporativa.geojson":      ({"R9"},     1),

    # Las comprobaciones de §7 que no son reglas de doctrina. F0 no las exigía;
    # están porque un control que nadie ejercita puede llevar meses roto sin que
    # se note, y este validador es lo único que separa el atlas de la
    # verosimilitud.
    "invalido-71-esquema.geojson":                     ({"§7.1"},   1),
    "invalido-72-identidad.geojson":                   ({"§7.2"},   1),
    "invalido-74-geometria-punto.geojson":             ({"§7.4"},   1),
    "invalido-74-geometria-anillo.geojson":            ({"§7.4"},   1),
    "invalido-75-fechas.geojson":                      ({"§7.5"},   1),
    "invalido-76-vocabulario.geojson":                 ({"§7.6"},   1),
    "aviso-77-fuente-sin-archivar.geojson":            ({"§7.7"},   0),
    "invalido-78-capa-fantasma.geojson":               ({"§7.8"},   1),
}

LINEA = re.compile(r"^\s+(BLOQUEA|AVISA)\s+(\S+)\s")


def correr(fixture: Path) -> tuple[int, set[str]]:
    proc = subprocess.run(
        [sys.executable, str(VALIDAR), str(fixture)],
        capture_output=True, text=True, encoding="utf-8",
    )
    salida = (proc.stdout or "") + (proc.stderr or "")
    codigos = {m.group(2) for m in (LINEA.match(l) for l in salida.splitlines()) if m}
    return proc.returncode, codigos


def main() -> int:
    fallos = []
    print("Pruebas del contrato con dientes\n")

    for nombre, (esperados, salida_esperada) in CASOS.items():
        fixture = AQUI / nombre
        if not fixture.exists():
            fallos.append(f"{nombre}: el fixture no existe")
            continue

        codigo, hallados = correr(fixture)

        problemas = []
        if codigo != salida_esperada:
            problemas.append(f"salió con {codigo} y debía salir con {salida_esperada}")

        faltan = esperados - hallados
        sobran = hallados - esperados
        if faltan:
            problemas.append(f"no señaló {', '.join(sorted(faltan))}")
        if sobran:
            problemas.append(f"señaló de más {', '.join(sorted(sobran))} "
                             f"— el fixture debería violar UNA sola cosa")

        etiqueta = ", ".join(sorted(esperados)) if esperados else "sin hallazgos"
        if salida_esperada == 0 and esperados:
            etiqueta += "  (avisa, no bloquea)"

        if problemas:
            fallos.append(f"{nombre}: {'; '.join(problemas)}")
            print(f"  ✗ {nombre}\n      esperado: {etiqueta}\n      {'; '.join(problemas)}")
        else:
            print(f"  ✓ {nombre:<52} {etiqueta}")

    print()
    if fallos:
        print(f"✗ {len(fallos)} prueba(s) del validador no cumplen.")
        return 1

    print(f"✓ {len(CASOS)} pruebas. El fichero válido pasa; cada incumplimiento se")
    print("  señala por su regla, y solo por la suya; y lo que avisa no bloquea.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
