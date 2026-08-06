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

## datos-v2026.08.8 — Los derechos mineros, y el punto → polígono que NO se hace

Entra **`minerales-derechos`**: 106 derechos del Catastro Minero con su
perímetro. Es la **primera capa del atlas con `geo_precision: exacta`**, y lo es
por un motivo estrecho — la geometría *es* el derecho que la fuente define.

### El hallazgo, y es feo

**La exportación en CSV del Catastro Minero trunca las coordenadas a 424
caracteres.** De los 106 derechos que interesan, **38 vienen cortados** y en
**29 lo que se pierde es una esquina real**, no el vértice de cierre —
comprobado comparando el fragmento truncado contra el primer vértice.

Un polígono al que le falta una esquina **cierra igual y parece correcto**. Es
el peor fallo que este atlas puede cometer, y lo sirve la fuente.

El mismo endpoint con `extension=SHP` devuelve el shapefile completo, y su
`.prj` declara **ETRS89 con TOWGS84 a ceros** — confirmando por la fuente lo
que F1 dedujo midiendo 2.426 vértices. **Toda la geometría de esta capa sale del
shapefile; ninguna del CSV**, y está comprobado registro a registro.

### Lo que NO se hace, y por qué

PLAN.md preveía subir `minerales-proyectos` de punto a polígono con este mismo
catastro. **No se hace.** El catastro define *derechos*, no minas, y qué derecho
«es» un proyecto no lo contesta ningún documento: **TOLSA tiene 54 derechos solo
en Madrid**, Solvay seis en Granada, Iberian Resources cuatro entre Badajoz y
Cáceres. Elegir uno sería una atribución sin fuente.

Se publican las dos capas, se solapan en el mapa, y **el lector ve el solape**,
que sí es un hecho.

### Añadido

- **`minerales-derechos` — 106 registros**: 55 vigentes, 16 en tramitación,
  **35 extinguidos**. Regla de selección mecánica y declarada: los derechos cuyo
  titular es un promotor que el atlas ya registra.
- **Ocho shapefiles provinciales** archivados en `fuentes/`.
- Contrato **1.12.0**, con la enmienda de §6.6: «del objeto mismo» quiere decir
  del objeto que la fuente define **y de ningún otro**.

### Corregido

- **Nueve registros con el anillo exterior al revés**, cazados por §7.4 antes de
  publicarse. Agrupé los anillos por índice; el shapefile los distingue por
  **orientación** (exterior horario, hueco antihorario — al revés que RFC 7946).
  Con eso bien, «LA MONAGUERA» resulta ser **tres piezas disjuntas** y «DEMASÍA A
  CARABAÑA» tiene **un hueco de verdad**.
- **Mojibake silencioso.** El `.dbf` trae la página de códigos sin declarar
  (0x00) y el contenido en UTF-8: leerlo como latin-1 —lo que manda el formato de
  1998— convierte «CARABAÑA» en «CARABAÃ‘A» sin lanzar un solo error.

### Huecos

- **`superficie_declarada` no concuerda con el perímetro, y se publica igual.**
  Cada unidad vale ~0,30 km² con el código «C» y ~0,22 km² con el código «H»,
  que el catastro rotula «hectáreas» (0,01 km²). El atlas **no elige** entre dos
  datos de la misma fuente: publica el perímetro, que es el que esa fuente
  dibuja, y deja el campo verbatim, sin `__v`, con su desacuerdo dicho.
- **Solo ocho provincias**, las que tienen proyectos registrados. TOLSA o Solvay
  pueden tener derechos en otras; no se insinúa que no los tengan.
- **Un derecho no dice que haya mina.** Por eso `activo` figura como «no aplica»
  en §6.5: se puede tener una concesión décadas sin abrir nada.
- **Qué derecho corresponde a cada proyecto sigue sin saberse**, y esta release
  no lo insinúa: no hay ningún campo que los enlace.

---

## datos-v2026.08.7 — Las aguas sin delimitar, y las dos leyes que no dibujan nada

Entra **`espacios-maritimos`** y con ella **se cierra F3**. Seis capas
publicadas.

### El hallazgo

**Ni la ley marroquí 37-17 ni la 38-17 contienen una sola coordenada.** Se
comprobó sobre el texto íntegro del Boletín Oficial marroquí n.º 6870, ahora
archivado: la 37-17 fija el mar territorial en 12 millas «desde las líneas de
base» y remite sus coordenadas a un reglamento posterior; la 38-17, en su
artículo 11, manda delimitar la zona económica exclusiva «a fin de alcanzar un
resultado equitativo, en particular con los Estados cuyas costas son adyacentes
o están frente a las del Reino de Marruecos» — contempla **acuerdo**, no
trazado unilateral.

Seis años de titulares dicen que Marruecos dibujó una línea sobre aguas
canarias. Los instrumentos no dibujan ninguna línea. Va en la ficha, con la cita.

### Añadido

- **`espacios-maritimos` — 4 registros.** La zona sin delimitación acordada
  Canarias–Marruecos (ilustrativa), el límite exterior de la plataforma
  continental al oeste de Canarias (448 puntos fijos), el contorno perimetral de
  las aguas canarias (Ley 44/2010) y el Monte Tropic.
- **Siete fuentes primarias**, todas archivadas: el BO marroquí, la nota verbal
  marroquí ante la ONU, la respuesta española, el resumen ejecutivo de la CLCS,
  la Ley 44/2010, el RD 2510/1977 y el gazetteer GEBCO/SCUFN.
- Contrato **1.11.0**: la capa en §10, su `categoria` en §9, su fila en §6.5 y
  el primer `ambito: mundo` con geometría real.

### Corregido

- **`espacios-maritimos:contorno-aguas-canarias` · geometría** — el anillo del
  Anexo I recorre el archipiélago en sentido **horario**; RFC 7946 pide
  antihorario para el exterior. Invertido al construirlo.
- **Una suposición de la tanda anterior**, que estaba escrita en dos sitios: se
  dio por hecho que un polígono ilustrativo obligaría a la capa entera a ser
  `ilustrativo` por R5. **No es así** — R5 va de la capa hacia la geometría y no
  al revés. Por eso esta capa es `verificado` y contiene una zona `ilustrativa`.
- **La otra suposición**: se dio por perdido cualquier instrumento marroquí.
  Estaba en `sgg.gov.ma`.

### Huecos

- **El perímetro de la zona sin delimitar.** Ningún instrumento lo dibuja. Lo
  que se publica es un **esquema del corredor** entre el archipiélago y la costa
  africana, con su fuente `hueco`: **no delimita el alcance de la superposición
  de derechos**, que se extiende mucho más al suroeste. Trazar una línea mediana
  sería dictar el resultado que los dos Estados dejan a un acuerdo (D5).
- **Las leyes de las costras del Monte Tropic.** Las cifras de telurio y cobalto
  que circulan vienen de campañas científicas que este atlas no ha archivado, y
  **no se publican**. Del monte se registra su nombre y su posición, con la
  autoridad que lo nombra.
- **La Comisión no ha emitido recomendaciones** sobre la presentación española
  de 2014. Un límite depositado no es un límite reconocido, y la ficha lo dice.
- **Marruecos y España no discuten dónde va una línea, sino qué instrumento
  aplica.** Marruecos funda su objeción en la Ley 44/2010; España responde que
  «no define líneas de base y no ha sido en modo alguno empleada» y remite al RD
  2510/1977. El desacuerdo queda registrado, no resuelto.
- **Los dos ficheros grandes se archivan enteros.** El BO marroquí (165 páginas)
  y el resumen ejecutivo (40) pesan 4,5 MB cada uno. Un boletín recortado a las
  tres páginas que interesan deja de ser el boletín.

---

## datos-v2026.08.6 — Dieciséis dominios, y la última regla que era solo prosa

Entra la capa **`minerales-dominios`** y, con ella, **R8 deja de ser una regla
sin diente**. Desde el contrato 1.10 no queda ninguna: las nueve reglas de §6.4
las comprueba el CI.

### Añadido

- **`minerales-dominios` — 16 dominios**, migrados de la demo v4. Primera capa
  de polígonos del atlas. Faja Pirítica · Estaño–litio de Galicia · Wolframio
  del oeste · Litio–wolframio de Extremadura · Ossa-Morena · Oro del noroeste ·
  Fluorita de Asturias · Zinc cantábrico · Magnesita de Eugui · Potasas del
  Bages · Mercurio de Almadén · Wolframio de Alcudia · Tierras raras del Campo
  de Montiel · Celestina de Granada · Arcillas especiales del Tajo · Sierra de
  Cartagena.
- **R8 con diente.** Un dominio `desarrollo` o `historico` no puede contener una
  mina en producción. Es la **única regla que compara dos capas**, así que vive
  fuera de la validación por fichero: se comprueba cuando ambas entran en la
  misma pasada, que es siempre en CI.
- Contrato **1.10.0**: R8 entra en la tabla de §6.4, `caracter` y `categoria`
  dejan de ser dos campos con los mismos cinco valores, y §9 estrena los colores
  de la capa.

### Corregido

- **`oro-del-noroeste` · geometría** — el anillo venía en sentido **horario**
  desde la demo. RFC 7946 pide antihorario para el exterior, y hay visores que
  pintan del revés lo que reciben así. Invertido al migrar.

### Huecos

- **Los dieciséis perímetros, todos.** Ninguno tiene cartografía de fuente
  primaria: son trazados a mano alzada, cada uno con su fuente `tipo: hueco`
  diciéndolo, y por R4 ninguno pasa de `no_verificado`. **La capa entera es el
  hueco declarado**, no un adorno con una nota al pie.
- **El ascenso a cartografía del IGME no se ha hecho**, y no se puede hacer de
  uno en uno: R5 es regla de **capa**, no de registro, así que verificar la Faja
  Pirítica obligaría a verificar las quince restantes o a partir la capa en dos.
  Queda pendiente y dicho.
- **Los `distritos` son nombres, no coordenadas.** Riotinto, Tharsis o Reocín
  figuran como texto; quien quiera su posición la busca en `minerales-proyectos`
  o en el nomenclátor. Enumerarlos sin coordenada es honesto; fabricársela, no.
- **«Mina Circular» no cae dentro de ningún dominio.** No incumple nada —R8
  gobierna lo que un dominio SÍ contiene— pero es el choque entre un trazado a
  mano alzada y un centroide municipal en el mismo mapa, y queda anotado antes
  de que parezca un dato.

---

## datos-v2026.08.5 — El color deja de vivir en el código

Release **solo de vocabulario**: ningún registro cambia. Cada categoría de §9
lleva ahora su **`color`**, y con eso el mapa deja de pintar tres capas del
mismo gris.

### Corregido

- **`vocabularios.json` · `categoria`** — las diez categorías de las cuatro
  capas publicadas ganan `color`. Lo destapó tener cuatro capas encendidas a la
  vez: la paleta vivía cableada en el visor y solo conocía las tres categorías
  de `minerales-proyectos`, así que nuclear, gas y el tablero caían todos en el
  gris de reserva. Cuatro capas, indistinguibles en el mapa.

El color es **dato**, no decisión del programa, por el mismo motivo que el
rótulo y el orden: el vocabulario dice de sí mismo que el visor «no reordena, no
traduce y no elige colores». Consecuencia asumida: **cambiar un color exige una
release**, como cualquier cambio de vocabulario.

### Contrato

Sube a **1.9.0**: §9 documenta el campo `color` y su consecuencia.

---

## datos-v2026.08.4 — Gas y regasificación, y la cifra que nadie publica

Cuarta capa. Con ella **F3 cumple su criterio de hecho**: las tres capas que
pedía por su nombre —límites y soberanía, nuclear, gas y regasificación— están
publicadas, y ninguna ficha tiene prensa sosteniendo un confirmado.

### Añadido

- **`gas-regasificacion`** — las siete plantas de GNL del sistema gasista:
  Barcelona, Cartagena, Huelva, Bilbao, Sagunto, Mugardos y El Musel.

### Huecos

El hallazgo de esta tanda es lo que **no se pudo escribir**:

- **La capacidad de almacenamiento en m³ de GNL no está en ninguna fuente
  alcanzable.** Es la cifra que aparece en cualquier artículo sobre las
  terminales españolas, y no la publica ni el informe de supervisión del sistema
  gasista de la CNMC —descargado y revisado entero— ni las páginas de los
  operadores. Los dos campos de capacidad se declaran en el contrato y **nacen
  vacíos**, con su hueco en las siete fichas.
- **Enagás es una sociedad cotizada.** PLAN.md decía «fuentes Enagás/CNMC» sin
  notarlo: por §6.1 lo que Enagás publica sobre sí misma es `corporativa` y por
  **R3** no puede sostener un confirmado. Queda escrito en §10.

### Lo que sí quedó acreditado, y no lo compila nadie

- **Los topes de El Musel**, el único cuya capacidad está fijada por
  instrumento: 45 GWh/día (Orden TED/578/2023) y 11.744 GWh/año (resolución de
  26 de julio de 2024). Por eso su categoría es `logistica_gnl`: se construyó
  como regasificadora, se hibernó y opera como centro logístico.
- **Los días de 2025 por debajo del mínimo técnico**, planta a planta: Musel 27,
  Huelva 17, Mugardos 15, Barcelona 9, Cartagena 5, y **cero** en Bilbao y
  Sagunto.
- **Dos municipios que la prensa redondea:** la planta «de Huelva» está en
  **Palos de la Frontera** y la «de Bilbao» en **Zierbena**, y lo acredita en
  ambos casos una resolución del BOE.

### Geometría

Precisión de **municipio** en las siete, dicho en cada ficha: **el Nomenclátor
del IGN no nombra ninguna terminal**. Se barrieron los siete puertos —67
topónimos en Barcelona, 648 en la ría de Ferrol— y las únicas coincidencias eran
palabras que contienen «gas» por casualidad: *Pocilgas*, *Refradigas*, *Arangas*.

El contraste geográfico cazó de paso que el municipio se llama oficialmente
**«Sagunt/Sagunto»**, no «Sagunto» a secas.

### Contrato

Sube a **1.8.0**: §10 con el apartado de la capa, §9 con su `categoria` y §6.5
con su fila en la tabla de `activo`.

---

## datos-v2026.08.3 — El tablero: ocho territorios, ningún veredicto

Tercera capa, y la que da al atlas su carácter. El árbol **El tablero** estaba
vacío desde F0.

D5 fijó la doctrina hace tiempo: *el atlas registra que la reclamación existe y
quién la sostiene; no dicta veredicto*. Esta capa es esa frase convertida en
datos, con **dos campos simétricos** —`administrado_por` y `reclamado_por`— con
los que Gibraltar y Ceuta se describen con la misma estructura, y una
`categoria` de dos valores que dice **quién reclama, no quién tiene razón**.

### Añadido

- **`limites-soberania`** — ocho registros: `gibraltar`, `ceuta`, `melilla`,
  `penon-velez-gomera`, `penon-alhucemas`, `islas-chafarinas`, `perejil` y
  `olivenza`.

Es además la primera capa del árbol `tablero`, y por tanto la primera que
ejercita la rama «no aplica» de §6.5: su `activo` es `null` y el filtro de
explotación no la esconde nunca.

### Huecos

Esta capa es, sobre todo, un inventario de argumentos sin documento:

- **Ninguno de los tratados que se citan está archivado.** Utrecht (1713),
  Badajoz (1801) y el artículo 105 del Acta Final de Viena (1815) aparecen en
  cada discusión sobre Gibraltar y Olivenza, y no se ha localizado texto de
  **emisor autorizado** de ninguno. Van como huecos, y lo que sostienen queda
  `no_verificado`.
- **Tampoco hay instrumento marroquí archivado** para las reclamaciones sobre
  Ceuta, Melilla, las plazas de soberanía o Perejil. Se registra que la
  reclamación existe; no que esté acreditada.
- **La lista de Territorios No Autónomos de la ONU no se pudo archivar**: el
  servidor responde 202 sin contenido a las descargas automáticas.
- **Las plazas de soberanía no tienen estatuto que citar**, a diferencia de
  Ceuta y Melilla. Su régimen concreto queda pendiente.
- **`perejil` es el único `no_verificado` global** de la capa. De la isla lo
  único documentado es dónde está: quién la administra, con qué título y qué se
  acordó en 2002 no tienen texto público localizable.
- **Las aguas sin delimitar quedan fuera de esta tanda** —Canarias–Marruecos y
  su cruce con el monte Tropic—: piden polígono `ilustrativo`, activan **R5**
  sobre la capa y merecen su propia discusión cartográfica.

### Lo que sí quedó acreditado

Los **Estatutos de Autonomía de Ceuta y Melilla** (LO 1/1995 y 2/1995, texto
consolidado del BOE), la **posición oficial española sobre Gibraltar** (MAEC) y
la **Decisión (UE) 2026/1732 del Consejo** — que responde lo que F3 pedía
verificar sobre el acuerdo UE–Reino Unido: **firmado el 14 de julio de 2026 y en
aplicación provisional desde el 15, sin ratificar**, y sin alterar la posición
de ninguna parte sobre la soberanía. Comprobado sobre la copia archivada.

### Dos hallazgos de geometría

- **El Nomenclátor del IGN no nombra Gibraltar.** Tres resultados por etiqueta,
  todos falsos amigos en Huelva y Badajoz; 69 topónimos en el recuadro del
  Peñón, ninguno es Gibraltar. Su punto va puesto a mano y declarado
  `ilustrativa`: es la única coordenada de la capa sin fuente cartográfica.
- **«Melilla» estuvo a punto de quedarse en Huelva.** La consulta por nombre
  devuelve primero un homónimo onubense. Se eligió por posición — es la clase de
  error que no da ningún aviso y deja el dato a 400 km con aspecto de correcto.

### Contrato

Sube a **1.7.0**: §10 con el apartado de `limites-soberania` y §9 con su
`categoria`. No toca §6.5, que ya declaraba el tablero como «no aplica».

---

## datos-v2026.08.2 — Nuclear: siete reactores, y un calendario sin documento

Segunda capa del atlas, y la primera que estrena el mecanismo **sin ser la
primera**: `nuclear` entró por el manifiesto y apareció en el visor sin tocar
una línea de código de panel, que era el criterio con el que se cerró F2.

Ocho documentos nuevos en `fuentes/`: las **seis órdenes ministeriales del BOE**
que renuevan la autorización de explotación de cada central, la ficha de
**MITECO** con potencia, tecnología y titulares, y los topónimos del **IGN** que
sostienen la geometría.

### Añadido

- **`nuclear`** — siete registros, uno **por reactor** y no por central:
  `almaraz-i`, `almaraz-ii`, `asco-i`, `asco-ii`, `cofrentes`, `vandellos-ii` y
  `trillo-i`. Cada grupo tiene su propia autorización, su fecha y su potencia:
  son siete hechos, no cinco.

Los dos reactores de un mismo emplazamiento **comparten coordenada**, y se dice
en la ficha: separarlos exigiría una fuente que sitúe cada edificio y no la hay.
Los siete pasan el contraste de municipio contra los límites del IGN.

### Huecos

Esta capa es, sobre todo, un inventario de lo que se da por sabido sin documento:

- **El «calendario de cierre de 2019» no tiene fuente pública.** Se cita en todas
  partes como un hecho —Almaraz 2027 y 2028, Ascó 2030 y 2032, Cofrentes 2030,
  Vandellós II y Trillo 2035— pero procede de un **Protocolo de intenciones
  privado** entre Enresa y los titulares, y lo único localizable son notas de
  prensa. Así que **`cierre_acordado` va vacío en cinco de los siete**, con su
  hueco declarado, en lugar de rellenarse con la fecha que circula.
- **Solo dos lo llevan confirmado**, y por una razón concreta: sus propias
  órdenes llaman a la fecha de expiración «fecha de cese definitivo de
  explotación». Cofrentes lo dice literalmente y Ascó I también.
- **Tres órdenes no dan fecha de expiración**: dicen «validez de diez años» desde
  una fecha. Ascó II, Vandellós II y Trillo I llevan por eso su
  `autorizacion_hasta` como **`parcial`**, con una clave que reproduce el texto:
  es aritmética, no es una cita, y ni siquiera consta si el último día es el 1 o
  el 2 de octubre de 2031.
- **La prórroga de Almaraz no mueve ninguna fecha.** El CSN informó
  favorablemente en julio de 2026, pero **MITECO no ha resuelto**: lo autorizado
  sigue siendo el 1 de noviembre de 2027 para el grupo I y el 31 de octubre de
  2028 para el II. Queda como clave `no_verificado` con su hueco, y por **R4**
  eso impide el confirmado global de ambos. El «efecto dominó» sobre Ascó I y
  Cofrentes que anticipan los titulares es previsión en prensa: no toca nada.
- **El CSN y el BOE discrepan en un día** sobre Ascó I —2 de octubre de 2030
  frente al 1—. Se publica la de la orden, que es el instrumento, y la
  discrepancia queda escrita en la ficha.
- **Las centrales cerradas quedan fuera de esta tanda**: Garoña (2017),
  Vandellós I (1989) y Zorita (2006) necesitan su propia pasada de archivo
  —fecha de cese, estado de desmantelamiento, ENRESA— y meterlas a medias sería
  peor que no meterlas.

### Contrato

Sube a **1.6.0**. §10 da su apartado a `nuclear` con **dos campos de fecha**
—`autorizacion_hasta`, de la orden del BOE, y `cierre_acordado`, del calendario—
porque son hechos distintos y en España no coinciden: Vandellós II está
autorizado hasta 2030 y su cierre acordado se cita en 2035. Con un solo campo
habría que elegir cuál es «la» fecha, y quien mire el mapa no sabría cuál ve.
§9 añade su vocabulario de categoría y §6.5 su fila en la tabla de `activo`.

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
