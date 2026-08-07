# La procedencia de cada capa

De dónde sale cada dato, **con qué condiciones se puede usar** y qué hay que
saber antes de citarlo. Una ficha por capa publicada, y al final un cuaderno de
obtención para quien tenga que volver a la fuente.

Existe porque el atlas le exige a cada dato una cita con fuente y fecha, y no se
lo exigía a sí mismo: la información estaba entera, pero repartida en cinco
sitios ordenados por criterios distintos —el manifiesto por capa, los `__f` por
registro, el contrato por campo, el changelog **por release** y este directorio
por fecha de captura—. La pregunta más natural que se le puede hacer a un
dato, «¿de dónde sale esto y qué me obliga?», se contestaba cruzando el
changelog entero con el manifiesto.

## Qué NO es este documento

**Lo que se añade aquí es la síntesis, no el hecho.** Cada dato sigue teniendo
una sola fuente de verdad, y no es esta:

| Si buscas | Manda | Y no esto |
|---|---|---|
| La licencia y la atribución de una capa | `datos/manifest.json` (contrato §3) | — |
| Qué campos tiene y por qué | `CONTRATO-DATOS.md` §10 | — |
| La cita exacta de un campo concreto | el `__f` de ese registro (§6.2) | — |
| Cómo se construyó y qué costó | `CHANGELOG-DATOS.md`, por release | — |
| El documento original | el fichero archivado en este directorio | la URL, que se pudre |

Esa disciplina es `DECISIONES.md` D3 aplicada a la documentación: donde este
documento repitiera un dato en vez de enlazarlo, crearía una segunda verdad que
se desincronizaría a la primera corrección.

**Y no dice lo que no sabe.** Donde el emisor no publica sus condiciones, aquí
pone que no las publica — no una suposición verosímil.

## Cómo se lee

Un encabezado de nivel 2 en kebab-case (`## puertos`) **es una ficha de capa**;
los de prosa llevan espacios. No es cosmética: `pipeline/validar.py` comprueba
por esa forma que **ninguna capa publica datos sin su ficha, y ninguna ficha
sobrevive a su capa** (§7.9, bloquea el CI).

---

# Lo que vale para todas las capas

## La licencia de salida

Todo lo que el atlas publica va bajo **CC BY 4.0**, con la atribución sugerida
que fija `datos/LICENCIA-DATOS.md`. Cada capa declara además la suya en el
manifiesto, y **si alguna difiriera, mandaría la del manifiesto**.

Esa elección obliga a algo que se nota en el contenido: **no entra ningún
conjunto con licencia contagiosa** (*ShareAlike* o *NonCommercial*). No es
teoría. Ha dejado fuera tres fuentes que habrían sido la vía obvia:

| Fuente | Licencia | Qué se perdió |
|---|---|---|
| **TeleGeography** | CC BY-NC-SA 3.0 | El trazado de los cables submarinos. La capa se reconstruyó desde actos de Costas |
| **CNMC** | CC BY-SA | La potencia eléctrica instalada por provincia. La capa publica generación |
| **Instituto Cervantes** | aviso legal restrictivo, sin conjunto en `datos.gob.es` | La demolingüística del español. La capa cartografía el **estatuto** |

## Los emisores transversales

Cuatro emisores sostienen la mayor parte del atlas. Sus condiciones van aquí una
vez, y las fichas remiten a esta sección.

### Instituto Geográfico Nacional (IGN) y CNIG

**Presente en 13 de las 22 capas.** Licencia **CC-BY 4.0**, establecida por la
**Orden FOM/2807/2015, de 18 de diciembre** (BOE de 26-12-2015), cuyo artículo 4
dice que el uso «tendrá carácter libre y gratuito, siempre que se mencione el
origen y propiedad de los datos».

**Pero la licencia fija la FORMA del reconocimiento, y no es la habitual.** Su
punto 4, para obra derivada —que es exactamente lo que hace este atlas—:

> «Obra derivada de \<identificador del producto\> \<fecha\> CC-BY 4.0
> \<atribución de productores\>»

Los identificadores exactos, de la tabla de productos del propio SCNE:

| Lo que usa el atlas | Fórmula exigida |
|---|---|
| Base Topográfica Nacional | `Obra derivada de BTN Continua CC-BY 4.0 ign.es` |
| Nomenclátor Geográfico Básico | `Obra derivada de NGBE Continua CC-BY 4.0 ign.es` |
| Límites municipales y provinciales | `Obra derivada de BDLJE Continua CC-BY 4.0 ign.es` |

Y su punto 5 añade una obligación que casi nadie cumple: quien genere **un
conjunto nuevo modificando el original** debe incluir esas expresiones **también
en los metadatos** — en el resumen, en el linaje y en las restricciones de
acceso.

> **Encontrado y corregido el 2026-08-08.** El manifiesto atribuía «Instituto
> Geográfico Nacional · Atlas Estratégico de España», que **no es la fórmula que
> la licencia exige** —y **cuatro capas no nombraban al IGN en absoluto**, que es
> peor—. La licencia se había comprobado antes de extraer, como manda
> `datos/LICENCIA-DATOS.md`, y el veredicto era correcto: CC-BY 4.0, compatible.
> Lo que no se hizo fue leer **cómo** obliga a citar. **Comprobar que una fuente
> es compatible no es lo mismo que leer cómo obliga a citarla.**
>
> Las 13 capas llevan ya su fórmula, y **el visor la muestra**: la atribución
> viaja con la fuente de MapLibre, así que aparece mientras la capa está
> encendida y desaparece al apagarla — que es lo que pide el punto 4, «visible
> junto con los datos, a pie de mapa». Un crédito fijo en el pie afirmaría que el
> atlas usa la BTN incluso con esa capa apagada.

- Archivado: [`2026-08-08_cnig_licencia-uso-productos-ign-fom-2807-2015.pdf`](2026-08-08_cnig_licencia-uso-productos-ign-fom-2807-2015.pdf)
  · [`2026-08-08_scne_tabla-de-productos-atribucion.html`](2026-08-08_scne_tabla-de-productos-atribucion.html)
  · [`2026-08-08_cnig_condiciones-de-uso-centro-de-descargas.html`](2026-08-08_cnig_condiciones-de-uso-centro-de-descargas.html)

### BOE y DOUE — los textos legales

**Un texto legal no tiene dueño.** El artículo 13 del TRLPI excluye de la
propiedad intelectual las disposiciones legales y los actos de los organismos
públicos, así que leyes, órdenes, reglamentos y tratados se archivan enteros y
se citan sin pedir permiso ni declarar licencia.

Eso vale para el **texto**. No vale para las bases de datos, buscadores o
ediciones anotadas que los sirven, que sí tienen sus propias condiciones — por
eso lo que se archiva es siempre el documento, no la página que lo indexa.

El BOE cumple además una función que conviene conocer: **es espejo del DOUE**, y
sirve en HTML con tablas reales lo que EUR-Lex publica en PDF inmaquetable.

### Comisión Europea

Política de reutilización de la **Decisión 2011/833/UE**: **CC BY 4.0**. Cubre la
plataforma de transparencia PCI-PMI, que no es divulgación sino un registro que
existe por obligación del **artículo 23 del Reglamento (UE) 2022/869**.

**La obligación no alcanza a lo que se sirve al lado:** el mismo visor ofrece una
capa `PLATTS`, de S&P Global, que es de tercero y no entra.

- Archivado: [`2026-08-06_ce_aviso-legal-reutilizacion-documentos.html`](2026-08-06_ce_aviso-legal-reutilizacion-documentos.html)
  · [`2026-08-06_ce_pci-transparencia-aviso-y-terminos.js`](2026-08-06_ce_pci-transparencia-aviso-y-terminos.js)

### MITECO y el Catastro Minero

**Régimen general de reutilización de la Ley 37/2007**, con atribución y sin
ShareAlike ni NonCommercial. Cubre el Catastro Minero, el Boletín Hidrológico,
la estadística eléctrica y los anuncios de Costas.

> **Lo que este atlas NO hace con MITECO.** El Inventario de Presas y Embalses
> del SNCZI está tras un **ALTCHA**, un CAPTCHA de prueba de trabajo puesto a
> propósito. **No se salta.** La capa de agua embalsada existe porque se
> encontró otra puerta abierta, no porque se forzara esa.

## El archivo está completo

**Las 8.497 citas con URL de las 22 capas tienen su documento archivado aquí: el
100 %.** Son 114 documentos. No queda un solo aviso pendiente de §7.7 —la
comprobación que avisa cuando una cita no está archivada—, y eso se midió, no se
supuso.

## Lo que se decidió no obtener

Aparece aquí para que su ausencia se lea como una decisión y no se descubra por
el hueco:

- **El Catálogo Nacional de Infraestructuras Estratégicas y Críticas.** No es
  público y **no se persigue**. Cuidado con cómo se dice: se comprobó la Ley
  8/2011 y **no emplea la palabra «secreto»** — habla de datos «clasificados» y
  remite las condiciones a su Reglamento, que no se ha leído.
- **El shapefile del SNCZI**, por el CAPTCHA, dicho arriba.
- **La lista de los 100 mayores perceptores del PRTR** y el mapa Power BI de
  MITECO: la primera no lleva ubicación; el segundo no es un conjunto de datos
  que se pueda citar ni archivar.

---

# Las capas

## minerales-proyectos

**De dónde** · **Comisión Europea** — Decisión (UE) 2025/840, la lista de
proyectos estratégicos del Reglamento de Materias Primas Críticas · **IGME**,
Panorama Minero · **MITECO**, Catastro Minero · **IGN**, Nomenclátor.
**Licencia** · Decisión 2011/833/UE (CE) · Ley 37/2007 (MITECO, IGME) · IGN,
ver arriba.
**Qué hay que saber** · Los 7 proyectos estratégicos de la UE más 3 producciones
singulares y 1 en disputa. **El nombre del proyecto y el que lleva en el
documento no coinciden** en cinco de los siete: «La Parrilla» figura como *P6
Metals*. Por eso existe `nombre_oficial` — sin él, contrastar la ficha contra el
DOUE es imposible.
**Huecos** · 7 citas: inversión, empleo, capacidad, calendario y porcentajes de
demanda europea circulan como anuncio corporativo y **no se elevan a dato**. Uno
es más serio: el municipio de un registro dice «Gerena» y nunca tuvo fuente; dos
primarias apuntan a otros términos.
**Archivado** · 5 ficheros · **El resto** · CHANGELOG `datos-v2026.08` · §10

## minerales-dominios

**De dónde** · **Ninguna cartografía**. Es la única capa del atlas sin una sola
fuente con URL.
**Licencia** · Solo la de salida: la compilación es del atlas.
**Qué hay que saber** · **Las 16 son `registro: ilustrativo` y las 16 declaran
el hueco**: «el trazado es a mano alzada sobre el ámbito descrito, **no un
límite medido**». Sirven para situar una comarca minera en el mapa, **no para
medir sobre ellas**. Es la capa que hace verdad la regla R5.
**Huecos** · 16 de 16, uno por registro. **Archivado** · nada que archivar
**El resto** · CHANGELOG `datos-v2026.08.6` · §10

## minerales-derechos

**De dónde** · **MITECO — Catastro Minero**, descarga por provincia (shapefile
ETRS89 + CSV), 7 provincias.
**Licencia** · Ley 37/2007, con atribución. Manifiesto: «Catastro Minero
(MITECO) · Atlas Estratégico de España».
**Qué hay que saber** · **El catastro define DERECHOS, no minas.** Un proyecto
que tiene un derecho **no hereda su geometría**: por eso `minerales-proyectos`
sigue siendo de puntos y las dos capas se solapan en el mapa a la vista. Único
`geo_precision: exacta` en polígonos junto a las renovables.
**Qué NO se interpreta** · `superficie_declarada` va **verbatim** aunque **no
concuerde con el perímetro que la misma fuente dibuja**.
**Por qué el ZIP y el CSV** · El shapefile da la geometría; el CSV se archiva
porque **escribe con tildes** los campos de vocabulario que el shapefile deja sin
ellas.
**Archivado** · 14 ficheros (7 provincias × 2 formatos)
**El resto** · CHANGELOG `datos-v2026.08.8` · §10

## parques-eolicos

**De dónde** · **IGN — Base Topográfica Nacional**, tema Energía, objeto `0713S`
«Central eléctrica», atributo `TIPO_0713`.
**Licencia** · IGN, ver arriba · atribución exigida: `Obra derivada de BTN Continua CC-BY 4.0 ign.es`
**Qué hay que saber** · Son **recintos, no potencia**. La BTN captura el parque
«por el contorno exterior de su recinto», y de eso **no se deduce cuánta energía
produce**: A Coruña tiene 173 parques y genera menos que Zaragoza con 144.
**Qué NO trae la fuente** · Ni `potencia_mw`, ni número de aerogeneradores, ni
titular, ni fecha de servicio — el esquema los **prohíbe por su nombre** para que
nadie los escriba de memoria. `superficie_ha` también, por derivada.
**Alcance** · 1.382 de 1.389 (**100 % de la superficie**).
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.21` · §10

## plantas-solares

**De dónde** · La misma BTN, el mismo objeto `0713S` (tipos 05 fotovoltaica y 08
termosolar).
**Licencia** · IGN, ver arriba · atribución exigida: `Obra derivada de BTN Continua CC-BY 4.0 ign.es`
**Qué hay que saber** · **1.959 fotovoltaicas quedan fuera porque la BTN no las
nombra**, y son las pequeñas: entran 1.206 de 3.165 recintos, que son el **76 %
de la superficie**. Termosolar, 44 de 45. Las dos cifras van siempre juntas
porque contar plantas y medir superficie dan respuestas distintas.
**Qué NO trae la fuente** · Lo mismo que en eólica, prohibido igual.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.21` · §10

## gas-regasificacion

**De dónde** · **CNMC**, informe de supervisión del sistema gasista 2025 ·
**BOE**, cinco resoluciones y órdenes por planta.
**Licencia** · Textos legales sin dueño (BOE); el informe de la CNMC se **cita**,
no se copia su conjunto de datos.
**Qué hay que saber** · **Enagás es sociedad cotizada**, o sea fuente
`corporativa`, y por R3 **no puede sostener un `confirmado`**. Lo primario aquí
es el BOE y la CNMC.
**Huecos** · Los 7 registros declaran el mismo: **la capacidad de almacenamiento
en m³ y la de emisión en Nm³/h no las publica nadie en documento accesible** — y
son justo las cifras que todo el mundo repite. Los campos existen vacíos para que
el hueco tenga dónde alojarse.
**Archivado** · 6 ficheros · **El resto** · CHANGELOG `datos-v2026.08.4` · §10

## nuclear

**De dónde** · **BOE**, las órdenes TED de renovación de autorización, una por
reactor · **MITECO**, ficha de centrales · **IGN**, Nomenclátor.
**Licencia** · Textos legales sin dueño · Ley 37/2007 · IGN.
**Qué hay que saber** · **Un reactor por registro, aunque compartan
emplazamiento**: Almaraz I y II tienen autorizaciones, fechas y potencias
distintas. Y **dos fechas que no son la misma cosa** — `autorizacion_hasta` la
fija una orden del BOE; `cierre_acordado` es el calendario pactado en 2019.
Vandellós II: autorizado hasta 2030, acordado para 2035.
**Huecos** · 8 citas. El **Protocolo de 2019 entre Enresa y los titulares es un
acuerdo privado sin documento público localizado**, así que `cierre_acordado` va
vacío. Pendientes también la resolución de la prórroga de Almaraz y una
discrepancia de un día entre la ficha del CSN y la orden del BOE, que **no
cambia el dato pero queda dicha**.
**Archivado** · 8 ficheros · **El resto** · CHANGELOG `datos-v2026.08.2` · §10

## electricidad-interconexiones

**De dónde** · **DOUE**, Reglamento Delegado (UE) 2026/764, lista de la Unión ·
**MITECO**, Plan de desarrollo de la red de transporte 2021-2026 · **IGN**,
Nomenclátor para el extremo español.
**Licencia** · CE · Ley 37/2007 · IGN.
**Qué hay que saber** · **Un enlace tiene dos extremos y el atlas solo puede
situar uno.** El de fuera va nombrado y sin coordenada: dibujar una recta entre
los dos sería inventar el trazado.
**Huecos** · Los 5 registros declaran dos. Primero: **el estado es el que dicen
los instrumentos de PLANIFICACIÓN, no un parte de obra**. Segundo, y más grande:
**las interconexiones YA EN SERVICIO con Francia, Portugal, Marruecos y Andorra
no están en esta capa** — quien las inventaría es Red Eléctrica, fuente
corporativa.
**Archivado** · 3 ficheros · **El resto** · CHANGELOG `datos-v2026.08.9` · §10

## red-electrica

**De dónde** · **IGN — BTN**, tema Energía, objetos `0710L` «Línea eléctrica»
(atributo `TENSI_0710`: 03 = 220 kV, 04 = 400 kV) y `0719S` «Transformación
eléctrica».
**Licencia** · IGN, ver arriba · atribución exigida: `Obra derivada de BTN Continua CC-BY 4.0 ign.es`
**Qué hay que saber** · **Es cartografía, no un registro de titularidad.** El
mapa dice dónde está el tendido; **de quién es no dice nada**, y por eso el
esquema prohíbe `titular` y `propietario`. Por lo mismo el título dice «Tendido
de alta tensión» y no «red de transporte», que es una categoría jurídica que
ningún mapa certifica.
**Por qué 2 registros de tendido y no 1.784** · Las 18.505 líneas de la BTN
traen el nombre a nulo; bautizarlas por sus extremos habría fabricado nombres que
nadie ha dado.
**Huecos** · 61 subestaciones sin nombre, declaradas en vez de omitidas.
**Ojo con `longitud_medida_km`** · Va `parcial` a propósito: **la mide el atlas**,
y medir sobre un dato primario no convierte la medida en primaria.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.20` · §10

## generacion-electrica-provincia

**De dónde** · **MITECO**, Estadística de la Industria de la Energía Eléctrica
2024 (provisional a 27-11-2025) · **IGN**, unidades administrativas.
**Licencia** · Ley 37/2007 · IGN.
**Qué hay que saber** · Es **generación, no potencia instalada**, y la diferencia
la impuso una licencia: la potencia por territorio la publica la CNMC bajo **CC
BY-SA**, incompatible. La `categoria` es la **tecnología dominante**, un derivado
que el CI comprueba contra el argmax de las cifras del propio registro.
**Huecos** · Los 52, el mismo: **la potencia instalada por provincia no la
publica ninguna fuente primaria con licencia compatible.**
**Geometría** · `generalizada`: los 186 MB del IGN no se publican tal cual.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.10` · §10

## hidrogeno-produccion

**De dónde** · **DOUE**, Reglamento Delegado (UE) 2026/764 · **CINEA**,
plataforma de transparencia PCI-PMI · **Comisión Europea**, resultados de la
subasta IF24 del Banco Europeo del Hidrógeno.
**Licencia** · CE, Decisión 2011/833/UE.
**Qué hay que saber** · **Siete plantas, no cinco**: dos de los cinco proyectos
nombran y sitúan dos plantas cada uno. Y **un registro obliga a publicar, no a
certificar**: cuando quien declara es una empresa, su texto mezcla el proyecto,
la ambición y el argumento de venta, y **solo el primero llega a un campo
numérico**.
**Huecos** · 1: el valle asturiano declara **1 GW de ambición y 150 MW de
proyecto en el mismo párrafo**, y la cifra que circula por ahí es la primera. La
ambición queda en `claves`, verbatim y con su condicional intacto.
**Archivado** · 4 ficheros · **El resto** · CHANGELOG `datos-v2026.08.13` y
`.14` · §10

## agua-embalsada

**De dónde** · **MITECO**, histórico del **Boletín Hidrológico Semanal**
1988-2026 (Dirección General del Agua) · **IGN**, Nomenclátor.
**Licencia** · Ley 37/2007 · IGN.
**Qué hay que saber** · **La capa registra el agua, no el vaso.** La geometría
del embalse está tras el CAPTCHA del SNCZI; el agua embalsada está en abierto y
sin formulario. **La base no lleva coordenadas**: el punto se cose por nombre
contra el Nomenclátor, normalizando nueve prefijos en cuatro lenguas y el sufijo
vasco `urtegia`, y **cada punto se verifica** preguntando al Ministerio en qué
demarcación cae. Esa vuelta cazó seis emparejamientos falsos.
**Alcance** · 308 de 401 embalses del Boletín — el **86 % de la capacidad
embalsada de España**; los 93 restantes van declarados en el manifiesto.
**Ojo** · El esquema prohíbe `porcentaje_llenado` **por derivado**: sale de
dividir las dos cifras que la capa ya publica.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.18` · §10

## cables-submarinos

**De dónde** · **BOE** y **MITECO**, anuncios y concesiones de Costas ·
**Autoridad Portuaria de Santa Cruz de Tenerife** · **IGN**, Nomenclátor.
**Licencia** · Textos legales sin dueño · Ley 37/2007 · IGN.
**Qué hay que saber** · **Registra aterrizajes, no trazados.** El recorrido de un
cable no tiene fuente compatible —TeleGeography es CC BY-NC-SA— y lo que sí
publica una fuente primaria es **dónde toca tierra**, porque ocupar dominio
público marítimo-terrestre exige un acto administrativo. La categoría `trazado`
está declarada y **sin usar**.
**La acotación** · Entra el cable que **une territorios separados por mar**, no
el que cruza una ría. Y un cable que atraviesa aguas españolas **sin aterrizar
aquí no entra**: el Europe India Gateway toca tierra en Gibraltar — se archiva,
se cita y se queda fuera.
**Huecos** · 1: **el acto autoriza una ocupación, no bautiza un cable.** El
expediente de Santander no nombra el sistema. La Ley 11/2022 obliga a
comunicarlos al Ministerio, pero **el Ministerio no publica la lista**.
**Archivado** · 7 ficheros · **El resto** · CHANGELOG `datos-v2026.08.17` · §10

## centros-datos

**De dónde** · **INAGA (Gobierno de Aragón)**, declaración ambiental estratégica
del Plan de Interés General «Expansión Región AWS en Aragón» (BOA n.º 150) ·
**IGN**, Nomenclátor.
**Licencia** · Ley 37/2007 (BOA) · IGN.
**Qué hay que saber** · **Entra el centro que un acto administrativo nombra, y
nada más.** España **no tiene registro público de centros de datos**: la base
europea se publica agregada por Estado, MITECO no lleva censo y las cifras de
mercado son de la patronal. De ahí que sean 6 y no 60.
**La trampa que enseñó** · **Una nota de prensa de una administración no es
fuente primaria.** Lo primario es el acto, no su anuncio: los «26 proyectos y
2.000 MW» catalanes no traían un solo expediente detrás.
**Huecos** · 6. **La potencia TI en MW no la publica ningún acto administrativo**
— la dan la patronal y los operadores, que son corporativos (R3).
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.11` · §10

## hidrogeno-red

**De dónde** · **DOUE**, Reglamentos (UE) 2026/764 y 2022/869 · **CINEA**,
plataforma PCI-PMI · **BOE**, Acuerdo del Consejo de Ministros de 30-07-2024 que
habilita a Enagás.
**Licencia** · CE, Decisión 2011/833/UE · textos legales sin dueño.
**Qué hay que saber** · **No es el H2Med**: de sus 3.268 km, **2.634 son la red
troncal española**. El perímetro lo fija el Acuerdo del Consejo de Ministros, que
habilita **cinco** proyectos —dos de ellos, las cavernas de sal, que el relato
público del H2Med **no menciona nunca**.
**Lo que la fuente advierte** · Su geometría «no prejuzga y puede no coincidir
con el trazado final». Por eso `geo_precision: proyectada`, que no es un sinónimo
elegante de `ilustrativa`: dice que **el terreno todavía no puede desmentirla**.
**Sobre una geometría proyectada no se mide.**
**Huecos** · 3 estaciones de compresión que la fuente nombra y no dimensiona.
**Archivado** · 5 ficheros, incluida la lista **derogada** de 2024 —se conserva
porque la comparación entre las dos es un dato.
**El resto** · CHANGELOG `datos-v2026.08.12` · §10

## puertos

**De dónde** · **Puertos del Estado** — «Zonas de servicio portuarias de
España», servicio **WFS INSPIRE** (`geoserver.puertos.es`).
**Licencia** · **CC BY 4.0**, y esta vez está verificada en el metadato INSPIRE
del propio organismo, que dice literalmente: «No se aplican condiciones de acceso
y uso. **CC BY 4.0 Puertos del Estado**».
> **Ojo con leerlo en el sitio equivocado.** El `GetCapabilities` del WFS
> devuelve `Fees: NONE` y `AccessConstraints: NONE` con `ProviderName: OSGeo` —
> son los **valores por defecto de GeoServer**, plantilla sin tocar, no una
> declaración de Puertos del Estado. La licencia buena está en el registro CSW.

**Qué hay que saber** · **Un puerto no es un registro.** La ley delimita a cada
uno una zona de servicio **terrestre** y **dos de aguas** —la I abrigada, la II
de espera—, así que **43 puertos dan 164 recintos**, y en el mapa un puerto ocupa
mucho más mar que tierra.
**Qué NO se interpreta** · El servicio rotula cada recinto «DEUP» o
«Desafectación» y **no documenta qué distingue**. No es un matiz: desafectar es
**sacar** suelo del dominio público, y son **48 de 164**. Lo resuelve el propio
publicador, que titula el conjunto «Zonas de servicio portuarias de España». **El
campo va verbatim y el atlas declara que no lo interpreta.**
**Huecos** · 24 astillas descartadas: partes que tras redondear a 5 decimales
quedan bajo el metro cuadrado. Entre todas, **1,89 m² de 2.200 km²**.
**Archivado** · 1 fichero + el metadato de licencia
**El resto** · CHANGELOG `datos-v2026.08.23` · §10

## rte-t

**De dónde** · **Reglamento (UE) 2024/1679**, Anexo II — leído en el **espejo
HTML del BOE** · **IGN**, unidades administrativas.
**Licencia** · Texto legal sin dueño · IGN.
**Qué hay que saber** · **La red básica no es «más importante» que la global.**
Son los dos plazos del Reglamento: **2030** y **2050**. Un calendario con fuerza
legal, no una escala de prestigio.
**Lo que se hizo a mano** · **35 de los 77 nodos llevan una equivalencia
declarada** entre el nombre del Reglamento y el municipio del IGN. **No la ha
hecho un emparejador**: va una a una con su motivo, para poder discutirse.
**Verificación** · Los **77 de 77** puntos vuelven al municipio que declaran,
preguntando al IGN de vuelta.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.23` · §10

## ferrocarril

**De dónde** · **Adif** — Red de Transporte Ferroviario, IDE de Adif
(`ideadif.adif.es`), servicio **WFS INSPIRE**, versión 2026/01.
**Licencia** · Verificada en el metadato INSPIRE de Adif, que exige una fórmula
literal: «Se permite cualquier uso si se menciona la autoría de ADIF del
siguiente modo: **© Administrador de infraestructuras ferroviarias**». Es
atribución sola, sin ShareAlike ni NonCommercial: compatible.
> **Corregido el 2026-08-08:** el manifiesto usaba «Administrador de
> Infraestructuras Ferroviarias (Adif)» y ahora lleva el literal con su símbolo.
> Y ojo con dónde se busca: **el `GetCapabilities` de Adif no trae `Fees` ni
> `AccessConstraints`** — no declara nada. La licencia está en el CSW.

**Qué hay que saber** · 326 líneas y **24.136 km** de titularidad estatal.
**Qué NO trae esta pasada** · Ni ancho de vía, ni electrificación, ni alta
velocidad, ni número de vías. **Existen en el servicio**, en capas que esta
pasada no lee, y el esquema los prohíbe por su nombre: escribirlos de memoria
sería inventar los datos más citables de la capa.
**Huecos** · 29 líneas de 355 sin ningún tramo que las declare. Y **las 2.682
estaciones y bifurcaciones NO entran**: mezclan estaciones de viajeros con nudos
técnicos («BIF. CANAL DEL DUERO») y piden criterio propio. **Su GML sí queda
archivado**, para que levantarlas no exija volver a pedirlo.
**Archivado** · 1 fichero + el metadato de licencia
**El resto** · CHANGELOG `datos-v2026.08.23` · §10

## limites-soberania

**De dónde** · **DOUE**, Decisión (UE) 2026/1732 sobre Gibraltar · **BOE**,
Estatutos de Autonomía de Ceuta y Melilla · **MAEC**, posición oficial de España
· **IGN**, Nomenclátor.
**Licencia** · Textos legales sin dueño · IGN.
**Qué hay que saber** · **El atlas registra que la reclamación existe y quién la
sostiene; no dicta veredicto** (D5). Por eso hay exactamente dos campos
simétricos —quién administra y quién reclama— y Gibraltar y Ceuta se describen
con la misma vara. **Un tratado acredita la posición de una parte, no la razón de
nadie.**
**Huecos** · 10 citas, y son los más elocuentes del atlas: **el Tratado de
Utrecht (1713) no está archivado** de emisor autorizado, siendo el instrumento
que ambas partes citan; **no hay ningún instrumento oficial marroquí archivado**
que formule la reclamación sobre Ceuta o Melilla —se registra como existente, no
como acreditada—; y **el Nomenclátor del IGN no nombra Gibraltar**, comprobado
por etiqueta y por recuadro sobre el Peñón.
**Archivado** · 5 ficheros · **El resto** · CHANGELOG `datos-v2026.08.3` · §10

## espacios-maritimos

**De dónde** · **ONU**, las notas verbales cruzadas de Marruecos y España ante la
Comisión de Límites de la Plataforma Continental · **Reino de Marruecos**,
Boletín Oficial n.º 6870 (leyes 37-17 y 38-17, traducción oficial) · **BOE**, RD
2510/1977 y Ley 44/2010 · **GEBCO**, gazetteer submarino.
**Licencia** · Textos legales y documentos de organismos internacionales.
**Qué hay que saber** · La misma doctrina D5, en el mar. **En aguas disputadas no
se dibuja frontera**: se dibuja la zona sin delimitación acordada, y va
`geo_precision: ilustrativa` a propósito. `ambito: mundo` porque la plataforma
más allá de las 200 millas **cae fuera del recuadro de España por definición**
—los puntos de la presentación española llegan a 24,7° W—.
**Huecos** · 2. **Ningún instrumento dibuja la zona sin delimitar**: trazarla con
precisión sería dictar la delimitación que los dos Estados dejan a un acuerdo. Y
las cifras de telurio y cobalto del monte Tropic vienen de campañas científicas
que este atlas no ha archivado.
**Archivado** · 7 ficheros · **El resto** · CHANGELOG `datos-v2026.08.7` · §10

## perte

**De dónde** · **Ministerio de Industria y Turismo**, listado de solicitudes
estimadas de la **Propuesta de Resolución Definitiva del PERTE VEC — Sección B,
convocatoria 2024** · **IGN**, Nomenclátor de municipios.
**Licencia** · Ley 37/2007 · IGN.
**Qué hay que saber** · **Es una propuesta de resolución, no la resolución.** La
final se notifica por registro electrónico y no es públicamente citable. Por eso
los campos se llaman `subvencion_propuesta` y `prestamo_propuesto` **con la
palabra dentro** —un asterisco no lo lee nadie— y el esquema prohíbe `subvencion`
a secas.
**La trampa que enseñó** · **Hay documentos oficiales que no son una tabla aunque
lo parezcan.** Es un registro por comisiones de verificación donde **una
aparición posterior REVISA a la anterior**: contar filas da 61 y los expedientes
vigentes son **57**. Lo demuestran sus propios totales, que cuadran al céntimo.
**Archivado** · 2 ficheros · **El resto** · CHANGELOG `datos-v2026.08.15` · §10

## idioma

**De dónde** · **22 textos constitucionales y legales** de sus respectivos
Estados, más el Reglamento de la Asamblea General de la ONU y los Tratados de la
UE · **Natural Earth** para el punto de cada capital.
**Licencia** · **Un texto legal no tiene dueño** (art. 13 TRLPI): las
constituciones se archivan enteras y se republican sin permiso. Natural Earth es
**dominio público**.
**Qué hay que saber** · **Es la única capa `registro: analisis` del atlas**: eso
**marca la tesis, no rebaja la prueba** (§6.7). Cartografía el **estatuto** del
idioma, no la demolingüística —que se cayó por la licencia del Instituto
Cervantes—, y **desmiente el mapa de un solo color**: México no declara idioma
oficial (es «lengua nacional», a la par que las indígenas) y Argentina, Chile y
Uruguay no nombran la lengua.
**Ojo con Natural Earth** · Va declarada **`corporativa`**, no primaria, aunque
sea de dominio público: el tipo de fuente dice **quién responde del dato**, no si
se puede copiar.
**Archivado** · 23 ficheros · **El resto** · CHANGELOG `datos-v2026.08.16` · §10

---

# Cuaderno de obtención

Para quien tenga que volver a la fuente. El endpoint, el formato y **la trampa**
— lo que cuesta horas descubrir dos veces.

### El IGN y su servicio OGC API-Features

`https://api-features.ign.es/collections/namedplace/items` (topónimos) y
`.../administrativeunit` (municipios y provincias). Alimenta **9 capas**.

- **Un cero suyo NO prueba ausencia.** Bajo carga devuelve **HTTP 200 con la
  colección vacía**. En un barrido salieron como inexistentes «Albacete» y
  «Santander». Hay que **reintentar ante colección vacía** con espera creciente y
  dejar medio segundo entre peticiones.
- **`limit` tiene un tope silencioso.** Pedir más no da más, y no avisa: si el
  recuento importa, hay que confirmarlo por recuadro (`bbox`).
- **Las consultas exactas por `nameunit` exigen la forma oficial bilingüe
  completa**: «Elx/Elche», no «Elche/Elx». El orden importa.
- **La media de los vértices de un municipio no está dentro del municipio.**
  Castelló de la Plana incluye las **islas Columbretes**, a 50 km mar adentro, y
  el promedio se va al agua. Hay que tomar la parte mayor, comprobar que el punto
  cae dentro y, si no, barrer en horizontal.

### El CNIG y la Base Topográfica Nacional

Descarga en dos pasos: `initDescargaDir?secuencial=<id>` devuelve
`{"muestraLic":"NO"…}` y después un POST a `descargaDir` con `secDescDirLA=<id>`.

- **El GeoPackage es SQLite**: se lee con el `sqlite3` de Python, **sin GDAL**.
  Cabecera con magia `GP`, banderas en el byte 3 y el tamaño de la envolvente en
  `(flags>>1)&7`.
- **La BTN es 3D**: los tipos WKB van en el rango de los 1000 (1002 =
  `LineStringZ`). Quien espere 2 se queda sin geometría.
- **El tema Transportes no se puede bajar entero**: son tres ficheros de ~1 GB y
  **llegan truncados** (declara 1.343.613.228 comprimidos y entrega 1.089.384.737).
  Por eso el ferrocarril salió del WFS de Adif, que además es el emisor correcto.

### Adif — IDEADIF

`https://ideadif.adif.es/services/wfs`, GML INSPIRE.

- **El GML viene en LAT-LON.** El CRS se declara en forma URN
  (`urn:ogc:def:crs:EPSG::4258`) y eso **obliga al orden de ejes de la
  autoridad**. Copiar las coordenadas tal cual pone la red ferroviaria española
  en el golfo de Guinea.
- **El vínculo línea↔tramo está escrito en los dos sentidos y NO son
  equivalentes.** La lista de la línea (`net:link`) reclama **188 tramos por
  duplicado**, a alguno **siete** líneas, y coser por ahí da **47.357 km** donde
  hay 24.136. Hay que coser desde el `inNetwork` de cada tramo. **Lo delató el
  total, no el código.**
- La licencia **no está en el `GetCapabilities`**: está en el CSW de
  `ideadif.adif.es/catalog/srv/spa/csw`.

### Puertos del Estado

`https://geoserver.puertos.es/geoserver/wfs`.

- **Los anillos vienen al revés** de lo que pide RFC 7946: 570 incumplimientos de
  §7.4 hasta orientarlos.
- **El orden de operaciones importa y no es el intuitivo:** simplificar →
  redondear → tirar astillas → **orientar**. Orientar antes de redondear no vale,
  porque **el redondeo a 5 decimales puede voltear el signo del área** de un
  anillo casi degenerado. Se orienta lo que se publica, no lo que se calcula.
- La licencia está en el CSW de `idee.es`, **no** en el `GetCapabilities`.

### La plataforma PCI-PMI de CINEA

- **Exige cabecera `Referer`**; sin ella no responde.
- **Su campo de longitud miente**: sirve `SHAPE.LEN` en metros de **Web
  Mercator**, inflados por la latitud entre un 26 % y un 38 %. BarMar «mide» 518
  km donde mide 382. De ahí nació la regla **R10**, y el esquema prohíbe
  `shape_len` por su nombre.
- Hay que acotar la captura a la capa `ENERGY/PCI`: la vecina `PLATTS` es de S&P
  Global.

### DOUE, EUR-Lex y el BOE

- **El PDF del DOUE no se puede parsear.** La extracción por *layout* avisa de
  «rotated text» y devuelve vacío; el texto plano **aplasta las columnas**, y en
  una tabla de cinco columnas «A Coruña X Global Básica» no dice cuál valor es el
  aeropuerto y cuál el puerto. Ambigüedad fatal.
- **La salida es el espejo del BOE**, que sirve la misma tabla en `<td>` de
  verdad. Vale también cuando EUR-Lex está tras el reto de su WAF.
- **EUR-Lex y el IGME devuelven HTTP 200 para documentos que no existen**,
  sirviendo una página de error. Si la URL termina en `.pdf` el engaño se
  detecta, porque responder `text/html` delata el enlace roto; si no, un
  *soft-404* es indistinguible del documento. Por eso `vigilar.py` **cuenta
  cuántas citas no puede comprobar de verdad**.

### Lo que no se salta

El **ALTCHA del SNCZI** es un CAPTCHA de prueba de trabajo puesto a propósito por
el Ministerio. No se elude. Cuando una puerta está cerrada a conciencia, la
salida es **preguntarse si el dato que se busca está detrás de otra** — que es
como se construyó `agua-embalsada`.
