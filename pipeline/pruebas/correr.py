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

sys.path.insert(0, str(AQUI.parent))

from validar import comprobar_procedencia  # noqa: E402

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

    # R8 es la única regla que compara DOS capas, así que su caso son dos
    # ficheros en la misma llamada: un dominio «desarrollo» y, dentro de él, una
    # mina en producción. Por separado los dos son válidos — que es justo lo que
    # hace a R8 necesaria: ningún fichero miente a solas, la mentira está en el
    # par. Tuvo diente desde el contrato 1.10; hasta entonces vivía escrita en
    # §6.5 y sin comprobarse.
    "invalido-r8-dominio-desarrollo.geojson + "
    "invalido-r8-mina-en-produccion.geojson":          ({"R8"},     1),

    # R9 va con DOS fixtures porque la regla tiene dos mitades y solo una es
    # obvia. La segunda es la que justifica que R9 exista: sin ella, R2 y R3
    # dejaban pasar una geometría «exacta» apoyada en una fuente corporativa,
    # con solo declararla «parcial».
    "invalido-r9-exacta-sin-fuente.geojson":           ({"R9"},     1),
    "invalido-r9-exacta-con-corporativa.geojson":      ({"R9"},     1),

    # La tercera fixture de R9 (1.16) no repite las otras dos: prueba que el
    # valor NUEVO de `geo_precision` está dentro de la regla. `proyectada` es la
    # que más lo necesita —cuando el objeto no existe, saber quién dibujó la
    # línea es la única garantía que queda— y era la más fácil de dejar fuera,
    # porque se añade en un enum y R9 vive en otro sitio.
    "invalido-r9-proyectada-sin-fuente.geojson":       ({"R9"},     1),

    # R10 (1.16) · Lo declarado contra lo dibujado. Sale de una trampa real: la
    # fuente sirve la longitud en metros de Web Mercator, inflados por la
    # latitud hasta un 38 %. Este caso declara 440 km sobre una geometría de 324.
    "invalido-r10-longitud-mercator.geojson":          ({"R10"},    1),

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
    # El segundo caso que AVISA sin bloquear. Una categoría que se usa y no
    # declara `color` deja al visor pintándola con el de reserva: el dato es
    # correcto y lo que se pierde es poder distinguir la capa. No bloquea por
    # eso mismo, y avisa porque el fallo ya se coló tres veces — la última en
    # `cables-submarinos`, que estuvo una release entera indistinguible.
    "aviso-9-categoria-sin-color.geojson":             ({"§9"},     0),

    # La comprobación propia de `generacion-electrica-provincia` (§10): su
    # `categoria` es la tecnología DOMINANTE, o sea un derivado de las cifras del
    # propio registro. Se escribe en el fichero porque da color al mapa, y solo
    # se puede escribir porque el CI lo desmiente. Este caso declara «hidraulica»
    # con la eólica al quíntuple.
    "invalido-10-dominante-que-no-cuadra.geojson":     ({"§10"},    1),

    # La comprobación propia de `perte` (§10), y nace del mismo susto: su fuente
    # es un registro por comisiones de verificación en el que un expediente
    # REAPARECE revisado. Quedarse con las dos apariciones pone dos veces la
    # misma fábrica en el mapa y suma su dinero dos veces. Este caso es el real —
    # BeePlanet, de 447.269 a 626.177 € entre dos comisiones.
    "invalido-10-plan-repetido.geojson":               ({"§10"},    1),

    # Las dos de `idioma` (§10). La primera es hermana de la anterior: dos
    # registros del mismo país publican estatutos contradictorios y el mapa no
    # dice cuál rige.
    "invalido-10-pais-repetido.geojson":               ({"§10"},    1),

    # La segunda es de coherencia ENTRE DOS CAMPOS, y por eso el esquema no la
    # ve: cada uno es válido por su cuenta. Decir `sin_norma_expresa` y a la vez
    # que la norma la llama «castellano» es contradecirse en dos líneas
    # seguidas — el error que se cuela al copiar un registro para hacer el
    # siguiente. Ocupa el sitio de una comprobación que se retiró antes de
    # publicar porque el esquema ya la hacía, y fue su propia fixture la que lo
    # delató al señalar §7.1 además de §10.
    "invalido-10-estatuto-contradictorio.geojson":     ({"§10"},    1),
}

# §7.9 · La ficha de procedencia. No lleva fixture GeoJSON porque no mira dentro
# de una colección: compara el manifiesto con un documento en prosa. Se ejercita
# como se ejercita `vigilar.py` —importando la función pura y dándole entradas
# sintéticas—, que es el único modo de ver morder al diente sin romper el repo.
#
# nombre -> (manifiesto, texto del documento o None, ids que deben salir señalados)
MANIFIESTO_PRUEBA = {"capas": [
    {"id": "con-datos", "fichero": "capas/con-datos.geojson"},
    {"id": "en-gris"},                      # rama del horizonte: no debe exigir ficha
]}

CASOS_PROCEDENCIA: dict[str, tuple[dict, str | None, set[str]]] = {
    "procedencia · la ficha está":
        (MANIFIESTO_PRUEBA, "# Procedencia\n\n## con-datos\n\ntexto\n", set()),

    # El fallo real que esta comprobación existe para cazar: se añade la capa, se
    # publica, y la ficha se escribe «luego».
    "procedencia · capa publicada sin ficha":
        (MANIFIESTO_PRUEBA, "# Procedencia\n\n## Lo que vale para todas\n", {"con-datos"}),

    # Una rama en gris no tiene datos, así que no debe exigirle procedencia a
    # nadie. Si esto fallara, el horizonte de §3 sería inhabitable.
    "procedencia · la rama en gris no la exige":
        (MANIFIESTO_PRUEBA,
         "## con-datos\n\n## Cuaderno de obtención\n", set()),

    # El recíproco: una ficha que sobrevive a su capa. Señala al revés — o falta
    # la entrada en el manifiesto, o el documento quedó desfasado.
    "procedencia · ficha huérfana":
        (MANIFIESTO_PRUEBA, "## con-datos\n\n## capa-fantasma\n", {"capa-fantasma"}),

    "procedencia · el documento entero no existe":
        (MANIFIESTO_PRUEBA, None, {"fuentes/PROCEDENCIA.md"}),
}

LINEA = re.compile(r"^\s+(BLOQUEA|AVISA)\s+(\S+)\s")


def correr(fixtures: list[Path]) -> tuple[int, set[str]]:
    proc = subprocess.run(
        [sys.executable, str(VALIDAR), *(str(f) for f in fixtures)],
        capture_output=True, text=True, encoding="utf-8",
    )
    salida = (proc.stdout or "") + (proc.stderr or "")
    codigos = {m.group(2) for m in (LINEA.match(l) for l in salida.splitlines()) if m}
    return proc.returncode, codigos


def main() -> int:
    fallos = []
    print("Pruebas del contrato con dientes\n")

    for nombre, (esperados, salida_esperada) in CASOS.items():
        # Un caso puede necesitar DOS ficheros: R8 compara dos capas, así que no
        # existe un fixture que la viole a solas.
        fixtures = [AQUI / n for n in nombre.split(" + ")]
        if faltantes := [f.name for f in fixtures if not f.exists()]:
            fallos.append(f"{nombre}: no existe(n) {', '.join(faltantes)}")
            continue

        codigo, hallados = correr(fixtures)

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

    for nombre, (manifiesto, texto, esperados) in CASOS_PROCEDENCIA.items():
        hallazgos = comprobar_procedencia(manifiesto, texto)
        señalados = {h.donde for h in hallazgos}
        niveles = {h.nivel for h in hallazgos}

        problemas = []
        if señalados != esperados:
            if faltan := esperados - señalados:
                problemas.append(f"no señaló {', '.join(sorted(faltan))}")
            if sobran := señalados - esperados:
                problemas.append(f"señaló de más {', '.join(sorted(sobran))}")
        if hallazgos and niveles != {"BLOQUEA"}:
            problemas.append("§7.9 tiene que bloquear, no avisar")

        etiqueta = "§7.9  " + (", ".join(sorted(esperados)) if esperados else "sin hallazgos")
        if problemas:
            fallos.append(f"{nombre}: {'; '.join(problemas)}")
            print(f"  ✗ {nombre}\n      esperado: {etiqueta}\n      {'; '.join(problemas)}")
        else:
            print(f"  ✓ {nombre:<52} {etiqueta}")

    total = len(CASOS) + len(CASOS_PROCEDENCIA)
    print()
    if fallos:
        print(f"✗ {len(fallos)} prueba(s) del validador no cumplen.")
        return 1

    print(f"✓ {total} pruebas. El fichero válido pasa; cada incumplimiento se")
    print("  señala por su regla, y solo por la suya; y lo que avisa no bloquea.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
