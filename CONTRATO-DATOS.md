# CONTRATO DE DATOS — Atlas Estratégico de España

**Versión del contrato:** 1.0.0 · **Fecha:** 2026-07-22
**Ámbito:** todo dato publicado por el atlas. Este documento es la fuente de verdad;
el código se adapta al contrato, nunca al revés.

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
atlas/
├── CONTRATO-DATOS.md          ← este documento
├── CHANGELOG-DATOS.md         ← una entrada por release de datos
├── datos/
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
│   ├── validar.py             ← esquema + reglas de doctrina (§7)
│   └── vigilar.py             ← comprobación de URLs y caducidad (avisa, no escribe)
└── app/                       ← el visor (consume datos/ por release etiquetada)
```

Reglas de la estructura:

- `datos/` es **curado a mano**; `pipeline/` **valida y vigila, nunca genera datos**.
- Toda fuente citada por URL se **archiva** en `fuentes/` en el momento de la cita.
- La app **no lee ficheros vivos**: lee la última release etiquetada (§8).

---

## 3 · El manifiesto de capas

`datos/manifest.json` registra cada capa. Añadir una capa al atlas = añadir su
fichero y su entrada aquí. La app construye el panel desde el manifiesto.

```json
{
  "schema_version": "1.0.0",
  "release": "2026.07",
  "capas": [
    {
      "id": "minerales-proyectos",
      "titulo": "Minerales críticos — proyectos",
      "grupo": "actividad",
      "geometria": "puntos",
      "registro": "verificado",
      "cadencia_revision_dias": 120,
      "verificado_a": "2026-07-22",
      "version": "1.0.0",
      "fichero": "capas/minerales-proyectos.geojson",
      "licencia": "CC-BY-4.0",
      "atribucion": "Atlas Estratégico de España"
    }
  ]
}
```

| Campo | Valores / notas |
|---|---|
| `grupo` | `dotacion` (lo que tiene) · `actividad` (lo que se trabaja). Abierto a nuevos grupos por versión menor. |
| `geometria` | `puntos` · `poligonos` · `lineas` · `mixta` |
| `registro` | `verificado` (fichas con doctrina completa) · `ilustrativo` (dibuja dónde, no cuánto ni de quién) |
| `cadencia_revision_dias` | umbral tras el cual la capa se considera caducada; el visor lo muestra, `vigilar.py` avisa |
| `version` | semver de la **capa**: parche = corrección de valores; menor = registros o campos nuevos; mayor = cambio de esquema |

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

- `verif: confirmado` del registro ⇒ existe al menos una fuente `primaria`.
- Un campo con `__v: confirmado` ⇒ su `__f` apunta a una fuente `primaria`.
- Una fuente `corporativa` o `prensa` **no puede** ser la `__f` de un valor `confirmado`.
- Existe una fuente `tipo: hueco` ⇒ el registro no puede ser `confirmado` global.
- `registro: ilustrativo` en el manifiesto ⇒ la capa no declara `__v` por campo y
  toda su geometría es `geo_precision: ilustrativa`; su ficha lo dice.

---

## 7 · Validación — el contrato con dientes

`pipeline/validar.py` corre en CI sobre cada PR a `datos/`. La doctrina deja de
ser prosa y pasa a ser test:

1. **Esquema:** cada capa valida contra `nucleo.schema.json` + su extensión.
2. **Identidad:** `slug` únicos por capa; `id` = `capa:slug`; ids nunca
   desaparecen entre releases (solo cambian de `estado_registro`).
3. **Doctrina:** las reglas de §6.4, mecánicamente.
4. **Geometría:** WGS84 plausible (bbox de España), ≤5 decimales, anillos
   cerrados y orientados según RFC.
5. **Fechas:** `fecha_verificacion` ≥ `fecha_alta`; formato ISO-8601.
6. **Vocabularios:** todo enum contra `vocabularios.json`.
7. **Archivo de fuentes:** toda fuente con `url` y tipo ≠ `hueco` referencia un
   `archivo` existente en `fuentes/` (aviso, no bloqueo, durante la v1).

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
| Renombrar/eliminar campo o cambiar semántica | **mayor de contrato** | prohibido sin migración documentada |

---

## 9 · Vocabularios controlados (arranque)

`datos/vocabularios.json` — añadir valores es versión menor de contrato:

- `verif`: `confirmado` · `parcial` · `no_verificado`
- `estado_registro`: `vigente` · `historico` · `retirado`
- `geo_precision`: `exacta` · `paraje` · `municipio` · `ilustrativa`
- `fuente.tipo`: `primaria` · `prensa` · `corporativa` · `hueco`
- `grupo` (manifiesto): `dotacion` · `actividad`
- `categoria` por capa:
  - *minerales-proyectos*: `estrategico_ue` · `produccion_singular` · `en_disputa`
  - *minerales-dominios*: `activo` · `historico` · `desarrollo` · `disputa` · `mixto`
  - *cables-submarinos*: `aterrizaje` · `trazado`
  - *recurso-eolico* / *recurso-solar*: `zona`

---

## 10 · Esquemas por capa (campos específicos, planos)

**minerales-proyectos** (`actividad`, puntos, verificado):
`materias[]` (✔) · `tipo_proyecto` (✔: extracción / procesamiento / refino /
reciclaje, combinables) · `municipio` (✔) · `provincia` (✔) · `promotor` (+`__v`,`__f`)
· `estado_proyecto` (+`__v`,`__f`,`_fecha`) · `claves[]`

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
    "promotor__v": "confirmado",
    "promotor__f": "f2",
    "estado_proyecto": "Reactivación en curso",
    "estado_proyecto__v": "parcial",
    "estado_proyecto__f": "f1",
    "estado_proyecto_fecha": "2025-03-25",
    "claves": [],
    "fuentes": [
      { "id": "f1", "tipo": "primaria",
        "titulo": "Comisión Europea — 1ª lista de Proyectos Estratégicos CRMA",
        "fecha": "2025-03-25", "url": "https://…",
        "archivo": "fuentes/2026-07-22_ce_lista-crma-1.pdf" },
      { "id": "f2", "tipo": "prensa",
        "titulo": "elEconomista — Quién está detrás de los 7 proyectos",
        "fecha": "2025-03-31", "url": "https://…",
        "archivo": "fuentes/2026-07-22_ee_detras-7-proyectos.pdf" }
    ],
    "nota": "La inclusión en la lista CRMA es un hecho oficial.",
    "debate_url": "https://www.eltercioviejo.com/bandera/hac/hilo/…"
  }
}
```

*(Obsérvese que `promotor__v: confirmado` con `promotor__f: f2` —prensa— violaría
§6.4 y el CI lo rechazaría: en el dato real habría que localizar fuente primaria
del promotor o degradar a `parcial`. El ejemplo con f2 en prensa exigiría
`promotor__v: parcial`.)*

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
