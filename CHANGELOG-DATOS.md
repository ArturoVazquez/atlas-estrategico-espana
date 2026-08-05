# CHANGELOG de datos

Una entrada por **release de datos** (etiqueta Git `datos-vAAAA.MM`, con sufijo
`.N` si hay más de una en el mismo mes; contrato §8).
Cada entrada dice **qué cambió, por qué y con qué evidencia** — y alimenta la
respuesta en el hilo de El Tercio de esa capa.

Esto no es un registro de commits: es el registro de lo que un lector externo
necesita saber para confiar en una versión de los datos, o para desconfiar de la
anterior con motivo.

**Formato de cada entrada:**

```
## datos-vAAAA.MM — título

### Añadido
- capa/registro — qué entra, con su fuente

### Corregido
- capa:slug · campo — valor viejo → valor nuevo, y la fuente que lo obliga

### Retirado
- capa:slug — a `estado_registro: retirado`, y por qué. (Nunca borrado.)

### Huecos
- lo que sigue sin fuente primaria, dicho en voz alta
```

La sección **Huecos** no es opcional ni decorativa. Una release que no declara lo
que no sabe está afirmando que lo sabe todo.

---

## datos-v2026.08.1 — La geometría deja de ser una promesa

La release anterior declaró su propia deuda: los once puntos eran aproximación
al municipio **sin fuente cartográfica primaria**, y ninguna coordenada servía
para medir. Esta la salda hasta donde la evidencia da, y dice dónde no da.

Dos documentos entran en `fuentes/`: la respuesta del **Nomenclátor Geográfico
Básico de España** (IGN) para los ocho topónimos usados, y un extracto del
**Catastro Minero** (MITECO) con los 23 derechos que corroboran dónde cae cada
cosa. Se archiva la respuesta del servicio con su URL de consulta, no un resumen:
la coordenada tiene que poder comprobarse sin fiarse de nadie.

**Segunda release del mismo mes**, de ahí el sufijo `.1` que estrena el contrato
en §8. `datos-v2026.08` no se mueve ni se reescribe.

### Corregido

Ocho registros pasan de `geo_precision: municipio` a **`paraje`**, con la
coordenada del topónimo del IGN, su `geo_fuente__f` a la fuente archivada y el
CRS declarado en `geo_fuente`:

- **`aguablanca`** — −6.2708, 38.0805 → **−6.1767, 37.9541**. *Paraje
  «Aguablanca». **Se movía 16,2 km**: el punto viejo caía sobre un portal del
  casco urbano de Monesterio. Corrobora el catastro, con la reserva «AGUA
  BLANCA» de Río Narcea Recursos S.A., el promotor que reconoce el DOUE.*
- **`p6-metals`** — −6.0491, 39.1836 → **−6.10629, 39.07752**. *Vértice
  geodésico «La Parrilla», 12,7 km al sur. Tres concesiones de wolframio de
  Iberian Resources Spain S.L. a menos de dos kilómetros.*
- **`matamulas`** — −3.363, 38.638 → **−3.2633, 38.61987**. *Montaña «Cerro de
  Matamulas», 8,9 km. Los permisos «MATAMULAS» y «REMATAMULAS-2» (este, de
  tierras raras) de Quantum Minería caen ahí.*
- **`escuzar`** — −3.749, 37.087 → **−3.80218, 37.0517**. *«Minas de Escúzar»,
  6,1 km. La concesión de estroncio «CARBONERO 2» de Solvay Minerales, a 150 m.*
- **`las-navas`** — −6.3927, 39.7896 → **−6.37231, 39.8385**. *«Mina las Navas»,
  5,7 km. Único de los ocho sin corroboración en el catastro.*
- **`montevives`** — −3.66, 37.11 → **−3.69098, 37.10274**. *Vértice geodésico
  «Montevives», 2,9 km. Tres concesiones de estroncio a menos de 300 m.*
- **`mina-doade`** — −8.2846, 42.4665 → **−8.31852, 42.46576**. *Lugar de Doade,
  2,8 km. Es el sitio que da nombre al proyecto, no la labor minera.*
- **`sepiolita-madrid`** — −3.6083, 40.4043 → **−3.59808, 40.4129**. *«Sepiolita»,
  1,3 km. El Grupo Minero Victoria son seis concesiones de TOLSA en ese entorno.*

Los once puntos —también los tres que no se movieron— se comprobaron por
punto-en-polígono contra los límites administrativos del IGN: **los once caen
dentro del municipio que la ficha declaraba**.

### Degradado

- **`las-cruces` baja de `confirmado` a `parcial`.** No es un cambio de
  geometría: es lo que la pasada de geometría descubrió. El topónimo «Las
  Cruces» del IGN cae en **Guillena** y la concesión «LAS CRUCES» de Cobre las
  Cruces S.A. es **multiparte** y toca **Salteras**; la ficha dice **Gerena**, y
  ese campo nunca tuvo fuente. No se elige entre los tres términos ni se inventa
  la lista: se declara el hueco, y **R4** hace el resto. Se sabe lo mismo que
  ayer; lo que hay hoy es constancia de que algo está sin resolver.

### Huecos

- **La geometría de tres registros sigue en `municipio`**, y ahora se sabe por qué:
  - **`circular`** — es una planta industrial, no una mina. Ni derecho minero en
    el emplazamiento ni topónimo: 179 revisados en el entorno, ninguno pertinente.
  - **`el-moto`** — **957 topónimos barridos** en 30×25 km alrededor de Abenójar,
    ni uno dice «Moto». Existe la concesión «SOL I (EL MOTO)» (wolframio,
    otorgada, en Abenójar), pero es un perímetro de 4,3×3,7 km: un punto sacado de
    ahí no sería mejor dato, solo mejor vestido.
  - **`las-cruces`** — el conflicto de municipio de arriba. Falta la autorización
    ambiental o la resolución de la Junta que enumere los términos afectados.
- **`matamulas` sigue `no_verificado` global** pese a ganar sus dos primeras
  fuentes primarias. Lo que le falta es el expediente —resolución de la Junta,
  sentencia del TSJ, casación— y el catastro no lo sustituye.
- **Señales levantadas, no resueltas.** Tres promotores donde la ficha y el
  catastro no coinciden: `montevives` (la ficha dice Canteras Industriales; las
  concesiones están a nombre de particulares de la familia Fajardo Álvarez),
  `el-moto` (Abenojar Tungsten en el DOUE; Mining Hill's en el catastro) y
  `mina-doade` (Recursos Minerales de Galicia en el DOUE; el permiso de litio
  colindante es de Solid Mines España). Titular y operador pueden ser distintos;
  hoy no está verificado. Y los tres permisos de `matamulas` figuran
  **caducados**, dato que no se traslada a `fase`: un permiso caducado no dice
  por sí solo si el proyecto está parado o cerrado.

### Contrato

Sube a **1.3.0**. `geo_fuente` admite `__v`/`__f` (§5) y la geometría deja de ser
el único dato del atlas cuya procedencia no se podía comprobar. Nuevo **§6.6**
con la tabla de qué precisión concede cada clase de fuente, y nueva regla **R9**:
una `geo_precision` de `exacta` o `paraje` exige fuente primaria. Entra con
diente y con dos fixtures —18 pruebas—, no declarada y pendiente.

Dos cosas del contrato salieron de tocar la fuente, no de escribirlo:

- **El CRS, resuelto por evidencia.** La malla legal de cuadrículas mineras de
  20″ (Ley 22/1973, art. 76) está confeccionada en **ED50**, y los 2.426 vértices
  de los 306 derechos de sección C de Badajoz caen a un desfase mediano de
  −4,45″ en latitud y +4,84″ en longitud de esa malla —137 m y 118 m—, que es
  exactamente la transformación ED50→ETRS89. Luego lo que publica el MITECO **ya
  está en ETRS89**, igual que el NGBE. No había reproyección que hacer, y ese era
  el riesgo de 200 m con el que se abrió la tanda.
- **Un punto representativo no hereda la precisión de su polígono** (§6.6). La
  reserva «AGUA BLANCA» son 95 cuadrículas (~28 km²) y la concesión «LAS CRUCES»
  tiene cuatro piezas disjuntas: su centroide cae donde no hay concesión.
  Consecuencia dicha entera: **mientras la capa sea de puntos, `exacta` es
  inalcanzable por construcción**. Se llega ascendiendo a polígono, no
  reetiquetando el punto — y eso es F3.

Licencias comprobadas **antes** de extraer, como ordena `datos/LICENCIA-DATOS.md`:
IGN bajo licencia declarada compatible con CC BY 4.0; catastro minero bajo el
régimen de reutilización de la Ley 37/2007, con atribución y sin ShareAlike ni
NonCommercial.

---

## datos-v2026.08 — Minerales críticos: la primera colección

Primera release del atlas. Migra los registros de la demo de referencia al
formato canónico, **con una pasada de verificación documental que corrigió
bastante de lo que la demo daba por bueno**.

Tres documentos entran en `fuentes/`, y son los que sostienen todo lo demás:
la **Decisión (UE) 2025/840** de la Comisión (DOUE de 30.4.2025) con su anexo,
y dos volúmenes del **Panorama Minero del IGME** (Estroncio 2021 y Arcillas
especiales 2021).

### Añadido

- **`minerales-proyectos`** — 11 registros: los 7 proyectos españoles de la
  primera lista CRMA, 3 de producción singular y 1 en disputa.
- **`minerales-proyectos:escuzar`** — registro NUEVO. No existía en la demo.

### Corregido

- **`el-moto` · promotor** — hueco → **Abenojar Tungsten S.L.** El anexo del
  DOUE lo nombra sin ambigüedad. *Uno de los cuatro huecos de partida, cerrado
  con fuente primaria y no con una atribución plausible.*
- **`montevives` · municipio** — Escúzar → **Las Gabias y Alhendín**. El IGME
  sitúa Montevives ahí y describe Escúzar como un yacimiento **distinto**, a
  7 km, con otro titular (Solvay Minerales S.A.). La demo fundía los dos en una
  ficha; aquí se separan en dos registros.
- **`sepiolita-madrid` · nombre** — «Sepiolita de Vicálvaro» → **Sepiolita de
  Madrid**. El informe del IGME no menciona Vicálvaro en ningún momento: habla
  del Grupo Minero Victoria.
- **`p6-metals` · nombre y materias** — el proyecto se llama oficialmente
  **P6 Metals**; «La Parrilla» es la mina, y la demo los tenía al revés. El
  anexo reconoce **solo wolframio**: el estaño no figura.
- **`las-cruces` · materias y latitud** — el anexo reconoce **solo cobre** (no
  zinc, plomo ni plata). La latitud pasa de 37,7275 a **37,5275**: la de la demo
  caía unos 22 km al norte del municipio.
- **`circular` · materias** — el anexo reconoce cobre, níquel y PGM. **Oro,
  plata y estaño no figuran** y salen del registro.
- **`aguablanca`, `mina-doade`, `las-navas` · promotor** — confirmados con la
  razón social exacta del DOUE. La vinculación de Doade con el Grupo Samca, que
  circula en prensa, **no está en el anexo** y no se recoge.

### Degradado

- **Cinco registros bajan de `confirmado` a `parcial`** (`circular`,
  `mina-doade`, `p6-metals`, `montevives`, `sepiolita-madrid`). No es un cambio
  de datos: es la regla **R4** haciendo su trabajo la primera vez que toca datos
  reales. Los cinco declaran un hueco, y un hueco reconocido impide el
  confirmado global. `confirmado` queda reservado a lo que tiene primaria **y
  nada declarado como pendiente**.

### Huecos

Se publican como huecos, no como rellenos:

- **`matamulas` — el registro entero.** Único sin una sola fuente primaria, y
  por eso el único `no_verificado` global. Falta la resolución de la Junta que
  deniega la autorización, la sentencia del TSJ de Castilla-La Mancha y el
  estado del recurso de casación ante el Tribunal Supremo.
- **«España, único productor de estroncio de la UE»** y **«único productor de
  sepiolita a escala industrial en la UE»** — dos afirmaciones de cabecera de la
  demo que **la fuente primaria consultada NO sostiene**. El IGME habla de
  «posición prominente como país productor» y no compara con la Unión Europea.
  Quedan registradas como claves no verificadas, con su hueco.
- **«Mayor yacimiento del mundo»** (sepiolita) y **«25 % de la demanda europea»**
  (P6 Metals) — repetidas en prensa, sin fuente técnica localizada.
- **Las cifras de CirCular** (410 M€ · 350 empleos · 60.000 t/año) y **el
  calendario de Doade** (2027-2028, 500.000 t/año) — anuncios del promotor.
- **La geometría de los 11 registros.** `geo_precision: municipio` con
  `geo_fuente` que lo dice: aproximación al municipio, **sin fuente cartográfica
  primaria**. Sustituirla por el catastro minero o el Nomenclátor del IGN es
  trabajo pendiente, y hasta entonces ninguna coordenada sirve para medir.

### Contrato

Sube a **1.2.0**: campo opcional `nombre_oficial`. Salió de esta misma pasada —
el nombre oficial difiere del corriente en cinco de los siete proyectos
españoles, y sin él una ficha no se puede contrastar contra el DOUE.
