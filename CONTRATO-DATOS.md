# CONTRATO DE DATOS — Atlas Estratégico de España

**Versión del contrato:** 1.10.0 · **Fecha:** 2026-08-06
**Ámbito:** todo dato publicado por el atlas. Este documento es la fuente de verdad;
el código se adapta al contrato, nunca al revés.

> **Qué añade la 1.1.0** (aditiva; ningún consumidor de la 1.0.0 se rompe) —
> formaliza lo que `DECISIONES.md` D2/D3/D4 acordaron y este documento aún no
> recogía: el campo `arbol` y el `ambito` en el manifiesto (§3), la clase de
> registro `analisis` (§3), las entradas `en_preparacion` (§3), el campo
> **derivado** `activo` con su tabla de mapeo normativa (§6.5) y el campo
> controlado `fase` del que se deriva (§10). Historial completo en §13.

---

## 1 · Principios

1. **Todo dato lleva procedencia.** Ningún valor entra sin fuente y fecha. Lo que no
   tiene fuente primaria se publica marcado, no se rellena.
2. **La verificación es un estado, no una promesa.** Cada registro —y sus campos
   sensibles— declara si está confirmado, parcialmente verificado o sin verificar.
   Un anuncio corporativo o una noticia de prensa se registra con su origen; no
   asciende a dato confirmado.
3. **La memoria no se borra.** Un registro nunca se elimina: cambia de
   `estado_registro`. El historial completo vive en Git.
4. **Evolución aditiva.** Los cambios al contrato añaden, no rompen. Los
   consumidores toleran campos desconocidos. Romper exige versión mayor y
   migración documentada.
5. **Formatos estándar.** GeoJSON RFC 7946, WGS84, herramientas GIS comunes
   (QGIS, GDAL, tippecanoe) deben poder consumir los datos sin adaptadores.
6. **El repo es la cita.** Datos, fuentes archivadas, esquemas y reglas de
   validación viven versionados juntos. Toda corrección es un commit con evidencia.

---

## 2 · Estructura del repositorio

```
atlas-estrategico-espana/
├── CONTRATO-DATOS.md          ← este documento
├── CHANGELOG-DATOS.md         ← una entrada por release de datos
├── DECISIONES.md              ← el porqué de cada decisión
├── PLAN.md                    ← fases y criterios de hecho
├── CLAUDE.md                  ← guía de trabajo
├── README.md                  ← el escaparate público
├── LICENSE                    ← MIT, solo para el CÓDIGO
├── datos/
│   ├── LICENCIA-DATOS.md      ← CC BY 4.0, y qué obliga (licencias contagiosas)
│   ├── manifest.json          ← registro de capas (la app lee de aquí)
│   ├── vocabularios.json      ← vocabularios controlados (enums)
│   └── capas/
│       ├── minerales-proyectos.geojson
│       ├── minerales-dominios.geojson
│       ├── recurso-eolico.geojson
│       ├── recurso-solar.geojson
│       └── cables-submarinos.geojson
├── fuentes/                   ← archivo documental (URLs se pudren; esto no)
│   └── 2026-07-22_ce_lista-crma-1.pdf     (fecha-captura_emisor_titulo.ext)
├── pipeline/
│   ├── esquemas/              ← JSON Schema: nucleo.schema.json + uno por capa
│   ├── pruebas/               ← fixtures: uno válido y al menos uno por regla de §6.4
│   ├── validar.py             ← esquema + reglas de doctrina (§7), corre en CI
│   ├── consultar.py           ← consulta al IGN y al catastro; contrasta (§6.6)
│   └── vigilar.py             ← URLs y caducidad, semanal (avisa, jamás escribe)
├── referencia/                ← la demo v4: canon de interacción, no de código
├── app/                       ← el visor (consume datos/ por release etiquetada)
└── .github/workflows/         ← validar.yml (cada PR y cada push a main)
                               ← vigilar.yml (semanal, solo lectura)
```

Reglas de la estructura:

- `datos/` es **curado a mano**; `pipeline/` **valida, vigila y consulta, nunca
  genera datos**. Ninguno de los tres escribe en `datos/`, y **ninguno escribe en
  `fuentes/`**: archivar una fuente es un acto con criterio —qué se guarda, con
  qué título, qué sostiene— y lo firma una persona.
- `.cache/` (ignorado por git) son copias de trabajo que `consultar.py` descarga
  para no repetir peticiones. **Una copia de trabajo no es una cita**: la cita es
  el extracto curado de `fuentes/`, con su fecha de captura.
- Toda fuente citada por URL se **archiva** en `fuentes/` en el momento de la cita.
  `fuentes/` **jamás** entra en `.gitignore`: es la cita.
- La app **no lee ficheros vivos**: lee la última release etiquetada (§8).
- **Licencias separadas:** MIT para el código, CC BY 4.0 para los datos. Esa
  segunda elección prohíbe incorporar datasets con licencia contagiosa
  (*ShareAlike* / *NonCommercial*); ver `datos/LICENCIA-DATOS.md`.
- **Finales de línea LF** en todo el repo (`.gitattributes`). Un CRLF colado
  reescribe ficheros enteros en el diff y destruye la trazabilidad de una
  corrección, que es el argumento del principio 6.

---

## 3 · El manifiesto de capas

`datos/manifest.json` registra cada capa. Añadir una capa al atlas = añadir su
fichero y su entrada aquí. La app construye el panel desde el manifiesto.

```json
{
  "schema_version": "1.1.0",
  "release": "2026.08",
  "capas": [
    {
      "id": "minerales-proyectos",
      "titulo": "Minerales críticos — proyectos",
      "arbol": "minerales",
      "grupo": "actividad",
      "ambito": "espana",
      "geometria": "puntos",
      "registro": "verificado",
      "cadencia_revision_dias": 120,
      "verificado_a": "2026-07-22",
      "version": "1.0.0",
      "fichero": "capas/minerales-proyectos.geojson",
      "licencia": "CC-BY-4.0",
      "atribucion": "Atlas Estratégico de España"
    },
    {
      "id": "renovable-provincia",
      "titulo": "Renovable instalada por provincia",
      "arbol": "energia",
      "grupo": "dotacion",
      "en_preparacion": true
    }
  ]
}
```

| Campo | Valores / notas |
|---|---|
| `arbol` | **(1.1)** dominio bajo el que cuelga la capa en el panel: `minerales` · `energia` · `conectividad` · `tablero` · `intangibles`. Es la organización visible (D3). |
| `grupo` | `dotacion` (lo que tiene) · `actividad` (lo que se trabaja). Abierto a nuevos grupos por versión menor. |
| `ambito` | **(1.1)** `espana` (por defecto si se omite) · `mundo`. Relaja la comprobación de bbox de §7.4: una capa de ámbito mundo no se valida contra el recuadro de España. |
| `geometria` | `puntos` · `poligonos` · `lineas` · `mixta` |
| `registro` | `verificado` (fichas con doctrina completa) · `ilustrativo` (dibuja dónde, no cuánto ni de quién) · **(1.1)** `analisis` (investigación u opinión **sellada como tal**, con su `debate_url` al hilo donde se defiende — nunca se presenta como hecho) |
| `cadencia_revision_dias` | umbral tras el cual la capa se considera caducada; `vigilar.py` avisa cada semana (§7) y el visor lo mostrará |
| `version` | semver de la **capa**: parche = corrección de valores; menor = registros o campos nuevos; mayor = cambio de esquema |
| `en_preparacion` | **(1.1)** `true` = rama declarada pero sin datos. **El mapa declara su horizonte** (D4): el panel la pinta en gris, no cargable. Una entrada `en_preparacion` solo exige `id`, `titulo`, `arbol` y `grupo`; el resto de campos se rellenan cuando la capa nace. |

**Regla del horizonte:** una capa con `en_preparacion: true` **no puede** declarar
`fichero`. El día que tiene datos, se le quita la marca y se le añaden `fichero`,
`geometria`, `registro`, `version` y `verificado_a`. Eso es una versión menor de
manifiesto, no un cambio de contrato.

---

## 4 · Formato de capa

Cada capa es una `FeatureCollection` GeoJSON con metadatos propios en
`propiedades de colección` (miembro extranjero permitido por RFC 7946):

```json
{
  "type": "FeatureCollection",
  "atlas": {
    "capa": "minerales-proyectos",
    "schema_version": "1.0.0",
    "verificado_a": "2026-07-22"
  },
  "features": [ ... ]
}
```

Reglas de geometría:

- **CRS:** WGS84 (lon, lat), el único de RFC 7946. Nada de coordenadas proyectadas
  en los datos; la proyección es asunto del visor.
- **Precisión de coordenadas:** máximo 5 decimales (~1 m). Evita diffs de ruido.
- **Tipos:** `Point` para registros de actividad; `Polygon`/`MultiPolygon` para
  dominios y zonas; `LineString` para trazados. Un registro puede evolucionar de
  punto a polígono (p. ej., derechos mineros del catastro) mediante versión menor
  de capa, conservando el mismo `id`.
- `id` del Feature (nivel raíz, RFC 7946): `"<capa>:<slug>"`, p. ej.
  `"minerales-proyectos:aguablanca"`. **Estable para siempre; nunca se reutiliza.**

---

## 5 · Núcleo común de propiedades

Presente en **todo** feature de **toda** capa. Los nombres de campo son en
**español** — decisión deliberada: el dataset es de cara al público hispano y el
proyecto entero habla español; el coste (menor familiaridad para tooling
anglosajón) se asume y queda anotado aquí.

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `slug` | string | ✔ | identificador corto, kebab-case, único en la capa |
| `nombre` | string | ✔ | nombre de presentación |
| `categoria` | string | ✔ | valor del vocabulario de la capa (§ vocabularios) |
| `descripcion` | string | – | 1–3 frases de contexto |
| `estado_registro` | enum | ✔ | `vigente` · `historico` · `retirado` |
| `verif` | enum | ✔ | `confirmado` · `parcial` · `no_verificado` — estado global del registro |
| `geo_precision` | enum | ✔ | `exacta` · `paraje` · `municipio` · `ilustrativa` |
| `geo_fuente` | string | – | de dónde sale la geometría (p. ej. `catastro minero`, `mano alzada`). **(1.3)** admite `__v`/`__f` como cualquier campo sensible — ver §6.6 |
| `fecha_alta` | fecha ISO | ✔ | cuándo entró el registro en el atlas |
| `fecha_verificacion` | fecha ISO | ✔ | última pasada de verificación humana |
| `fuentes` | Fuente[] | ✔ | ver §6; puede contener el hueco explícito |
| `nota` | string | – | matices en voz del atlas (aparece en la ficha) |
| `debate_url` | string | – | enlace al hilo de El Tercio de este registro o su capa |

**Tolerancia:** los consumidores ignoran campos que no conocen. Los campos
específicos de capa (§ apartados de capa) se añaden **planos** en `properties`,
nunca anidados en objetos opacos — mantiene el dataset legible en QGIS y
consultable con GDAL sin adaptadores. Las dos excepciones estructuradas son
`fuentes` y `claves`, definidas por este contrato.

---

## 6 · Fuentes y verificación (la doctrina, en datos)

### 6.1 Objeto Fuente

```json
{ "id": "f1",
  "tipo": "primaria",
  "titulo": "Comisión Europea — Decisión 1ª lista de Proyectos Estratégicos CRMA",
  "fecha": "2025-03-25",
  "url": "https://…",
  "archivo": "fuentes/2026-07-22_ce_lista-crma-1.pdf" }
```

| `tipo` | Significado | ¿Puede sostener `confirmado`? |
|---|---|---|
| `primaria` | documento oficial: BOE/DOUE, decisión, resolución, registro, estadística oficial | **Sí** |
| `prensa` | medio de comunicación | No |
| `corporativa` | anuncio, web o comunicado de empresa | No |
| `hueco` | fuente pendiente de asignar — el hueco explícito del principio 1 | No |

### 6.2 Verificación por campo

Los campos **sensibles** llevan compañeros con sufijo reservado `__v` (estado) y
`__f` (id de fuente dentro de `fuentes`):

```json
"promotor": "Río Narcea Recursos",
"promotor__v": "confirmado",
"promotor__f": "f2",

"estado_proyecto": "Reactivación del yacimiento",
"estado_proyecto__v": "parcial",
"estado_proyecto__f": "f1",
"estado_proyecto_fecha": "2025-03-25"
```

El doble guion bajo es un **espacio de nombres reservado** del contrato: ningún
campo de datos puede contener `__`. Esto permite a cualquier herramienta separar
mecánicamente dato y metadato.

### 6.3 Hechos adicionales: `claves`

Afirmaciones sueltas con su propio estado, sin abrir un campo nuevo por cada una:

```json
"claves": [
  { "k": "Dimensión anunciada",
    "v": "410 M€ · 350 empleos · 60.000 t/año RAEE",
    "verif": "no_verificado",
    "fuente": "f3" }
]
```

### 6.4 Reglas de coherencia (se validan en CI, §7)

Van numeradas **desde la 1.1** para que `validar.py` pueda nombrarlas en el
mensaje de error: un fallo de doctrina debe decir *qué doctrina*, no soltar un
error de esquema genérico.

| | Regla |
|---|---|
| **R1** | `verif: confirmado` del registro ⇒ existe al menos una fuente `primaria`. |
| **R2** | Un campo con `__v: confirmado` ⇒ su `__f` apunta a una fuente `primaria`. |
| **R3** | Una fuente `corporativa` o `prensa` **no puede** ser la `__f` de un valor `confirmado`. |
| **R4** | Existe una fuente `tipo: hueco` ⇒ el registro no puede ser `confirmado` global. |
| **R5** | `registro: ilustrativo` en el manifiesto ⇒ la capa no declara `__v` por campo y toda su geometría es `geo_precision: ilustrativa`; su ficha lo dice. |
| **R6** *(1.1)* | Todo `__v` y todo `__f` acompañan a un campo que existe, y todo `__f` apunta a un `id` que existe en `fuentes`. Un metadato huérfano es un dato que nadie sostiene. |
| **R7** *(1.1)* | Ningún fichero de datos contiene el campo `activo`: es **derivado** (§6.5). Escribirlo a mano es la doble fuente de verdad que D3 descartó. |
| **R8** *(1.1, con diente desde 1.10)* | Un polígono de `minerales-dominios` con `categoria ∈ {desarrollo, historico}` **no puede contener** un registro de `minerales-proyectos` con `fase == "produccion"`. Su explicación larga está en §6.5, porque nació de cerrar el matiz abierto de D3. |
| **R9** *(1.3)* | `geo_precision ∈ {exacta, paraje}` ⇒ el registro declara `geo_fuente`, y su `geo_fuente__f` apunta a una fuente `primaria`. Una precisión que promete cartografía tiene que citarla (§6.6). |

**Esta tabla es lo que el CI comprueba, y desde la 1.10 no le falta ninguna.**
R8 estuvo fuera desde la 1.1 —escrita, normativa y sin diente— porque necesitaba
la capa `minerales-dominios` para tener contra qué comprobarse. Ya existe, y con
ella se acaba el único renglón en el que este documento afirmaba algo que no
podía sostener.

**R8 es también la única regla que cruza dos ficheros.** Se comprueba cuando
ambas capas entran en la misma pasada del validador, que es siempre en CI: sin
argumentos, `validar.py` recorre todas las capas del manifiesto que tienen
`fichero`.

R2 y R3 son la misma frontera vista desde los dos lados, y así se validan: R2
comprueba que el confirmado tiene detrás una primaria; R3, que ninguna prensa o
corporativa se cuela por debajo. Se mantienen separadas porque los mensajes de
error que producen son distintos y ambos son útiles.

### 6.5 · El campo derivado `activo` *(1.1)*

`activo` responde a una sola pregunta: **¿esto está en explotación hoy?** Es el
filtro transversal que corta a través de los árboles (D3).

**No se escribe: se calcula.** No aparece en ningún `.geojson` de `datos/` (R7);
lo materializa el consumidor —el visor, o `validar.py` al comprobar— aplicando
esta tabla. La razón está en D3: un booleano editable a mano junto a un campo de
estado son dos fuentes de verdad que acaban contradiciéndose.

| Capa | `activo` se deriva de | `true` cuando |
|---|---|---|
| `minerales-proyectos` | `fase` (§10, vocabulario) | `fase == "produccion"` |
| `nuclear` *(1.6)* | `fase` | `fase == "produccion"` (reactor en explotación) |
| `gas-regasificacion` *(1.8)* | `fase` | `fase == "produccion"` (planta en servicio) |
| `minerales-dominios` *(1.10)* | `categoria` (§9, vocabulario) | `categoria ∈ {activo, mixto}` |
| `cables-submarinos` | `fase` | `fase == "produccion"` (cable en servicio) |
| `recurso-eolico`, `recurso-solar` | — | **no aplica**: son recurso, no explotación. El filtro las deja al margen, no las oculta. |
| `tablero` (límites y soberanía) | — | **no aplica**, por el mismo motivo. |

Una capa cuya fila diga «no aplica» devuelve `null`, no `false`. La diferencia
importa: `false` afirma que algo está parado; `null` dice que la pregunta no se
le hace a esa capa. El filtro de la interfaz solo esconde `false`.

**Por qué `fase` y no el `estado_proyecto` que ya existe.** `estado_proyecto` es
texto libre en voz del atlas («Reactivación del único yacimiento de níquel
explotado en España») y el texto libre no puede gobernar un filtro sin adivinar.
La 1.1 añade `fase`, un campo **controlado** que lleva su propio `__v`/`__f` como
cualquier otro dato. Los dos conviven: `fase` es la máquina, `estado_proyecto` es
la prosa.

#### El matiz abierto de D3, cerrado

D3 dejó anotado el problema: al filtrar «en explotación», un dominio marcado
`desarrollo` desaparece **aunque contenga una mina viva**.

La salida **no** es hacer que `activo` del dominio mire dentro de sí. Eso
enmascararía el problema al pintar, dejando el dato mal en el fichero. Si un
dominio alberga un registro en producción, entonces su `categoria` correcta es
`mixto` —que existe precisamente para eso— y declararlo `desarrollo` es
sencillamente un **error de dato**.

Así que se convierte en una comprobación, no en una derivación:

| | Regla |
|---|---|
| **R8** *(1.1)* | Un polígono de `minerales-dominios` con `categoria ∈ {desarrollo, historico}` **no puede contener** un registro de `minerales-proyectos` con `fase == "produccion"`. Si lo contiene, su `categoria` es `mixto` o `activo`. |

Esto atrapa la mentira en el fichero en lugar de disimularla en pantalla, que es
la doctrina del proyecto entera en miniatura.

> **R8 tiene diente desde la 1.10** *(2026-08-06)*, cuando nació la capa
> `minerales-dominios` que le faltaba. Durante nueve versiones este documento
> llevó aquí escrito que no lo tenía: la nota se retira porque ya sería falsa, no
> porque estorbara. Es la única regla de coherencia que compara dos capas entre
> sí, y por eso vive en `main()` y no en `validar_capa()`.

---

## 6.6 · La precisión de la geometría, y lo que la sostiene *(1.3)*

`geo_precision` es la única declaración del atlas que el mapa puede desmentir él
solo. Un punto pintado sobre buena cartografía **afirma exactitud aunque la ficha
diga lo contrario**, y en un mapa gana lo que se ve. Un lector que mide una
distancia sobre la pantalla no ha leído el campo `geo_fuente`, y no tiene por qué.

Por eso la geometría deja de ser el único dato del atlas cuya procedencia era
prosa: `geo_fuente` admite `geo_fuente__v` y `geo_fuente__f` como cualquier otro
campo sensible (§6.2), y la fuente cartográfica entra en `fuentes` con su tipo y
su copia archivada, igual que la que sostiene un promotor.

**Qué precisión concede cada clase de fuente:**

| Lo que da la fuente | `geo_precision` |
|---|---|
| Perímetro o coordenadas **del objeto**: catastro minero, o la resolución que lo autoriza | `exacta` |
| Topónimo de un nomenclátor oficial: primaria para el **nombre del lugar**, no para el perímetro de la instalación | `paraje` |
| Nada localizable, o fuente con licencia incompatible (`datos/LICENCIA-DATOS.md`) | `municipio` — se queda ahí, y lo dice |
| Trazado a mano alzada | `ilustrativa` |

Quedarse en `municipio` es un resultado legítimo: es el hueco del principio 1
aplicado a la geometría. Lo que no es legítimo es ascender de rango sin que
ascienda la evidencia — el mismo criterio que gobierna todos los demás campos.

**Un punto representativo no hereda la precisión del polígono del que sale.**
Un perímetro de fuente primaria concede `exacta` **a ese perímetro**, no a un
punto sacado de él: el centroide de una concesión minera de 28 km² no es una
coordenada de nada, y el de un derecho **multiparte** puede caer donde no hay
derecho ninguno (las dos cosas, comprobadas sobre el catastro minero al abrir
esta capa). Consecuencia práctica, y conviene decirla entera: **mientras una
capa sea de puntos, `exacta` es inalcanzable por construcción.** Se llega a ella
ascendiendo la geometría a polígono (§8), no reetiquetando el punto.

**El CRS es parte de la cita, no un detalle de taller.** Los derechos mineros
españoles vienen históricamente en **ED50**, y ED50→ETRS89 en la Península
desplaza del orden de 100-200 m. Una coordenada mal transformada cae fuera de la
mina **mientras la ficha dice `exacta`**: exactamente la mentira que esta sección
existe para impedir. `geo_fuente` declara el CRS de origen y la transformación
aplicada.

**Por qué R9 hace falta**, si ya existían R2 y R3: esas dos solo miran los campos
declarados `confirmado`. Una geometría `exacta`, apoyada en un anuncio
corporativo y marcada `parcial`, pasaba en verde. R9 mira la precisión declarada,
que es lo que el mapa va a dibujar.

**El contraste de municipio** *(1.4)*. R9 comprueba que la geometría **cite**;
no puede comprobar que la coordenada esté **bien**, porque eso exige salir a
preguntar. Esa parte la hace una persona con `pipeline/consultar.py contraste
<capa>`, que recorre la capa y comprueba, por punto-en-polígono contra los
límites administrativos del IGN, que cada coordenada cae en el `municipio` que su
ficha declara. **No corre en CI** ni bloquea nada: toca la red, y un contrato que
se cae porque un ministerio está de mantenimiento no es un contrato.

Si un punto y su municipio no cuadran, la salida **no es elegir**: uno de los dos
datos está mal y no se sabe cuál. Se para, la geometría se queda donde estaba y
se declara el hueco — que es lo que se hizo con `las-cruces` al abrir esta capa.

---

## 7 · Validación — el contrato con dientes

`pipeline/validar.py` corre en CI sobre cada PR a `datos/`. La doctrina deja de
ser prosa y pasa a ser test:

1. **Esquema:** cada capa valida contra `nucleo.schema.json` + su extensión.
2. **Identidad:** `slug` únicos por capa; `id` = `capa:slug`; ids nunca
   desaparecen entre releases (solo cambian de `estado_registro`).
3. **Doctrina:** las reglas **R1–R7 y R9** de §6.4, mecánicamente. El mensaje de error
   **nombra la regla** (`R3: la fuente f2 es de tipo prensa…`), no describe un
   fallo de esquema: quien lo lee tiene que poder ir al contrato.
4. **Geometría:** WGS84 plausible, ≤5 decimales, anillos cerrados y orientados
   según RFC. El recuadro de plausibilidad depende del `ambito` de la capa
   *(1.1)*: `espana` valida contra el bbox del territorio —**Canarias incluidas**,
   `[-18.3, 27.5, 4.4, 43.9]`—; `mundo` solo contra el rango legal de WGS84.
5. **Fechas:** `fecha_verificacion` ≥ `fecha_alta`; formato ISO-8601; ninguna
   fecha en el futuro *(1.1)*, **con un día de tolerancia** *(1.6.1)*. «El
   futuro» exige saber de quién es el ahora, y una fecha ISO no lleva huso: el
   atlas se cura en España (UTC+1/+2) y el CI corre en UTC, así que un par de
   horas cada noche lo que aquí es hoy allí es mañana. Sin ese margen, un dato
   fechado correctamente a las 00:47 rompe la validación — y la rompió. La
   comprobación existe para cazar un 2027 escrito donde iba 2017, no para
   arbitrar un desfase de dos horas.
6. **Vocabularios:** todo enum contra `vocabularios.json`.
7. **Archivo de fuentes:** toda fuente con `url` y tipo ≠ `hueco` referencia un
   `archivo` existente en `fuentes/` (aviso, no bloqueo, durante la v1).
8. **Manifiesto** *(1.1)*: cada capa con `fichero` apunta a un fichero que existe;
   el `atlas.capa` de la colección coincide con el `id` del manifiesto; una capa
   `en_preparacion` no declara `fichero` (regla del horizonte, §3).

**Aviso vs. bloqueo.** La comprobación 7 avisa y no rompe el CI mientras dure la
v1 —hay citas que se archivan con retraso—; el resto **bloquea**. `validar.py`
distingue las dos cosas en la salida y solo devuelve código ≠ 0 por las que
bloquean.

`pipeline/vigilar.py` corre programado (Action semanal, `vigilar.yml`): capas que
superan su `cadencia_revision_dias` y citas cuya URL ha muerto. **Avisa; jamás
escribe datos.** *(Construido en la 1.5.0; hasta entonces esta sección describía
una guardia que no estaba montada, y desde la 1.4.0 lo decía.)*

**Avisa fallando, no abriendo issues** *(1.5)*. Abrir issues exigiría dar permiso
de **escritura** a un workflow programado de un repositorio público, y ponerse en
rojo consigue el mismo aviso con cero permisos. Un permiso concedido y olvidado
no se nota; su ausencia, sí.

**Qué cuenta como URL muerta:** solo **404** y **410**. Un 403, un 405, un 429 o
un 5xx son bloqueos anti-bot y caídas pasajeras; se informan como *no
concluyente* y **no dan la alarma**. La frontera es estrecha a propósito: un
vigilante con falsos positivos se apaga, y entonces no vigila nada.

> **Lo que esta guardia NO puede comprobar, y lo dice cada vez que corre.**
> Medido sobre las fuentes de este atlas: **EUR-Lex y el IGME devuelven HTTP 200
> para documentos que no existen**, sirviendo una página de error. Donde la URL
> promete formato —termina en `.pdf`— el engaño se detecta, porque responder
> `text/html` delata el enlace roto. Donde no lo promete, un *soft-404* es
> indistinguible del documento y **no hay comprobación**. Por eso `vigilar.py`
> imprime cuántas citas quedan sin verificar de verdad: un «sin alarmas» que se
> leyera como «todas las citas siguen vivas» sería la garantía falsa que §8
> prohíbe. Para esas citas, la garantía es `fuentes/` — y esta es la mejor
> defensa escrita de por qué ese directorio existe.

---

## 8 · Versionado y releases

- **Release de datos:** etiqueta Git `datos-vAAAA.MM` (p. ej. `datos-v2026.07`).
  El visor consume siempre una release etiquetada, nunca la rama viva. Si en un
  mismo mes sale una segunda release, lleva sufijo `.N` empezando en 1
  (`datos-v2026.08.1`) *(1.3)*. La etiqueta ya publicada **no se mueve ni se
  reescribe**: el sufijo existe precisamente para no tener que tocarla.
- **Por release:** una entrada en `CHANGELOG-DATOS.md` — qué cambió, por qué, con
  qué evidencia. Esa entrada alimenta la respuesta en el hilo de El Tercio.
- **Semver de contrato** (este documento) y **semver por capa** (manifiesto)
  evolucionan por separado: corregir el promotor de un registro es parche de
  capa; añadir la capa de PERTE es menor de manifiesto; renombrar un campo del
  núcleo es **mayor de contrato** y exige guía de migración escrita aquí.

### Reglas de evolución (lo que garantiza que nunca quede cojo)

| Cambio | Versión | Regla |
|---|---|---|
| Corregir un valor | parche de capa | commit con fuente en la descripción |
| Añadir registro | menor de capa | id nuevo, jamás reciclado |
| Retirar registro | menor de capa | `estado_registro: retirado`, nunca borrado |
| Añadir campo | menor de contrato | opcional para consumidores viejos |
| Añadir valor a un vocabulario | menor de contrato | acto deliberado en `vocabularios.json` |
| Añadir capa o grupo | menor de manifiesto | entrada en manifiesto + esquema propio |
| Punto → polígono del mismo registro | menor de capa | mismo `id`, `geo_precision` y `geo_fuente` actualizados |
| Declarar una rama `en_preparacion` *(1.1)* | menor de manifiesto | solo `id`, `titulo`, `arbol`, `grupo`; **sin `fichero`** |
| Una rama `en_preparacion` nace con datos *(1.1)* | menor de manifiesto | se retira la marca y se añaden `fichero`, `geometria`, `registro`, `version`, `verificado_a` |
| Añadir una regla de coherencia `R*` *(1.1)* | menor de contrato | entra con su implementación en `validar.py`, **o con su estado declarado** si aún no la tiene |
| Renombrar/eliminar campo o cambiar semántica | **mayor de contrato** | prohibido sin migración documentada |

**El contrato no puede mentir sobre sí mismo.** Una regla escrita aquí que el CI
no comprueba es prosa disfrazada de garantía — el fallo exacto que este documento
existe para evitar. Por eso toda `R*` sin diente lleva su estado escrito al lado,
y por eso §7 separa lo que avisa de lo que bloquea. **Desde la 1.10 no hay
ninguna**: R8, que fue la última, se implementó al nacer la capa que le faltaba.
La puerta se queda abierta —una regla puede volver a adelantarse a sus datos—
pero se cruza declarándolo, nunca en silencio.

---

## 9 · Vocabularios controlados (arranque)

`datos/vocabularios.json` — añadir valores es versión menor de contrato.

Cada entrada lleva su `valor`, su `etiqueta` y, desde la **1.9**, el **`color`**
con el que el mapa la pinta. El color es dato, no capricho del visor: estuvo
cableado en el código mientras hubo una sola capa y, al llegar la cuarta, tres
capas se pintaban del mismo gris porque el programa solo conocía las categorías
de la primera. Ponerlo aquí tiene una consecuencia que conviene saber: **cambiar
un color exige una release de datos**, como cualquier otro cambio de
vocabulario.

**Del registro:**

- `verif`: `confirmado` · `parcial` · `no_verificado`
- `estado_registro`: `vigente` · `historico` · `retirado`
- `geo_precision`: `exacta` · `paraje` · `municipio` · `ilustrativa` — qué fuente
  concede cada uno, en §6.6
- `fuente.tipo`: `primaria` · `prensa` · `corporativa` · `hueco`
- `fase` *(1.1)*: `produccion` · `desarrollo` · `tramitacion` · `parado` · `cerrado`

**Del manifiesto:**

- `grupo`: `dotacion` · `actividad`
- `arbol` *(1.1)*: `minerales` · `energia` · `conectividad` · `tablero` · `intangibles`
- `ambito` *(1.1)*: `espana` · `mundo`
- `registro`: `verificado` · `ilustrativo` · `analisis` *(1.1)*
- `geometria`: `puntos` · `poligonos` · `lineas` · `mixta`

**`categoria`, por capa:**

- *minerales-proyectos*: `estrategico_ue` · `produccion_singular` · `en_disputa`
- *nuclear* *(1.6)*: `en_operacion` · `en_cese` · `desmantelamiento`
- *limites-soberania* *(1.7)*: `reclamado_por_espana` · `reclamado_a_espana`
- *gas-regasificacion* *(1.8)*: `regasificacion` · `logistica_gnl`
- *minerales-dominios* *(1.10)*: `activo` · `historico` · `desarrollo` · `disputa` · `mixto`
- *cables-submarinos*: `aterrizaje` · `trazado`
- *recurso-eolico* / *recurso-solar*: `zona`

> **`fase` y `categoria` no son lo mismo, aunque compartan palabras.**
> `categoria` dice **qué clase de cosa es** un registro (por qué está en el
> atlas); `fase` dice **en qué punto de su vida está** (§6.5). Una mina puede ser
> `estrategico_ue` y estar en `tramitacion`, o dejar de estarlo sin cambiar de
> categoría.
>
> **`minerales-dominios` no tiene `fase`, y eso es deliberado** *(1.10)*: un
> dominio no es un expediente, es una comarca. Su carácter —viva, histórica, en
> desarrollo, en disputa— *es* la clase de cosa que es, así que va en `categoria`
> y no en un campo aparte. Hasta la 1.9 el contrato llamaba `caracter` a ese
> campo mientras archivaba sus valores bajo `categoria`, lo que habría publicado
> **dos campos con los mismos cinco valores**: exactamente la doble fuente de
> verdad que D3 descartó. Se unifican antes de que la capa exista, que es cuando
> sale gratis — el mismo momento y el mismo motivo por los que la 1.1 pudo
> introducir `fase`.

---

## 10 · Esquemas por capa (campos específicos, planos)

**minerales-proyectos** (`actividad`, puntos, verificado):
`materias[]` (✔) · `tipo_proyecto` (✔: extracción / procesamiento / refino /
reciclaje, combinables) · `municipio` (✔) · `provincia` (✔) · `promotor` (+`__v`,`__f`)
· **`fase`** (✔ *(1.1)*, vocabulario; +`__v`,`__f`) · `estado_proyecto`
(+`__v`,`__f`,`_fecha`) · **`nombre_oficial`** (– *(1.2)*; +`__v`,`__f`) · `claves[]`

> **Por qué existe `nombre_oficial` *(1.2)*.** El nombre con el que se conoce un
> proyecto y el que lleva en el documento que lo reconoce no siempre coinciden —
> en la primera lista CRMA difieren en cinco de los siete proyectos españoles:
> «La Parrilla» figura como *P6 Metals* y «Las Cruces» como *Polymetallic primary
> sulphide project*. Sin este campo, quien quisiera contrastar una ficha contra
> el DOUE no encontraría la entrada. `nombre` sigue siendo el de presentación;
> `nombre_oficial` es el que permite la cita.

**nuclear** *(1.6)* (`actividad`, puntos, verificado):
`grupo` (✔: el reactor dentro de su emplazamiento) · `municipio` (✔) ·
`provincia` (✔) · `potencia_mw` (+`__v`,`__f`) · `tecnologia` (+`__v`,`__f`) ·
`titulares[]` (+`__v`,`__f`) · **`fase`** (✔, vocabulario; +`__v`,`__f`) ·
**`autorizacion_hasta`** (+`__v`,`__f`) · **`cierre_acordado`** (+`__v`,`__f`) ·
`nombre_oficial` · `claves[]`

> **Por qué DOS fechas, y no una «fecha de cierre».** Son hechos distintos, de
> instrumentos distintos, y en España no coinciden:
>
> - **`autorizacion_hasta`** es hasta cuándo un reactor está **legalmente
>   autorizado** a operar. Lo fija una orden ministerial publicada en el BOE, que
>   es lo más duro que hay: se cita por su número y se archiva.
> - **`cierre_acordado`** es la fecha del **calendario pactado** en 2019 entre
>   Enresa y los titulares.
>
> Vandellós II lo enseña de un vistazo: autorizado hasta 2030, acordado para
> 2035. Meterlo todo en un campo obligaría a elegir cuál es «la» fecha, y quien
> lea el mapa no sabría cuál está viendo.
>
> **Un reactor por registro, aunque compartan emplazamiento.** Almaraz I y II
> tienen autorizaciones, fechas y potencias distintas: son dos hechos, no uno.
> Comparten coordenada, y eso se dice — separarlos en el mapa exigiría una
> fuente que sitúe cada edificio, y no la hay (§6.6).

**gas-regasificacion** *(1.8)* (`dotacion`, puntos, verificado):
`operador` (✔; +`__v`,`__f`) · `municipio` (✔) · `provincia` (✔) ·
**`fase`** (✔, vocabulario; +`__v`,`__f`) · `puesta_en_servicio` (+`__v`,`__f`) ·
`capacidad_almacenamiento_m3` (+`__v`,`__f`) ·
`capacidad_emision_nm3h` (+`__v`,`__f`) · `claves[]`

> **Los dos campos de capacidad existen y van a quedarse vacíos.** No es un
> descuido: al abrir la capa se comprobó que **nadie los publica en documento
> accesible**. Ni el informe de supervisión del sistema gasista de la CNMC —que
> sí trae mínimos técnicos y días de operación por planta— ni las páginas de los
> operadores traen la capacidad de almacenamiento en m³ de cada terminal, que es
> justamente la cifra que todo el mundo repite. Los campos se declaran para que
> el hueco tenga dónde alojarse el día que aparezca el instrumento.
>
> **Ojo con la fuente que se dé por buena aquí.** Enagás es una sociedad
> cotizada: por §6.1 sus publicaciones son `corporativa` y por **R3** no pueden
> sostener un `confirmado`. Lo primario es el BOE y la CNMC.

**limites-soberania** *(1.7)* (`dotacion`, puntos, verificado):
`administrado_por` (✔; +`__v`,`__f`) · `reclamado_por` (✔; +`__v`,`__f`) ·
`municipio` · `provincia` · `nombre_oficial` · `claves[]`

> **Los dos campos son la doctrina D5 puesta en datos.** El atlas registra que
> la reclamación existe y quién la sostiene; **no dicta veredicto**. Por eso hay
> exactamente dos campos, simétricos: quién **administra** hoy y quién
> **reclama**. Con esa estructura, Gibraltar (administra el Reino Unido, reclama
> España) y Ceuta (administra España, reclama Marruecos) se describen igual.
>
> Esa simetría no es elegancia: es la garantía de que el atlas no cambia de vara
> según de quién sea la reclamación. Y por eso `categoria` solo tiene dos
> valores, que dicen **quién reclama, no quién tiene razón**.
>
> **Los instrumentos van en `claves[]`**, uno por afirmación y con su fuente:
> «España invoca X», «el Reino Unido invoca Y». Así cada posición se lee
> atribuida a quien la sostiene, y la que no tiene documento se ve como lo que
> es. Un tratado acredita la posición de una parte, no la razón de nadie.
>
> **Nada de esto tiene `fase`**: el tablero figura como «no aplica» en §6.5, así
> que su `activo` es `null` y el filtro de explotación no lo esconde nunca.

**minerales-dominios** (`dotacion`, polígonos, ilustrativo→verificado) *(1.10)*:
`materias[]` · `distritos[]` · `sym` (etiqueta corta de mapa: «Cu · Zn · Pb»)

> El carácter del dominio va en **`categoria`** (§9), no en un campo propio — ver
> la nota de §9. Y ninguno de estos campos lleva `✔`: la capa es `ilustrativo`,
> y **R5 prohíbe la verificación por campo** en una capa que dibuja dónde, no
> cuánto ni de quién. El día que un dominio ascienda a cartografía de fuente
> primaria, R5 obliga a que ascienda **la capa entera**: es regla de capa, no de
> registro, así que el ascenso parcial parte la capa en dos en vez de mezclarlas.

**cables-submarinos** (`dotacion`, mixta, ilustrativo→verificado):
`sistemas[]` · `destinos[]` · `operadores[]` (cuando se verifique) ·
`municipio` · `provincia`

**recurso-eolico / recurso-solar** (`dotacion`, polígonos, ilustrativo):
`distritos[]` · `justificacion` (por qué la zona)

*(Capas futuras —renovable instalada por provincia, PERTE— entran por §8 con su
apartado aquí y su esquema en `pipeline/esquemas/`.)*

---

## 11 · Ejemplo canónico completo

```json
{
  "type": "Feature",
  "id": "minerales-proyectos:aguablanca",
  "geometry": { "type": "Point", "coordinates": [-6.27080, 38.08050] },
  "properties": {
    "slug": "aguablanca",
    "nombre": "Aguablanca",
    "categoria": "estrategico_ue",
    "descripcion": "Reactivación del único yacimiento de níquel explotado en España.",
    "estado_registro": "vigente",
    "verif": "confirmado",
    "geo_precision": "municipio",
    "geo_fuente": "centroide municipal — pendiente catastro minero",
    "fecha_alta": "2026-07-22",
    "fecha_verificacion": "2026-07-22",
    "materias": ["niquel", "cobre", "cobalto", "pgm"],
    "tipo_proyecto": ["extraccion"],
    "municipio": "Monesterio",
    "provincia": "Badajoz",
    "promotor": "Río Narcea Recursos",
    "promotor__v": "parcial",
    "promotor__f": "f2",
    "fase": "desarrollo",
    "fase__v": "parcial",
    "fase__f": "f1",
    "estado_proyecto": "Reactivación en curso",
    "estado_proyecto__v": "parcial",
    "estado_proyecto__f": "f1",
    "estado_proyecto_fecha": "2025-03-25",
    "claves": [],
    "fuentes": [
      { "id": "f1", "tipo": "primaria",
        "titulo": "Comisión Europea — Decisión de la 1ª lista de Proyectos Estratégicos CRMA, con su anexo",
        "fecha": "2025-03-25" },
      { "id": "f2", "tipo": "prensa",
        "titulo": "elEconomista — Quién está detrás de los 7 proyectos",
        "fecha": "2025-03-31" }
    ],
    "nota": "La inclusión en la lista CRMA es un hecho oficial.",
    "debate_url": "https://www.eltercioviejo.com/bandera/hac/hilo/…"
  }
}
```

**Este ejemplo valida.** Es literalmente el fixture `pipeline/pruebas/valido.geojson`
que el CI pasa en verde — no una ilustración aproximada. Si el contrato y el
fixture se separan alguna vez, el error está en el contrato.

*(Las dos fuentes van **sin `url` y sin `archivo`**, y es deliberado: este
documento no cementa una URL que nadie ha verificado todavía. Localizar la
decisión de la Comisión **con su anexo** —no la nota de prensa que la resume— y
archivarla en `fuentes/` es trabajo de la fase F1, que existe exactamente para
eso. Escribir aquí un enlace plausible mientras tanto sería el fallo que el
principio 1 prohíbe, cometido en el ejemplo que enseña a no cometerlo.)*

*(Obsérvese `promotor__v: parcial` con `promotor__f: f2`. La fuente f2 es prensa,
y por **R3** no puede sostener un `confirmado`: elevar ese campo exigiría
localizar fuente primaria del promotor —registro mercantil, catastro minero—, no
reescribir el estado. `fase: desarrollo` también queda en `parcial` por lo mismo.
Un dato solo sube de rango cuando sube su evidencia.)*

*(La geometría va en `municipio`, así que **R9 no le pide fuente cartográfica**:
el registro no promete una precisión que no tiene. El día que la coordenada salga
del catastro minero, `geo_precision` sube a `exacta` y con ella llegan
`geo_fuente__f` y la fuente archivada — las dos cosas a la vez, que es lo que R9
comprueba.)*

---

## 12 · Decisiones de diseño registradas

1. **Propiedades planas** (no anidadas) salvo `fuentes` y `claves` → interop GIS.
2. **Nombres de campo en español** → coherencia de proyecto; coste asumido.
3. **Sufijos `__v`/`__f`** como espacio de nombres de metadato por campo →
   verificación por campo sin romper el modelo plano.
4. **Doctrina como validación de CI**, no como prosa → §6.4/§7.
5. **La app lee releases etiquetadas**, nunca la rama viva.
6. **`vigilar.py` avisa y jamás escribe** → el criterio humano firma; la máquina
   instruye (compatible con el futuro pipeline de expedientes). Construido en la
   1.5.0, y avisa **fallando**: abrir issues habría costado permiso de escritura
   sobre el repo (§7).
7. **Nada se borra**: `estado_registro` + historial Git.
8. **`activo` es derivado, no escrito** *(1.1)* → una sola fuente de verdad (D3).
   Y el campo del que se deriva, `fase`, es **controlado**: un filtro no puede
   colgar de texto libre sin adivinar.
9. **Las reglas de doctrina van numeradas** *(1.1)* → un error de CI nombra la
   regla y manda al contrato. Una violación de doctrina que se reporta como
   error de esquema no enseña nada a quien la comete.
10. **El horizonte se declara en el manifiesto** *(1.1)* → `en_preparacion`
    convierte «lo que falta» en dato consultable en vez de en una promesa suelta
    en un README (D4).
11. **La geometría cita como cualquier otro dato** *(1.3)* → `geo_fuente` con
    `__v`/`__f`, y R9 atándola a la precisión declarada (§6.6). Era el único
    campo cuya procedencia no se podía comprobar, y el único que el mapa
    contradice solo con dibujarse.

---

## 13 · Historial del contrato

| Versión | Fecha | Qué cambió |
|---|---|---|
| **1.10.0** | 2026-08-06 | **Aditiva, y cierra el único renglón en el que este documento no se sostenía a sí mismo.** Nace la capa `minerales-dominios` (§10) y con ella **R8 gana su diente**: entra en la tabla de §6.4, se retira la nota de estado de §6.5 y §8 deja de citarla como el ejemplo vivo de regla sin implementar. Desde hoy **ninguna regla del contrato es prosa**. La capa unifica el `caracter` de §10 con el `categoria` del núcleo, que archivaban los MISMOS cinco valores en dos campos: renombrado nominalmente mayor por §8, gratis de hecho porque la capa no tenía datos publicados — el mismo argumento con el que la 1.1 introdujo `fase`. Los cinco valores estrenan `color` (§9). |
| **1.9.0** | 2026-08-06 | **Aditiva.** Cada categoría de §9 lleva ahora su **`color`**. Lo destapó tener cuatro capas encendidas a la vez: nuclear, gas y el tablero se pintaban del MISMO gris, porque la paleta vivía cableada en el visor y solo conocía las tres categorías de `minerales-proyectos`. Es el mismo vicio —código que conoce las capas de antemano— que ya se había quitado del panel y de la ficha. Consecuencia asumida: el color es dato, así que cambiarlo exige una release. |
| **1.8.0** | 2026-08-06 | **Aditiva.** Entra `gas-regasificacion` (§10) con su `categoria` (§9) y su fila en la tabla de `activo` (§6.5). Trae dos campos —`capacidad_almacenamiento_m3` y `capacidad_emision_nm3h`— que **nacen vacíos a propósito**: al abrir la capa se comprobó que ni la CNMC ni los operadores publican en documento accesible la capacidad de las siete terminales, que es la cifra que todo el mundo repite. El campo existe para que el hueco tenga dónde alojarse. Queda escrito además, porque no lo estaba, que **Enagás es una sociedad cotizada** y por tanto fuente `corporativa`: lo primario aquí es el BOE y la CNMC. |
| **1.7.0** | 2026-08-06 | **Aditiva.** Entra `limites-soberania` (§10), la capa del tablero, con la doctrina **D5 puesta en datos**: dos campos simétricos —`administrado_por` y `reclamado_por`— con los que Gibraltar y Ceuta se describen con la misma estructura, y una `categoria` de dos valores (§9) que dice **quién reclama, no quién tiene razón**. Los instrumentos que cada parte invoca van en `claves[]`, atribuidos, de modo que una posición sin documento se ve como lo que es. No toca §6.5: el tablero ya figuraba como «no aplica», y esta es la primera capa que ejercita esa rama — su `activo` es `null` y el filtro de explotación no la esconde nunca. |
| **1.6.1** | 2026-08-06 | **Corrección.** §7.5 da **un día de tolerancia** a la comprobación de fechas futuras. Lo destapó el propio CI al publicar la capa `nuclear`: los registros se fecharon a las 00:47 hora española, y el runner —que corre en **UTC**— aún estaba en el día anterior, así que veía toda la capa fechada en el futuro y bloqueaba. No era un dato mal puesto: era una regla que decía «el futuro» sin decir de quién es el ahora, y una fecha ISO no lleva huso. La comprobación sigue cazando un 2027 escrito donde iba 2017; deja de arbitrar un desfase de dos horas. |
| **1.6.0** | 2026-08-06 | **Aditiva.** Entra la capa `nuclear` (§10), la primera que estrena el mecanismo sin ser la primera capa del atlas: `grupo`, `potencia_mw`, `tecnologia`, `titulares[]`, `fase` y **dos campos de fecha** —`autorizacion_hasta`, de la orden del BOE, y `cierre_acordado`, del calendario de 2019—, que son hechos distintos y en España no coinciden. Su `categoria` en §9 y su fila en la tabla de `activo` de §6.5, sin la cual un reactor no respondería al filtro de explotación, que es justo la pregunta que sí se le hace. La regla de un registro **por reactor** aunque compartan emplazamiento, y por qué comparten coordenada, queda escrita en §10. |
| **1.5.0** | 2026-08-05 | **`vigilar.py` existe.** Se retira la declaración de pendiente que puso la 1.4.0: la guardia semanal está construida, con su `vigilar.yml`. §7 se reescribe con lo que la implementación obligó a decidir y a admitir. Decidido: **avisa fallando, no abriendo issues** —eso habría costado permiso de escritura sobre un repositorio público—, y **«muerta» es solo 404 y 410**, porque un vigilante que grita por el 403 anti-bot de un ministerio acaba apagado. Admitido, y esto es lo que más importa: **EUR-Lex y el IGME devuelven 200 para documentos que no existen**. Donde la URL promete formato el engaño se detecta; donde no, **no hay comprobación posible** y la guardia lo imprime cada vez que corre. Con esto el contrato no tiene ninguna pieza sin implementar salvo **R8**, que sigue esperando a `minerales-dominios` (§6.5). |
| **1.4.0** | 2026-08-05 | **Aditiva, y sobre todo correctora.** Lo importante no es lo que añade sino lo que **deja de afirmar**: seis lugares de este repo daban por construido `pipeline/vigilar.py` —y su `vigilar.yml`— en presente y sin matizar, incluido el README público. No existen. §7 gana su bloque de estado, redactado como el de R8 en §6.5, y §2, §3 y §12.6 dejan de darlo por hecho. Mientras no exista, **nadie vigila la caducidad de una capa ni la muerte de una URL**, y eso ahora está dicho donde se afirma en vez de descubrirse por su ausencia — que es la regla que §8 se impone a sí mismo. Lo que se añade: `pipeline/consultar.py` en §2 (consulta al IGN y al catastro, contrasta, **nunca escribe**), `.cache/` con su distinción entre copia de trabajo y cita, y en §6.6 el **contraste de municipio**, que es la comprobación que R9 no puede hacer porque exige salir a la red. La regla de estructura pasa a «valida, vigila y consulta; nunca genera datos». |
| **1.3.0** | 2026-08-05 | **Aditiva.** La geometría entra en la doctrina. `geo_fuente` admite `__v`/`__f` (§5); nuevo §6.6 con la tabla de qué precisión concede cada clase de fuente, el CRS como parte de la cita, y la regla **R9** (§6.4), que exige fuente primaria a toda `geo_precision` de `exacta` o `paraje` — con su implementación en `validar.py` y sus dos fixtures, no declarada y pendiente. §9: `paraje` y `exacta` se redefinen para distinguir la fuente del **nombre del lugar** de la del **objeto**; ningún registro publicado usaba ninguno de los dos, así que no hay nada que migrar. §8: sufijo `.N` para una segunda release en el mismo mes. Salió de la deuda de geometría de F1: once puntos honestos, pero con la única procedencia del atlas que nadie podía comprobar. **§6.6 lleva además una lección aprendida tocando la fuente**, no escribiendo el contrato: un punto representativo no hereda la precisión de su polígono, así que `exacta` es inalcanzable mientras la capa sea de puntos. |
| **1.2.0** | 2026-08-05 | **Aditiva.** Campo opcional `nombre_oficial` (+`__v`,`__f`) en `minerales-proyectos` (§10). Salió de la propia F1: el nombre oficial del documento que reconoce un proyecto difiere del corriente en cinco de los siete españoles, y sin él la ficha no se puede contrastar contra el DOUE. Ningún consumidor de la 1.1 se rompe: es opcional. |
| **1.1.0** | 2026-08-05 | **Aditiva.** Manifiesto: `arbol`, `ambito`, `en_preparacion`, `registro: analisis` (§3). Reglas de doctrina numeradas R1–R5 y ampliadas con **R6** (metadato huérfano), **R7** (`activo` no se escribe) y **R8** (dominio que contradice a la mina que contiene, sin diente hasta F3) (§6.4). Nuevo §6.5: el campo derivado `activo` y su tabla de mapeo, cerrando el matiz abierto de D3. Nuevo campo controlado `fase` en `minerales-proyectos` (§10) y su vocabulario (§9). §7: bbox según `ambito`, fechas no futuras, comprobación del manifiesto, y separación explícita entre avisar y bloquear. §11: el ejemplo canónico pasa a **validar de verdad** y es el fixture del CI. |
| **1.0.0** | 2026-07-22 | Contrato inicial: GeoJSON RFC 7946 WGS84, manifiesto de capas, propiedades planas, campos en español, sufijos `__v`/`__f`, fuentes tipadas, doctrina como validación de CI, releases etiquetadas, nada se borra. |

**Compatibilidad 1.0.0 → 1.1.0.** Ningún campo se renombró ni cambió de
semántica; todo lo nuevo es opcional salvo `fase`, que es obligatorio en una capa
—`minerales-proyectos`— que **todavía no tiene datos publicados**. No hay nada
que migrar: la 1.1 llega antes que el primer dato, que era exactamente el momento
de hacerla.
