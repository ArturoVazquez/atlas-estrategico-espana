# PLAN.md — Atlas Estratégico de España

Fases de construcción. Cada fase tiene criterio de hecho verificable.
Flujo: Claude Code propone plan por fase → Arturo revisa → se construye.

---

## F0 · Esqueleto del repositorio — ✅ HECHA (2026-08-05)

- ~~Estructura según CONTRATO-DATOS.md §2~~ + `referencia/`, `pipeline/pruebas/`
  y `.github/workflows/`, que el §2 no dibujaba y ahora sí.
- ~~`manifest.json` y `vocabularios.json` de arranque.~~ Las **quince** capas van
  `en_preparacion`, porque ninguna tiene datos: la regla del horizonte aplicada
  al propio manifiesto. Los vocabularios llevan **rótulo y definición** por
  valor, no solo el enum — así el panel de F2 no hereda castellano en el código.
- ~~JSON Schema: `nucleo` + `minerales-proyectos`.~~ Sin `$ref` entre ficheros:
  dos pasadas sobre el mismo documento, como pide §7.1. Los enums **no** se
  repiten en el esquema; se validan contra `vocabularios.json`.
- ~~`validar.py` + GitHub Action.~~ Corre en PR **y** en push a `main`, y el CI
  prueba primero el validador y solo después los datos: un validador roto pasa
  cualquier cosa en verde, y una garantía falsa es peor que ninguna.
- ~~Redactar CONTRATO-DATOS v1.1.~~ Hecho, con §13 de historial. Cerró además el
  matiz abierto de D3 y trajo el campo controlado `fase`.
- ~~⚠ Resolver D9.~~ **Público.** Ver DECISIONES.md D9.

**Hecho cuando:** ~~`validar.py` pasa en verde sobre un fichero de ejemplo y
falla correctamente ante cada violación de doctrina (probar las 5 reglas).~~

**Cumplido, y por encima:** `python pipeline/pruebas/correr.py` → **16 pruebas
en verde**. Se probaron las cinco reglas pedidas, las dos que la v1.1 añadió
(R6, R7) y las **siete comprobaciones de §7** que el criterio no exigía —
estaban escritas y sin ejercitar, y un control que nadie ejercita puede llevar
meses roto sin que se note. El runner no comprueba que el validador falle:
comprueba que falle **por la regla violada y por ninguna otra**.

> **Lo único que F0 deja a deber, y está dicho en el contrato:** la regla **R8**
> (un dominio `desarrollo`/`historico` no puede contener una mina en producción)
> es normativa desde la v1.1 pero **no tiene diente** hasta que exista la capa
> `minerales-dominios`, en F3. Es la única regla del contrato sin implementar.

## F1 · Primera colección real: minerales-proyectos — ✅ HECHA (2026-08-05)

> **Release `datos-v2026.08` publicada.** 11 registros (no 10: Escúzar salió del
> de Montevives, que la demo fundía en uno), 3 fuentes primarias archivadas, CI
> en verde. El detalle de lo corregido está en `CHANGELOG-DATOS.md`.
>
> ~~**Lo que queda a deber, y es lo grande:** la **geometría**.~~ **SALDADA el
> 2026-08-05**, release `datos-v2026.08.1`. Ocho de los once puntos son ya
> `paraje` con coordenada del Nomenclátor del IGN, fuente archivada y
> `geo_fuente__f` — seis con doble ancla, corroborados por el catastro minero.
> Los once se comprobaron por punto-en-polígono contra los límites del IGN.
> Contrato a 1.3.0, con **R9** poniéndole diente: una precisión que promete
> cartografía tiene que citarla. Detalle en `CHANGELOG-DATOS.md`.
>
> **Lo que la geometría dejó abierto, que no es poco:**
> - **Tres registros siguen en `municipio`**, ahora con el porqué documentado:
>   `circular` (planta industrial, sin derecho minero ni topónimo), `el-moto`
>   (957 topónimos barridos, ninguno dice «Moto») y `las-cruces`.
> - **`las-cruces` tiene un conflicto de municipio** y por eso bajó a `parcial`:
>   el topónimo del IGN cae en Guillena y la concesión toca Salteras, pero la
>   ficha dice Gerena y ese campo nunca tuvo fuente. Hace falta la autorización
>   ambiental o la resolución de la Junta con los términos afectados.
> - **Tres promotores donde la ficha y el catastro no coinciden** (`montevives`,
>   `el-moto`, `mina-doade`) y los permisos de `matamulas` figurando caducados.
>   Levantados con fuente delante, sin resolver.
>
> **Matamulas sigue siendo un hueco entero** en lo documental: falta la
> resolución de la Junta, la sentencia del TSJ de Castilla-La Mancha y el estado
> del recurso de casación ante el Tribunal Supremo. Sus dos fuentes primarias
> nuevas son de geometría y de existencia del permiso; no sustituyen al expediente.

### Lo que decía la fase

- Migrar los 10 registros de la demo v4 al formato canónico del contrato.
- Pasada de verificación: localizar y **archivar** en `fuentes/` los documentos
  primarios (decisión CE con anexo, no la nota de prensa); resolver o declarar
  los huecos (Montevive, Vicálvaro, Matamulas, promotor de El Moto).
- Primera release: `datos-v2026.MM` + entrada inaugural del changelog.

**Hecho cuando:** la colección valida en CI, cada `confirmado` tiene primaria
archivada, y los huecos existen como huecos, no como rellenos.

## F2 · Visor MapLibre (el salto de potencia) — CONSTRUIDO, falta el basemap

> **El criterio de hecho de esta fase estaba mal escrito, y se corrige aquí.**
> Decía «mismo contenido» que la v4. Eso es imposible sin romper la regla
> primera del proyecto: casi todo el contenido de la v4 —zonas minerales,
> eólico, solar, cables, disputas— es **ilustrativo y nunca se migró a
> `datos/`**. Portarlo exigiría inventarlo. F2 entrega el visor entero con la
> única capa que existe; el contenido es F3.

- ~~MapLibre GL JS; decisión de basemap al empezar la fase.~~ **Protomaps
  PMTiles autoalojado**, por coherencia: un atlas que archiva cada fuente porque
  las URLs se pudren no puede colgar su mapa base de la buena voluntad de un
  tercero. Estilo propio en papel y tinta, escrito a mano.
- ~~Portar del prototipo v4: panel de árboles + ramas en gris, filtro de
  explotación, fichas, leyenda.~~ Hecho. `activo` se **deriva** de `fase`
  (§6.5): la v4 lo tenía escrito a mano, que es lo que D3 descartó.
- ~~Capas desde la release etiquetada. Registro de capas desde el manifiesto.~~
  Hecho y **probado**: una capa de juguete añadida al manifiesto aparece en su
  árbol con su punto sin tocar una línea de panel. El build fija la etiqueta
  (`app/release.json` + `preparar-datos.mjs`), que es §8 cumplido de la única
  forma honesta en un sitio estático.
- Los glifos también van autoalojados, y los seis rangos se **midieron**
  navegando el territorio: entre ellos el árabe y el **tifinagh**, que nadie
  habría supuesto y que el vecindario del Rif necesita.

**Lo único que queda para cerrar F2, y no lo puede hacer Claude:** generar el
extracto PMTiles (Iberia + Baleares + Canarias + Magreb, zoom ≤14), subirlo a un
bucket propio y apuntar `VITE_BASEMAP`. Mientras tanto el visor tira del **bucket
de demostración de Protomaps**, y lo dice en su propio pie en rojo: publicar así
contradiría el motivo por el que se decidió autoalojarlo.

**Hecho cuando:** el basemap sea el extracto propio y el pie deje de avisar.

## F3 · Capas del listón de salida

- **Límites y soberanía** (verificada): pasada de instrumentos con fuente
  primaria archivada (Utrecht, listas ONU, leyes 37-17/38-17, Badajoz 1801,
  Viena art. 105; verificar fecha y naturaleza del acuerdo UE–RU sobre
  Gibraltar); zonas sin delimitar según doctrina D5.
- **Gas y regasificación**: las plantas de GNL con fuente Enagás/CNMC.
- **Nuclear**: los 7 reactores con calendario de cierre; fuentes CSN/MITECO.
- Dominios minerales: primer ascenso de una mancha ilustrativa a cartografía
  de fuente primaria (candidata: Faja Pirítica, IGME).
- **Punto → polígono en `minerales-proyectos`** (menor de capa, §8: mismo `id`).
  El catastro minero da el perímetro del derecho y ya está descargado y
  entendido — CRS resuelto, derechos multiparte detectados. Es el único camino a
  `geo_precision: exacta`, que §6.6 declara inalcanzable mientras la capa sea de
  puntos. Arrastra el manifiesto a `geometria: mixta` y obliga al visor de F2 a
  pintar las dos cosas: por eso no se hizo en F1.
- **R8 gana su diente** aquí: necesita `minerales-dominios` para poder
  comprobarse, y es **la única pieza del contrato sin implementar**.
- ~~`vigilar.py` + `vigilar.yml`.~~ **HECHO el 2026-08-05**, contrato 1.5.0: se
  adelantó a F3 y ya corre los lunes. Lo que dejó dicho, y conviene tener
  presente al añadir capas: EUR-Lex y el IGME devuelven **200 para documentos que
  no existen**, así que la guardia solo comprueba de verdad las URLs que prometen
  formato, y dice cuántas no puede.

**Hecho cuando:** las tres capas validan con su esquema propio y ninguna ficha
publicada contiene prensa sosteniendo un confirmado.

## F4 · Despliegue e integración editorial

- Deploy estático + CNAME `atlas.eltercioviejo.com` (DNS en Hostinger).
- Página "Método" pública: doctrina, contrato enlazado, cómo se corrige un dato.
- Hilo fijado en La hacienda presentando el atlas (voz de la casa); `debate_url`
  cableado en las fichas; changelog de la release como primera respuesta.

**Hecho cuando:** el subdominio sirve la release v1, la cadena
ficha → hilo → atlas funciona en ambos sentidos, y el foro tiene su hilo.

## Horizonte (post-v1, por orden acordado)

Red eléctrica e interconexiones → renovable por provincia → agua embalsada →
centros de datos → H2Med → PERTE acotado → intangibles (clase `analisis`,
ámbito mundo). El pipeline de expedientes de cambio (D7) cuando haya señales
reales con las que diseñarlo.
