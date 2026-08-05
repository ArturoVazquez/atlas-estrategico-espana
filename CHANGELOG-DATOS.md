# CHANGELOG de datos

Una entrada por **release de datos** (etiqueta Git `datos-vAAAA.MM`, contrato §8).
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
