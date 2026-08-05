# DECISIONES.md — Atlas Estratégico de España

Registro de decisiones con su porqué y las alternativas descartadas.
No se modifica salvo decisión deliberada, anotada con fecha.

---

## D1 · Integración en El Tercio vía subdominio estático (jul 2026)

**Decidido:** el atlas vive en `atlas.eltercioviejo.com` como despliegue
estático separado, con repositorio propio.
**Revierte:** la decisión previa de pieza totalmente independiente con dominio
propio.
**Porqué:** un dominio y una superficie de mantenimiento menos; la comunidad
del foro es el público primero y su canal de debate/propuestas ya existe y
viene filtrado por invitación. El subdominio da la integración **sin tocar el
repo del foro** (cerrado y auditado) y sin acoplar ciclos de release.
**Descartado:** página/ruta dentro del Next del foro (acopla deploys, hereda
estética y dependencias, mezcla doctrinas de cambio).
**Propiedad asumida:** la lectura del foro es solo de miembros → el enlace
"debatir" desde el atlas topa con la puerta; funciona como embudo de la leva.
El atlas debe ser público y autosuficiente (las fichas se bastan solas).

## D2 · Contrato de datos v1 + extensiones v1.1 (jul 2026)

**Decidido:** CONTRATO-DATOS.md es la fuente de verdad. Claves: GeoJSON
RFC 7946 WGS84; manifiesto de capas; propiedades **planas** (interop QGIS/GDAL)
salvo `fuentes` y `claves`; nombres de campo **en español** (coste asumido);
sufijos reservados `__v`/`__f` para verificación por campo; fuentes **tipadas**
(`primaria`/`prensa`/`corporativa`/`hueco`) donde **solo primaria sostiene un
confirmado**; doctrina como validación de CI; releases etiquetadas
`datos-vAAAA.MM`; evolución aditiva; nada se borra (`estado_registro`).
**Extensiones v1.1 acordadas:** campo `arbol` en manifiesto; campo `activo`
**derivado** (ver D3); clase de registro `analisis`; campo `ambito`
(`espana`/`mundo`); entradas `en_preparacion` en el manifiesto.
~~**Pendiente:** redactar la v1.1 del documento incorporándolas formalmente.~~
**HECHO (2026-08-05):** contrato v1.1.0, con su historial en §13. Todas las
extensiones acordadas quedan formalizadas, más tres que no estaban previstas y
salieron al escribirla: las reglas de doctrina **numeradas** (R1–R8, para que un
error de CI nombre la regla y no suelte un fallo de esquema), la separación
explícita entre lo que **avisa** y lo que **bloquea** en §7, y el ejemplo
canónico del §11 convertido en el **fixture real** que corre en CI — un ejemplo
que no valida es una trampa esperando a alguien.

## D3 · Árboles por dominio; actividad como filtro derivado (ago 2026)

**Decidido:** el panel se organiza en árboles por **dominio** (Minerales,
Energía, Conectividad, El tablero, Intangibles reservado), y la explotación
("activo") es un **filtro transversal** sobre un campo **derivado** del estado
de cada registro, materializado por el pipeline con tabla de mapeo en el
contrato y comprobado por CI.
**Descartado:** árboles por "activo/no activo" (el estado es mutable → mudanzas
de árbol y duplicados; el propio boceto ponía cables en ambos) y un booleano
`activo` editable a mano (dos fuentes de verdad → contradicciones).
**Matiz CERRADO (2026-08-05, contrato v1.1 §6.5):** el dominio **no** mira
dentro de sí. Hacer que su `activo` dependa de lo que contiene arreglaría la
pantalla dejando el fichero mal. Si un dominio alberga una explotación viva, su
`caracter` correcto es `mixto` —que existe para eso— y declararlo `desarrollo`
es un error de dato. Así que el matiz se convierte en **regla R8**: un dominio
`desarrollo`/`historico` no puede contener un proyecto en `fase: produccion`, y
el CI lo comprueba. Atrapa la mentira en el origen en vez de disimularla al
pintar.
**Consecuencia no prevista, y buena:** `activo` no podía derivarse de
`estado_proyecto`, que es texto libre en voz del atlas. La v1.1 añade **`fase`**,
campo controlado con su propio `__v`/`__f`, del que sí se deriva. La prosa y la
máquina conviven en campos distintos en lugar de pelearse en uno.
**Deuda declarada:** R8 es la única regla del contrato sin implementar (necesita
la capa `minerales-dominios`, F3). Está escrita como tal en §6.5 y §8 — el
contrato no puede afirmar garantías que el CI no da.

## D4 · Alcance: taxonomía completa, publicación por releases (ago 2026)

**Decidido:** perfeccionismo arquitectónico, no de lanzamiento. Todo lo que
incumba a España tiene casa en la taxonomía (árboles reservados, `ambito:
mundo` disponible, clase `analisis` para investigación/opinión **sellada como
tal** y enlazada al hilo del foro donde se defiende). El mapa **declara su
horizonte**: ramas futuras visibles en gris `en_preparacion`.
**Listón de salida acordado ("por ahora, para avanzar"):** núcleo madurado
(dominios minerales, proyectos, eólico, solar, cables) + gas y regasificación +
nuclear + límites y soberanía; el resto en gris.
**Descartado:** esperar a "todo sin escatimar" para lanzar (con este estándar
de rigor, ese listón es infinito; filosofía ya probada en El Tercio: lanzar
primero, pulir con gente dentro).

## D5 · El tablero (límites y soberanía) — doctrina de disputas (ago 2026)

**Decidido:** el atlas **registra que la reclamación existe y quién la
sostiene; no dicta veredicto**. Un instrumento (tratado, resolución, ley de
delimitación) acredita la posición de una parte, no la razón de nadie. En aguas
disputadas no se dibuja frontera: se dibuja la zona sin delimitación acordada
(`geo_precision: ilustrativa`). Registros: Gibraltar, Ceuta, Melilla, plazas
menores, Perejil, Olivenza, aguas Canarias–Marruecos (cruce con minerales:
monte Tropic).
**Fuera del atlas:** movimientos políticos internos — sin fuente primaria de la
que salga su geometría, y contaminan la citabilidad de todo lo demás; su lugar
es el foro. Una eventual capa de hechos institucionales (referendos celebrados,
sentencias, regímenes vigentes) sería otra capa con otra doctrina, no
prioritaria.

## D6 · Selección, no sesgo (ago 2026)

**Decidido:** la ventaja editorial del atlas es **elegir compilar lo público
pero desapercibido** — titularidad y porcentajes de control (CNMV, registro
mercantil, cuentas anuales), destino de la producción (DataComex), partes de
cada contencioso — siempre con fuente primaria y sin adjetivar. Extensiones de
contrato: `titularidad[]`, `destino_produccion[]`, `cronologia[]`.
**Panel lateral en dos secciones separadas:** **Hechos** (cronología con fuente
primaria) y **Señales** (prensa, marcada como prensa, sin ascender a hecho).
Mezclarlos al mismo nivel destruiría la doctrina; separarlos enseña a leer.

## D7 · El foro como canal de señales y debate (jul 2026)

**Decidido:** hilo fijado por capa en La hacienda (El Tercio) concentra debate,
seguimiento y propuestas; cada ficha del atlas enlaza al hilo; el changelog de
cada release de datos se publica como respuesta en el hilo.
**Aplazado a v1.1+:** el pipeline de "expedientes de cambio" (señal → análisis
→ PR con dossier). Principios ya fijados para cuando llegue: el sistema
**instruye expedientes, nunca escribe datos**; puede **añadir duda
automáticamente (marcar "en revisión"), nunca certeza**; ascender a confirmado
exige firma humana sobre fuente primaria.

## D8 · Aprendizajes de las demos (jul–ago 2026)

- Las demos (v1–v4, SVG autocontenido con d3 + es-atlas) validaron doctrina,
  árboles, filtro y cuadros. **La referencia estable es atlas_v4.html.**
- La v5 (contexto mundial Natural Earth) **rompió en navegador**: se proyectó
  retícula y países completos por el cónico conforme **sin recorte** →
  coordenadas divergentes. Lección: con proyecciones cónicas, recortar SIEMPRE
  al encuadre (clipExtent / pre-recorte de geometría). En producción esto lo
  resuelve MapLibre de serie — otra razón para no seguir empujando el prototipo.
- El techo del prototipo SVG está tocado; la potencia visual (relieve, teselas,
  etiquetado inteligente, LOD) pertenece al visor MapLibre del proyecto real.

## D9 · PENDIENTE — repo público vs privado

Sin decidir. **Bloquea la creación del repositorio remoto** (F0 del plan).
Elementos ya sobre la mesa: "el repo es la cita" (la auditabilidad pública es
parte del valor) vs. la firma personal sobre la capa de contenciosos; posible
camino intermedio: desarrollo privado y apertura al publicar la v1.
