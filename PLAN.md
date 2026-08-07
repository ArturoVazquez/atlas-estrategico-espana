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

~~Red eléctrica e interconexiones~~ → ~~renovable por provincia~~ → agua
embalsada (EMPEZADA, ver abajo) → ~~centros de datos~~ → ~~H2Med~~ →
~~electrolizadores~~ → ~~cables submarinos~~ → ~~subasta del Banco Europeo del Hidrógeno~~ (resuelta:
NO es capa, ver abajo) → ~~PERTE acotado~~ → ~~intangibles~~ (clase `analisis`,
ámbito mundo). **EL HORIZONTE ACORDADO ESTÁ COMPLETO** (2026-08-07). Lo único
que queda de él es `agua-embalsada`, bloqueada esperando dos ZIP del SNCZI que
tiene que dejar Arturo en `fuentes/`. El pipeline de expedientes de cambio (D7),
cuando haya señales reales con las que diseñarlo.

### Las cinco ramas que siguen en gris, y qué le falta a cada una

Comprobadas una a una el 2026-08-07, con la fuente en la mano. **Ninguna está
en gris por olvido**, y ninguna se puede levantar sin romper algo:

| Rama | Qué la para | Qué haría falta |
|---|---|---|
| `agua-embalsada` | El MITECO protege la descarga con **ALTCHA**, un CAPTCHA de prueba de trabajo | Que una persona pulse el botón |
| `recurso-eolico` | No existe dato **vectorial** oficial de recurso: solo ráster | Decidir qué publica de verdad |
| `recurso-solar` | Lo mismo | Lo mismo |
| `red-electrica` | REE es `corporativa` y **R3 le prohíbe sostener un `confirmado`** | Fuente primaria con geometría |
| `cables-submarinos` | **No hay registro público**, pese a la Ley 11/2022 | Reconstruirla acto por acto |

**`agua-embalsada` — DESBLOQUEADA el 2026-08-07: hay otra puerta, y es mejor.**
El shapefile del SNCZI sigue tras el ALTCHA (ver abajo), pero resulta que **ese
no era el dato**. «Agua embalsada» no es la geometría del vaso: es el agua que
hay dentro, y eso el MITECO lo publica en abierto y sin formulario.

`BD-Embalses.zip` —el histórico del **Boletín Hidrológico Semanal**, servido
desde el CDN del Ministerio, licencia libre con atribución— trae **719.725 filas
semanales desde 1988**: fecha, demarcación, embalse, capacidad total, agua actual
y si es hidroeléctrico. Ya está archivado en `fuentes/`. Estado al 4 de agosto de
2026: **401 embalses, 56.480 hm³ de capacidad y 39.277 embalsados (69,5 %)**.

Es formato **MDB** (Access) y este entorno no traía lector; se lee con
`access_parser`, instalado **solo en el scratchpad** — no es dependencia del
pipeline y no debe serlo.

**Lo que falta para publicarla, y por qué no se hizo de una sentada.** La base no
lleva coordenadas: hay que casar cada embalse con el Nomenclátor del IGN. Un
barrido por `tipo=Embalse` da 1.884 topónimos y, con el emparejador afinado
—artículo pospuesto incluido, que es la lección de `perte`—, casan **271 de 401
sin ambigüedad (68 %), 21 ambiguos y 109 sin correspondencia**. Los que fallan
son los de nombre en catalán, euskera o gallego («La Baells», «Añarbe»,
«Boadella»), que el nomenclátor rotula con otro tipo o en su lengua.

**Publicar el 68 % en silencio sería exactamente el peor bug de este proyecto.**
Lo que queda es: ampliar el barrido a los otros tipos y lenguas, desambiguar los
21 por punto-en-polígono contra el **WFS de demarcaciones hidrográficas**
(`https://wmts.mapama.gob.es/sig/wfs_agua/demarcaciones_et/wfs`, que sí existe y
es el único WFS del Ministerio), y declarar como hueco lo que siga sin casar.
Ojo también con los embalses cuyo último registro es de 2003: no son actuales y
van a `estado_registro: historico`, no se borran.

**Y lo que el ALTCHA sigue bloqueando, que ya no es la capa entera.** Las URL
de descarga del SNCZI existen y funcionan
(`gis.miteco.gob.es/descargas/app/DescargaFichero?f=egis_embalse_geoetrs89.zip`),
la licencia es de **atribución simple** —«se puede usar de modo libre y gratuito
siempre que se mencione al Ministerio»— y por tanto compatible con CC BY 4.0. Lo
que no se puede es automatizar: el formulario lleva un `<altcha-widget>`, o sea
un CAPTCHA de prueba de trabajo que el Ministerio ha puesto a propósito para
frenar la descarga automática. **Eso no se salta.** Los dos ZIP —15,4 MB de
embalses y 296 KB de presas— tienen que caer en `fuentes/` a mano.

**`recurso-eolico` y `recurso-solar` — no es un problema de licencia, es de qué
clase de cosa es un recurso.** El Atlas Eólico del IDAE es un **visor** con PDF
por comunidad autónoma, no un conjunto de datos. El Global Wind Atlas y el Global
Solar Atlas sí están en **CC BY 4.0** y sirven GIS, pero lo que sirven es
**ráster** (GeoTIFF a 250 m). Convertir ese campo continuo en «zonas de recurso»
lo tendría que hacer el atlas, y eso es **generar datos**: exactamente lo que
`CLAUDE.md` llama el peor bug posible de este proyecto. Un recurso es un campo,
no un registro con fuente.

La salida honesta, si alguna vez se quiere, existe y es **cambiar la pregunta**
—como ya pasó tres veces en este horizonte—: el MITECO publica la **zonificación
ambiental para energías renovables**, eólica y fotovoltaica por separado, en
shapefile y clasificada en cinco clases de sensibilidad. Es oficial, es vectorial
y es española. Pero **no es recurso, es restricción**: dice dónde se puede poner
un parque, no cuánto viento hace. Renombrar la rama es decisión de producto, y de
Arturo.

**`red-electrica`** choca con R3: la geometría de la red de transporte la publica
REE, que es el operador, o sea `corporativa`. No se encontró shapefile abierto del
MITECO. Lo que sí es primario es la **Planificación de la red de transporte
2021-2026**, aprobada por Consejo de Ministros, pero eso es la red PLANIFICADA y
además ya alimenta `electricidad-interconexiones`.

**`cables-submarinos` — LEVANTADA** el 2026-08-07, release `datos-v2026.08.17`,
con seis aterrizajes. Lo que sigue explica de dónde salió y qué le falta. La Ley 11/2022
(disposición adicional 23.ª) obliga a los titulares a comunicar sus cables al
Ministerio de Transformación Digital, pero **el Ministerio no publica la lista**:
su punto de contacto único solo ofrece el formulario. Se reconstruye acto por
acto desde el BOE y desde la participación pública de las Demarcaciones de
Costas, con el mismo «entra el que un acto administrativo nombra y sitúa» de
`centros-datos`.

**La acotación no la elige el gusto: la obliga lo que se encontró.** Los actos de
Costas cubren TODO lo que ocupa dominio público marítimo-terrestre con un cable,
y ahí dentro hay un cable de fibra atado al puente de Txatxarramendi, una
canalización que cruza la ría del Bidasoa en Irún y otra que cruza la ría de
Oriñón. Eso no es un cable submarino en ningún sentido estratégico. El criterio
que separa, y sale del propio acto, es **qué territorios une**: entra el
aterrizaje en España de un cable que conecta territorios **separados por mar**
—otro país, otra isla, la península con un archipiélago—; no entra el cruce de
una ría.

**Corpus verificado el 2026-08-07**, con acto citado y aterrizaje situado:

| Sistema | Titular | Aterrizaje | Acto |
|---|---|---|---|
| Grace Hopper | Telxius Cable España | playa de Arrietara, **Sopela** (Bizkaia) | CNC02/21/48/0001 |
| *(sin nombre en el acto)* | Edge Network Infrastructure Services Spain | playa de la Virgen del Mar, **Santander** | CNC02/23/39/0009 |
| Cádiz–Ceuta | GTD Cableado de Redes Inteligentes | playas de Benítez y La Ribera, **Ceuta** | BOE-B-2024-12549, resolución de 12-12-2019 |
| PENBAL-4 | Telefónica de España | playa de la Malvarrosa, **Valencia** → Ibiza y Mallorca | CNC02/17/46/0009 (legalización) |
| Canalink | Canarias Submarine Link | Puerto de **Santa Cruz de La Palma** | BOE-B-2011-23242, acuerdo de 24-05-2011, 25 años |
| Canalink | Canarias Submarine Link | Puerto de **Granadilla** (Tenerife) | BOE-B-2013-3436 |

Pistas que quedan abiertas, con su documento ya localizado: **PENCAN-X**,
Península–Gran Canaria (RD 1124/2024, modificado por RD 268/2026); el **ramal de
Canalink Base 4 a Fuerteventura** (RD 973/2025); y el aterrizaje de **Sagunto**
(CNC02/25/46/0013). Los tres son subvenciones o solicitudes: hay que comprobar si
sitúan el aterrizaje o solo lo financian.

**Y un hallazgo que afina la capa: el Europe India Gateway NO aterriza en
España.** Su resolución de impacto ambiental (BOE-A-2010-2040) describe un cable
de 15.000 km que cruza aguas de Galicia, el Estrecho y el mar de Alborán —y toca
tierra en **Gibraltar**. Sin aterrizaje español no hay punto que publicar, y su
trazado por aguas españolas está descrito en prosa, no en coordenadas. Se archiva
y se cita; no se convierte en registro. Es el mismo muro que la subasta IF24.

**La advertencia que tendrá que ir en su ficha:** sin registro público, la capa
**nunca podrá afirmar que están todos**. Publica los aterrizajes que un acto
administrativo nombra, y dice que eso es lo que publica.

---

**La última casilla, y la capa cambió de significado por una licencia** (release
`datos-v2026.08.16`). `idioma`: **22 registros**, veinte Estados y dos
organizaciones internacionales, con el artículo de cada uno citado literal.

Lo que deja escrito:

- **Cuando la fuente obvia no se puede reutilizar, hay que preguntarse qué
  pregunta VECINA sí tiene fuente libre** antes de dar la capa por imposible. «El
  idioma como activo» pedía demolingüística y el Instituto Cervantes la publica
  bajo un aviso legal que no la deja republicar; lo que sí no tiene dueño es el
  **texto legal** (art. 13 del TRLPI), así que la capa cartografía el ESTATUTO.
  Tercera vez en este horizonte que una restricción de licencia obliga a decir con
  precisión qué se publica —«renovable instalada», «PERTE acotado», «el idioma»—
  y las tres veces la capa salió **más honesta**, no más pobre.
- **La búsqueda web sirve para ENCONTRAR el documento, nunca para citarlo.** Dos
  veces en esta tanda el texto desmintió al resumen de la búsqueda, y la mayor es
  que **Guinea Ecuatorial no nombra el portugués** en su Ley Fundamental, contra
  lo que se repite en todas partes.
- **Un negativo se puede fabricar de dos maneras**: leyendo mal el texto —la ñ
  rota de un ISO-8859-1 leído como UTF-8, que convierte «español» en un cero
  falso— o **leyendo bien un texto viejo**, como el PDF de 2003 que la Cámara
  chilena sirve hoy sin decir que lo es. Contra lo primero, control positivo sobre
  los acentos; contra lo segundo, mirar metadatos, ley de reforma citada y si la
  numeración de artículos cuadra con la vigente.
- **Un «no encontrado» es casi siempre la consulta, no la fuente.** Tres veces
  falló el patrón por la forma de la palabra: Paraguay escribe «ARTICULO» sin
  tilde, Guatemala tenía el índice antes que el artículo, Guinea dice «Lenguas
  oficiales» donde se buscaba «idioma oficial».
- **Una comprobación que el esquema ya hace es código muerto**, y lo delató la
  regla de un incumplimiento por fixture: al señalar §7.1 además de §10 quedó
  claro que la guarda nueva no podía saltar nunca.
- **Una guardia que da falsas alarmas se acaba desactivando.** `vigilar.py`
  acusaba a la Constitución de Costa Rica de servir HTML donde promete PDF: el
  documento estaba sano y mentía la sonda, porque el `Content-Type` de un **HEAD**
  no es de fiar. Ahora se confirma con GET antes de acusar.

**La segunda casilla, cumplida por otro nombre** (release `datos-v2026.08.10`).
Decía «renovable **instalada** por provincia» y ese dato no lo publica nadie con
licencia compatible: MITECO desagrega **generación**, no potencia; la CNMC da
potencia pero solo por comunidad autónoma y **bajo CC BY-SA**, que
`datos/LICENCIA-DATOS.md` prohíbe; y REE llega a provincia siendo `corporativa`,
que R3 no admite. Se publica lo que sí se sostiene —la mezcla de generación de
las 52 provincias— y la potencia queda como hueco declarado en las 52 fichas.
**La casilla se renombra; no se disfraza.**

**La séptima casilla, y la palabra «acotado» por fin quiere decir algo** (release
`datos-v2026.08.15`). Venía en el nombre de la capa desde la demo v4 sin que
nadie decidiera qué recorta. Recorta esto: **entra lo que un documento público
sitúa**. `perte` publica **57 planes**, 1.134,7 M€ de presupuesto financiable y
269,1 M€ de subvención propuesta.

Lo que deja escrito:

- **El PRTR publica dinero, no geografía.** La lista de los 100 mayores
  perceptores es obligatoria por norma europea y no lleva ubicación; el mapa del
  PRTR de MITECO sí sitúa pero es un Power BI incrustado, sin conjunto de datos
  que citar. El único listado con **provincia y municipio fila a fila** es el del
  PERTE VEC Sección B 2024, y por eso es esta capa. Las demás convocatorias
  entran cuando publiquen el suyo igual.
- **Hay documentos oficiales que no son una tabla aunque lo parezcan** (§6.1 del
  contrato, enmienda 1.18). Este es un registro por comisiones de verificación
  donde una aparición posterior REVISA a la anterior: contar filas da 61 y los
  expedientes vigentes son 57. **Cuando una fuente publique sus propios totales,
  cuadrar contra ellos ANTES de publicar** — es lo único que separa entender un
  documento de haberlo leído por encima.
- **Una propuesta de resolución no es el acto**, por mucho que se titule
  «definitiva». El matiz va dentro del nombre del campo (`subvencion_propuesta`),
  porque un asterisco no lo lee nadie.
- **Cuidado con `re.sub` al coser texto extraído de un PDF.** Capturar el dígito
  de la izquierda lo consume y la siguiente coincidencia se queda sin él: reparó
  un separador, dejó otro roto, y una fila entera se fue con los importes de su
  vecina. Con lookarounds no pasa. Y lo delató el cuadre, no la vista.
- **La nota sobre el tope silencioso del IGN se cobró su tercera pieza.** Pedir
  municipios por nombre devuelve cero para Valladolid o Elgoibar; y la consulta
  por recuadro topó en 199 de 219 en Álava con `limit=3000`. Hay que paginar y
  comparar con `numberMatched`, siempre.

**La sexta casilla se cierra sin capa, y esa ES la respuesta** (release
`datos-v2026.08.14`). La subasta IF24 del Banco Europeo del Hidrógeno tiene
fuente oficial, completa y primaria —61 ofertas, 15 invitadas, 6 firmadas, y la
tabla nominal de los 25 invitados con su precio y su capacidad—, y **aun así no
se convierte en capa: no publica dónde está ninguno**. Se archiva, se cita desde
la ficha que toca y se deja escrito el motivo.

Es la primera fuente **excelente y no cartografiable** con la que se topa el
atlas. La tentación era clara, porque media docena de nombres son topónimos
—VILLAMARTIN, PUERTO SERRANO, TORDESILLAS, ARANDA, Arteixo, Los Barrios— y
deducir la ubicación de un nombre comercial es exactamente lo que ya salió mal
con los tres «El Espartal» del nomenclátor, que estaban a 120 km.

Lo que sí deja, y va a la ficha de Huelva:

- **De 25 proyectos invitados, 16 son españoles.** Firmaron 3 (155 MWe) y se
  retiraron 13 (1.191 MWe): sobrevivió el **12 %** de la capacidad española
  invitada.
- **Las dos ofertas más baratas de toda Europa eran españolas** —0,20 y 0,25
  €/kg— y las dos se retiraron. Lo que las tumbó, según la propia página, fue la
  exigencia de una **garantía de finalización**: la Comisión pidió aval y el
  precio bajó de golpe de categoría.
- **Una unidad de la Fase 2 de Huelva («Tharsis-ELY-1», de Cepsa Sustainable
  Fuels) ganó y no firmó.** Es el único punto donde la subasta toca una capa
  publicada.

Queda apuntado para quien siga: **la tercera subasta ya tiene resultados** —nueve
proyectos, 1.090 millones, contratos previstos para el cuarto trimestre de 2026—
y merece la misma lectura cuando se publique su tabla nominal. Si alguna vez una
resolución sitúa estos proyectos, la fuente ya está archivada.

**La quinta casilla, y la que menos código pidió** (release
`datos-v2026.08.13`). `hidrogeno-produccion`: **siete** plantas de electrólisis
—no cinco proyectos—, 2.477 MW publicados. Casi todo el trabajo fue de lectura,
no de construcción.

Lo que deja escrito:

- **Un registro obliga a publicar, no a certificar** (§6.1 del contrato, enmienda
  1.17). No degrada la fuente —un registro ES lo que sus registrados declaran,
  igual el Catastro Minero que la plataforma PCI-PMI— pero cambia **cómo se
  redacta una ficha** cuando quien declara es una empresa: **al campo numérico va
  el proyecto; la ambición va a la clave, verbatim y con su condicional; el
  argumento de venta no se publica**. Con eso, el valle asturiano publica 150 MW
  y no el gigavatio que circula por ahí.
- **Acotar mal una consulta fabrica hallazgos falsos.** La primera mirada, sin
  filtro por código, tomó por duplicados dos puntos que eran dos plantas
  distintas, y con ello estuvo a punto de publicarse una «contradicción» de la
  fuente que no existía. La consulta acotada la deshizo. **Antes de denunciar a
  una fuente, comprobar la propia consulta.**
- **Un índice de lista es una forma barata de mudar una planta de provincia.**
  Aboño y Soto de Ribera salieron cambiados entre sí porque el orden lo fijaba el
  `OBJECTID` del servicio. El constructor lleva ahora una aserción por coordenada
  verificada: si el servicio reordena, revienta en vez de mentir.

**Casilla nueva en el horizonte: la subasta del Banco Europeo del Hidrógeno.** Es
la pista más golosa que ha salido de esta tanda y NO se tocó, porque es otro
instrumento —una ayuda, no una lista de infraestructuras— y necesita su propia
fuente oficial. Lo que se sabe, para quien lo retome: de los **15 adjudicatarios
de la segunda subasta, 8 son españoles**, y hay indicios (en prensa, sin
confirmar) de que **solo 6 de los 15 llegaron a firmar el contrato**. Si eso se
sostiene con la fuente de CINEA, es exactamente la clase de hecho que este atlas
existe para registrar: la distancia entre lo adjudicado y lo firmado. Habría que
localizar la lista oficial de resultados —la página de CINEA que se probó devolvió
404— y comprobar si nombra proyectos o solo países.

**La cuarta casilla, y resultó ser más grande que su nombre** (release
`datos-v2026.08.12`). Se llamaba «H2Med» y la capa se publica como
**`hidrogeno-red`**: de los 3.268 km que dibuja, **2.634 son la red troncal
española**, que no es el H2Med. Diez registros —tres hidroductos, cinco
estaciones de compresión y dos cavernas de sal—, y el perímetro no lo eligió el
atlas: lo fija el Acuerdo del Consejo de Ministros de 30-07-2024, que habilita a
Enagás para cinco proyectos exactos.

Lo que deja escrito:

- **Un registro que una norma obliga a publicar es fuente primaria, aunque viva
  en una web** (§6.1 del contrato, enmienda 1.16). Es el reverso de la enmienda
  1.15: aquella dijo que el comunicado de un gobierno no basta; esta, que la
  plataforma de transparencia PCI-PMI sí, porque existe **por el artículo 23 del
  TEN-E**. Con dos cautelas que valen para cualquier registro así: la obligación
  **no alcanza a lo que se sirve junto** —la capa PLATTS del mismo visor es de
  S&P Global—, y **un registro puede publicar y advertir a la vez**.
- **La licencia también abre puertas.** Es la primera fuente cartográfica grande
  que pasa el filtro: Decisión 2011/833/UE, CC BY 4.0. Conviene recordarlo
  después de la CNMC y de Red Eléctrica, no fuera a instalarse la idea de que
  toda fuente grande está cerrada.
- **`geo_precision: proyectada`**, para lo que aún no existe. La distinción es de
  **tiempo**, no de detalle: las otras cuatro dicen cuánto se afina un contorno;
  esta dice que el terreno todavía no puede desmentirlo.
- **Cuidado con las longitudes de cualquier servicio ArcGIS.** `SHAPE.LEN` viene
  en metros de la proyección del servicio, y si es Web Mercator está inflado por
  la latitud hasta un 38 %. De ahí R10.
- **Las líneas del visor no se podían pinchar**, y una llevaba así desde que se
  publicó. Lo destapó preguntarse si la capa nueva funcionaría, no revisar el
  código. Si algún día se añade una cuarta clase de geometría, el sitio donde
  mirar es la constante `PINCHABLES` de `app/src/main.js`.

**Casilla nueva en el horizonte: los electrolizadores.** La misma plataforma
sirve, con geometría, promotor y capacidad, los cinco proyectos españoles de
electrólisis que están en la lista de la Unión: **9.15.4** Valle andaluz del
hidrógeno verde (Huelva, Moeve, 1.000 MW), **9.15.5** Asturias H2 Valley (EDP),
**9.15.6** ValdoEume (Reganosa y Forestal del Atlántico), **9.15.7** Catalina y
**9.15.8** ErasmoPower2X (Saceruela, Ciudad Real). No entraron aquí porque son
**producción, no red**, y de promotores distintos de los que habilita el acto
español. El trabajo está localizado y la fuente ya archivada: es media tarde.

**La tercera casilla, hecha y pequeña a propósito** (release
`datos-v2026.08.11`). `centros-datos` publica SEIS registros, y el tamaño es el
hallazgo: **España no tiene registro público de centros de datos**. La base
europea del artículo 12 de la Directiva 2023/1791 se publica agregada por Estado
miembro, MITECO no lleva censo y las cifras de mercado son de la patronal. Solo
quedan los actos administrativos, y el único localizado que nombra, sitúa y
dimensiona centros es el PIGA «Expansión Región AWS en Aragón»: cinco
proyectados que declaran **10.848,2 GWh/año**, el 48 % de lo que Aragón generó
en 2024.

Lo que deja escrito:

- **El comunicado de un gobierno no es fuente primaria; lo es el acto** (§6.1
  del contrato, enmienda 1.15). Lo obligaron los «26 proyectos y 2.000 MW» que
  anunció la Generalitat sin un expediente detrás. Primera vez que el atlas
  rechaza una fuente pública, y la trampa es peor que la privada.
- **Madrid y Cataluña son el hueco grande**: concentran la mayor parte del parque
  español y no tienen aquí un solo acto archivado. Quien retome esto, que barra
  el BOCM y el DOGC — el patrón del BOA ya está probado.
- El **cuarto trimestre de esta casilla** sería la potencia TI en MW, y hoy no la
  publica ningún acto: el esquema la prohíbe a propósito.

**La casilla de agua embalsada quedó EMPEZADA y bloqueada en un solo paso.** El
censo está resuelto y es primario: el Boletín Hidrológico da 374 embalses con su
capacidad, su cuenca y un `ELECTRICO_FLAG` que **no cambia ni una vez en 38 años**
—93 son hidroeléctricos, el 31 % de la capacidad—. Falta la GEOMETRÍA: el
inventario del SNCZI está tras un reto de prueba de trabajo que el atlas no
cruza solo, y el Nomenclátor del IGN solo sitúa 28 de los 93. Cuando
`egis_embalse_geoetrs89.zip` y `egis_presa_geoetrs89.zip` estén en `fuentes/`,
el resto es mecánico. Tres cosas medidas que conviene no volver a medir:

- El llenado se mueve **3,9 puntos en la mediana cada cuatro semanas** y hasta 86
  en los extremos, así que **el agua almacenada no se publica**: sería una cifra
  falsa antes de la siguiente release. Va como hueco, apuntando al boletín.
- **La capacidad tampoco es intemporal**: 231 de 401 embalses la han cambiado, y
  Contreras pasó de 874 a 361 hm³ en 2019. Se toma de la última semana y lleva
  fecha.
- **Seis de los 93 no son embalses** sino agrupaciones («Sistema Capdella»,
  «Sistema Valle de Arán»…): 123 hm³ y sin polígono propio.

Lo que deja escrito, para quien retome esto:

- **La licencia también cierra puertas públicas.** Hasta aquí el atlas solo se
  había topado con una licencia contagiosa en fuente privada. La CNMC es el
  regulador y su catálogo entero está fuera. Conviene no reintentarlo.
- **Una fuente oficial puede no cuadrar consigo misma.** Los 52 provinciales no
  suman el total nacional del mismo fichero, y la diferencia —casi 9.000 GWh, en
  su mayor parte fotovoltaica— no está explicada en ninguna parte del documento.
  Se publica el desacuerdo, como ya se hizo con los dos derechos mineros del
  catastro.
- **Queda una pregunta de convención sin decidir:** dos registros escriben
  «Valencia» donde el IGN pone «València/Valencia». El punto es correcto en los
  dos casos. Si algún día el atlas fija que `provincia` se escribe siempre en la
  forma del IGN, son dos líneas.

**La primera casilla, a medias y dicho:** las **interconexiones** están hechas
(release `datos-v2026.08.9`, cinco enlaces proyectados). La **red de transporte
no**, y no es por falta de ganas: el mallado lo publica Red Eléctrica, que es
sociedad cotizada —`corporativa` por §6.1, sin poder sostener un confirmado por
R3— y no hay cartografía de la red bajo licencia compatible con CC BY 4.0. Se
queda declarada y vacía con ese motivo escrito, que es para lo que sirve la
marca. Es la misma frontera que ya marcó Enagás en la capa de gas: **el atlas se
detiene donde la fuente deja de poder sostenerlo.**

Y queda apuntado, para quien retome esto: **el H2Med ya tiene instrumento**. La
lista de la Unión vigente lo recoge como proyecto 9.1.4, «Interconector de
hidrógeno España-Francia (BarMar)», junto con el interconector con Portugal
(9.1.2) y las infraestructuras interiores de los dos países. La fuente está
archivada en esta tanda.
