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

> ~~**Lo único que F0 deja a deber, y está dicho en el contrato:** la regla
> **R8**… es la única regla del contrato sin implementar.~~ **SALDADA el
> 2026-08-06** con la capa `minerales-dominios` (contrato 1.10, release
> `datos-v2026.08.6`). Ninguna regla de §6.4 es ya prosa: las nueve las comprueba
> el CI.

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

- ~~**Límites y soberanía** (verificada): pasada de instrumentos con fuente
  primaria archivada.~~ **HECHA el 2026-08-06**, release `datos-v2026.08.3`.
  Ocho territorios con la simetría `administrado_por` / `reclamado_por`, que es
  D5 puesta en datos. El **acuerdo UE–RU sobre Gibraltar queda verificado**:
  firmado el 14 de julio de 2026, en aplicación provisional desde el 15, sin
  ratificar (Decisión (UE) 2026/1732 del Consejo, archivada).
  - **Lo que NO se pudo archivar:** Utrecht, Badajoz 1801 y Viena art. 105 — los
    tres tratados que se citan en cada discusión — no aparecen con emisor
    autorizado, ni la lista de la ONU (su servidor bloquea la descarga).
    ~~Tampoco ningún instrumento marroquí.~~ **Ese sí:** estaba en `sgg.gov.ma`,
    Boletín Oficial n.º 6870 (ver abajo).
  - ~~**Pendiente:** las **zonas sin delimitar**…~~ **HECHAS el 2026-08-06**,
    release `datos-v2026.08.7`, en su propia capa `espacios-maritimos`.
    - **La premisa de esta línea era falsa y conviene que quede tachada:** un
      polígono ilustrativo **no** activa R5 sobre la capa. R5 va de la capa
      hacia la geometría —capa ilustrativa ⇒ geometría ilustrativa— y **no al
      revés**; R9 solo vigila `exacta` y `paraje`. La capa es `verificado` y
      contiene una zona `ilustrativa` sin conflicto alguno.
    - **El hallazgo:** ni la ley 37-17 ni la 38-17 **contienen una sola
      coordenada**. La 37-17 remite las líneas de base a un reglamento
      posterior; la 38-17 manda delimitar «a fin de alcanzar un resultado
      equitativo» con los Estados vecinos. No trazan ninguna línea.
    - Y lo que sí traza una línea: los **448 puntos fijos** que España depositó
      ante la CLCS en 2014 — la primera geometría `exacta` del tablero.
- ~~**Gas y regasificación**: las plantas de GNL con fuente Enagás/CNMC.~~
  **HECHA el 2026-08-06**, release `datos-v2026.08.4`. Ojo con cómo estaba
  escrita esta línea: **Enagás es una sociedad cotizada**, así que es fuente
  `corporativa` y por R3 no sostiene un confirmado. Lo primario es el BOE y la
  CNMC. Y la capacidad de almacenamiento en m³ —la cifra que todo el mundo
  cita— **no la publica nadie en documento accesible**: queda como hueco
  declarado en las siete fichas.
- ~~**Nuclear**: los 7 reactores con calendario de cierre; fuentes CSN/MITECO.~~
  **HECHA el 2026-08-06**, release `datos-v2026.08.2`. Un registro por reactor,
  con dos campos de fecha: lo **autorizado** (orden del BOE) y lo **acordado**
  (calendario de 2019). Lo segundo resultó no tener documento público —es un
  protocolo privado— así que va vacío y declarado en cinco de los siete, en vez
  de rellenarse con la fecha que cita todo el mundo. La prórroga de Almaraz no
  mueve ninguna fecha mientras MITECO no resuelva.
- ~~Dominios minerales~~ **HECHOS el 2026-08-06**, release `datos-v2026.08.6`.
  Los 16 de la demo, primera capa de polígonos, todos `ilustrativo` y todos con
  su hueco declarado. El anillo de «Oro del noroeste» venía en sentido horario y
  se invirtió al migrar (RFC 7946).
  - **El ascenso a cartografía primaria NO se hizo**, y ahora se sabe por qué no
    puede hacerse de uno en uno: **R5 es regla de capa, no de registro**.
    Verificar la Faja Pirítica con el IGME obligaría a verificar las quince
    restantes —o a partir la capa en dos, que es probablemente la salida.
- ~~**Punto → polígono en `minerales-proyectos`**… Es el único camino a
  `geo_precision: exacta`.~~ **DESCARTADO el 2026-08-06, con motivo**, y en su
  lugar nace `minerales-derechos` (release `datos-v2026.08.8`).
  - **Lo que invalida la tarea tal y como estaba escrita:** el catastro define
    **derechos, no minas**. Qué derecho «es» un proyecto no lo contesta ningún
    documento — TOLSA tiene **54 derechos solo en Madrid**. Elegir uno sería una
    atribución sin fuente, y §6.6 lo recoge ya como doctrina.
  - **`geo_precision: exacta` SÍ se alcanza**, pero sobre el derecho, que es el
    objeto que la fuente define. Los once proyectos siguen en `paraje` y
    `municipio`, declarado.
  - **Y el CSV del catastro que este proyecto usó en F1 está TRUNCADO** a 424
    caracteres: 38 de 106 derechos pierden vértices, 29 de ellos una esquina
    real. Sirve para nombres y titulares —que es a lo que se usó— y **no sirve
    para geometría**. El shapefile del mismo endpoint sí, y su `.prj` confirma
    ETRS89 por la fuente.
- ~~**R8 gana su diente** aquí~~ **GANADO el 2026-08-06.** Es la **única regla
  que compara dos capas**, así que no cabe en la validación por fichero: vive en
  `main()`, se comprueba cuando ambas entran en la misma pasada —siempre, en
  CI— y calla con una sola. Su caso de prueba estrena forma: **dos fixtures**
  que por separado son impecables. Ninguno miente a solas; la mentira está en
  lo que dicen juntos, y ese es todo el argumento de R8. El punto-en-polígono se
  **mudó** de `consultar.py` a `validar.py` en vez de copiarse.
- ~~`vigilar.py` + `vigilar.yml`.~~ **HECHO el 2026-08-05**, contrato 1.5.0: se
  adelantó a F3 y ya corre los lunes. Lo que dejó dicho, y conviene tener
  presente al añadir capas: EUR-Lex y el IGME devuelven **200 para documentos que
  no existen**, así que la guardia solo comprueba de verdad las URLs que prometen
  formato, y dice cuántas no puede.

~~**Hecho cuando:** las tres capas validan con su esquema propio y ninguna ficha
publicada contiene prensa sosteniendo un confirmado.~~ **CUMPLIDO el
2026-08-06**: cuatro capas publicadas y validando, y ninguna cifra no primaria
sostiene un confirmado en ninguna de ellas.

**F3 está cerrada del todo desde el 2026-08-06.** Seis capas publicadas y
validando, ninguna regla del contrato sin diente, y ninguna cifra no primaria
sosteniendo un confirmado en ninguna de ellas.

~~Sigue pendiente, y ya no es de F3: el **punto → polígono de
`minerales-proyectos`**.~~ **Resuelto por otra vía el 2026-08-06** — ver arriba:
se descarta con motivo y en su lugar entra `minerales-derechos`.

**Con eso no queda nada abierto salvo lo que no puede hacer Claude:** el
extracto PMTiles y su bucket, que es lo único que separa a F2 de estar cerrada.

## F4 · Despliegue e integración editorial

- Deploy estático + CNAME `atlas.eltercioviejo.com` (DNS en Hostinger).
- ~~Página "Método" pública: doctrina, contrato enlazado, cómo se corrige un
  dato.~~ **HECHA el 2026-08-06**, en `/metodo.html`.
  - **No repite la doctrina: la lee.** La tabla de estados de verificación y la
    de tipos de fuente salen de `vocabularios.json`; el inventario de capas, del
    manifiesto de la release. El motivo estaba en el propio repo: el README
    llevaba **ocho releases** diciendo «fase F0, todavía no hay visor publicado
    ni release de datos». Un texto que describe un dato y vive aparte del dato
    envejece sin que nadie lo note.
  - El enlace va en la **cabecera** y no en el pie, que se oculta por debajo de
    760 px — ahí «Método» habría sido inalcanzable justo en el teléfono.
  - Vite pasa a multipágina: sin `vite.config.js`, el build deja fuera el segundo
    HTML **sin avisar**, y el enlace da 404 solo en producción.
- Hilo fijado en La hacienda presentando el atlas (voz de la casa); ~~`debate_url`
  cableado en las fichas~~ **HECHO**; changelog de la release como primera
  respuesta.
  - `debate_url` estaba en el contrato y en el esquema desde el principio y **la
    ficha se lo tragaba en silencio**. Ya se pinta; falta el hilo, que es de la
    casa.

**Hecho cuando:** el subdominio sirve la release v1, la cadena
ficha → hilo → atlas funciona en ambos sentidos, y el foro tiene su hilo.

## Horizonte (post-v1, por orden acordado)

Red eléctrica e interconexiones → renovable por provincia → agua embalsada →
centros de datos → H2Med → PERTE acotado → intangibles (clase `analisis`,
ámbito mundo). El pipeline de expedientes de cambio (D7) cuando haya señales
reales con las que diseñarlo.
