# CONTRATO DE DATOS — Atlas Estratégico de España

**Versión del contrato:** 1.2.0 · **Fecha:** 2026-08-05
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
│   ├── pruebas/               ← fixtures: uno válido y uno por regla de §6.4
│   ├── validar.py             ← esquema + reglas de doctrina (§7)
│   └── vigilar.py             ← comprobación de URLs y caducidad (avisa, no escribe)
├── referencia/                ← la demo v4: canon de interacción, no de código
├── app/                       ← el visor (consume datos/ por release etiquetada)
└── .github/workflows/         ← validar.yml (cada PR) · vigilar.yml (semanal)
```

Reglas de la estructura:

- `datos/` es **curado a mano**; `pipeline/` **valida y vigila, nunca genera datos**.
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
| `cadencia_revision_dias` | umbral tras el cual la capa se considera caducada; el visor lo muestra, `vigilar.py` avisa |
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
| `geo_fuente` | string | – | de dónde sale la geometría (p. ej. `catastro minero`, `mano alzada`) |
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
| `minerales-dominios` | `caracter` (§10, vocabulario) | `caracter ∈ {activo, mixto}` |
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
dominio alberga un registro en producción, entonces su `caracter` correcto es
`mixto` —que existe precisamente para eso— y declararlo `desarrollo` es
sencillamente un **error de dato**.

Así que se convierte en una comprobación, no en una derivación:

| | Regla |
|---|---|
| **R8** *(1.1)* | Un polígono de `minerales-dominios` con `caracter ∈ {desarrollo, historico}` **no puede contener** un registro de `minerales-proyectos` con `fase == "produccion"`. Si lo contiene, su `caracter` es `mixto` o `activo`. |

Esto atrapa la mentira en el fichero en lugar de disimularla en pantalla, que es
la doctrina del proyecto entera en miniatura.

> **Estado de R8:** normativa desde la 1.1, **implementada en `validar.py` cuando
> exista la capa `minerales-dominios`** (fase F3 del plan). Es la única regla de
> este documento que hoy no tiene diente, y queda dicho aquí en vez de
> descubrirse por su ausencia. Las ocho restantes corren desde F0.

---

## 7 · Validación — el contrato con dientes

`pipeline/validar.py` corre en CI sobre cada PR a `datos/`. La doctrina deja de
ser prosa y pasa a ser test:

1. **Esquema:** cada capa valida contra `nucleo.schema.json` + su extensión.
2. **Identidad:** `slug` únicos por capa; `id` = `capa:slug`; ids nunca
   desaparecen entre releases (solo cambian de `estado_registro`).
3. **Doctrina:** las reglas **R1–R7** de §6.4, mecánicamente. El mensaje de error
   **nombra la regla** (`R3: la fuente f2 es de tipo prensa…`), no describe un
   fallo de esquema: quien lo lee tiene que poder ir al contrato.
4. **Geometría:** WGS84 plausible, ≤5 decimales, anillos cerrados y orientados
   según RFC. El recuadro de plausibilidad depende del `ambito` de la capa
   *(1.1)*: `espana` valida contra el bbox del territorio —**Canarias incluidas**,
   `[-18.3, 27.5, 4.4, 43.9]`—; `mundo` solo contra el rango legal de WGS84.
5. **Fechas:** `fecha_verificacion` ≥ `fecha_alta`; formato ISO-8601; ninguna
   fecha en el futuro *(1.1)*.
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

`pipeline/vigilar.py` corre programado (Action semanal): URLs muertas y capas que
superan su `cadencia_revision_dias` → abre issue. **Avisa; jamás escribe datos.**

---

## 8 · Versionado y releases

- **Release de datos:** etiqueta Git `datos-vAAAA.MM` (p. ej. `datos-v2026.07`).
  El visor consume siempre una release etiquetada, nunca la rama viva.
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
| Añadir una regla de coherencia `R*` *(1.1)* | menor de contrato | entra con su implementación en `validar.py`, **o con su estado declarado** si aún no la tiene (como R8) |
| Renombrar/eliminar campo o cambiar semántica | **mayor de contrato** | prohibido sin migración documentada |

**El contrato no puede mentir sobre sí mismo.** Una regla escrita aquí que el CI
no comprueba es prosa disfrazada de garantía — el fallo exacto que este documento
existe para evitar. Por eso toda `R*` sin diente lleva su estado escrito al lado
(hoy: solo R8), y por eso §7 separa lo que avisa de lo que bloquea.

---

## 9 · Vocabularios controlados (arranque)

`datos/vocabularios.json` — añadir valores es versión menor de contrato:

**Del registro:**

- `verif`: `confirmado` · `parcial` · `no_verificado`
- `estado_registro`: `vigente` · `historico` · `retirado`
- `geo_precision`: `exacta` · `paraje` · `municipio` · `ilustrativa`
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
- *minerales-dominios*: `activo` · `historico` · `desarrollo` · `disputa` · `mixto`
- *cables-submarinos*: `aterrizaje` · `trazado`
- *recurso-eolico* / *recurso-solar*: `zona`

> **`fase` y `categoria` no son lo mismo, aunque compartan palabras.**
> `categoria` dice **qué clase de cosa es** un registro (por qué está en el
> atlas); `fase` dice **en qué punto de su vida está** (§6.5). Una mina puede ser
> `estrategico_ue` y estar en `tramitacion`, o dejar de estarlo sin cambiar de
> categoría. Que `minerales-dominios` use `caracter` con valores parecidos a
> `fase` es deliberado: un dominio no tiene fases, tiene carácter — describe una
> comarca entera, no un expediente.

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

**minerales-dominios** (`dotacion`, polígonos, ilustrativo→verificado):
`materias[]` (✔) · `caracter` (✔, vocabulario) · `distritos[]` · `sym` (etiqueta
corta de mapa)

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

---

## 12 · Decisiones de diseño registradas

1. **Propiedades planas** (no anidadas) salvo `fuentes` y `claves` → interop GIS.
2. **Nombres de campo en español** → coherencia de proyecto; coste asumido.
3. **Sufijos `__v`/`__f`** como espacio de nombres de metadato por campo →
   verificación por campo sin romper el modelo plano.
4. **Doctrina como validación de CI**, no como prosa → §6.4/§7.
5. **La app lee releases etiquetadas**, nunca la rama viva.
6. **`vigilar.py` avisa y jamás escribe** → el criterio humano firma; la máquina
   instruye (compatible con el futuro pipeline de expedientes).
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

---

## 13 · Historial del contrato

| Versión | Fecha | Qué cambió |
|---|---|---|
| **1.2.0** | 2026-08-05 | **Aditiva.** Campo opcional `nombre_oficial` (+`__v`,`__f`) en `minerales-proyectos` (§10). Salió de la propia F1: el nombre oficial del documento que reconoce un proyecto difiere del corriente en cinco de los siete españoles, y sin él la ficha no se puede contrastar contra el DOUE. Ningún consumidor de la 1.1 se rompe: es opcional. |
| **1.1.0** | 2026-08-05 | **Aditiva.** Manifiesto: `arbol`, `ambito`, `en_preparacion`, `registro: analisis` (§3). Reglas de doctrina numeradas R1–R5 y ampliadas con **R6** (metadato huérfano), **R7** (`activo` no se escribe) y **R8** (dominio que contradice a la mina que contiene, sin diente hasta F3) (§6.4). Nuevo §6.5: el campo derivado `activo` y su tabla de mapeo, cerrando el matiz abierto de D3. Nuevo campo controlado `fase` en `minerales-proyectos` (§10) y su vocabulario (§9). §7: bbox según `ambito`, fechas no futuras, comprobación del manifiesto, y separación explícita entre avisar y bloquear. §11: el ejemplo canónico pasa a **validar de verdad** y es el fixture del CI. |
| **1.0.0** | 2026-07-22 | Contrato inicial: GeoJSON RFC 7946 WGS84, manifiesto de capas, propiedades planas, campos en español, sufijos `__v`/`__f`, fuentes tipadas, doctrina como validación de CI, releases etiquetadas, nada se borra. |

**Compatibilidad 1.0.0 → 1.1.0.** Ningún campo se renombró ni cambió de
semántica; todo lo nuevo es opcional salvo `fase`, que es obligatorio en una capa
—`minerales-proyectos`— que **todavía no tiene datos publicados**. No hay nada
que migrar: la 1.1 llega antes que el primer dato, que era exactamente el momento
de hacerla.
