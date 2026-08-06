# Atlas Estratégico de España

Capa de inteligencia geoespacial pública sobre los activos estratégicos de
España: **minerales críticos**, **energía**, **conectividad** y **el tablero de
límites y soberanía**.

No es un mapa bonito. Es una herramienta de lectura del territorio donde **cada
dato lleva fuente, fecha y estado de verificación** — y donde lo que no se sabe
aparece como hueco, no como relleno.

> El atlas registra hechos con fuente y marca lo que no sabe. Un anuncio de
> empresa o una noticia se registran con su origen, pero **solo una fuente
> primaria sostiene un dato confirmado** — y la validación automática lo
> comprueba en cada cambio.

**Estado:** **siete capas publicadas**, release `datos-v2026.08.8`, visor
construido. Minerales críticos (proyectos, dominios y derechos), nuclear, gas y
regasificación, y el tablero (límites y soberanía, espacios marítimos). Las
demás ramas están **declaradas y vacías**, que es su forma de decir la verdad.

Falta una sola cosa para publicar: el **mapa base propio**. Mientras tanto el
visor tira de un depósito de demostración ajeno y **lo advierte en su propio
pie**, porque publicar así contradiría el motivo por el que se decidió
autoalojarlo.

---

## Cómo se lee un dato

Cada registro declara su estado de verificación, y también lo hacen sus campos
sensibles por separado. En el mapa, la marca lo dice sin leer la ficha:

| Estado | Qué significa | Marca |
|---|---|---|
| **Confirmado** | Sostenido por al menos una fuente **primaria** archivada | Relleno sólido |
| **Parcialmente verificado** | Hay fuente, pero no primaria, o cubre solo parte del registro | Relleno tenue, borde discontinuo |
| **No verificado** | Registrado con su origen (prensa, anuncio corporativo), sin ascender a hecho | Hueco, borde discontinuo |

Las fuentes se clasifican por tipo: `primaria` (BOE, DOUE, decisiones,
resoluciones, registros, estadística oficial), `prensa`, `corporativa` y `hueco`
—la fuente que falta y se declara como tal—. **Solo `primaria` puede sostener un
confirmado.** Cuando una fuente se cita, se archiva en `fuentes/`: las URLs se
pudren; el archivo no.

Las capas también declaran si son **verificadas** (fichas con doctrina completa)
o **ilustrativas** (dibujan *dónde*, no *cuánto* ni *de quién*, hasta que se
sustituyan por cartografía de fuente primaria).

## Qué hay dentro

```
CONTRATO-DATOS.md   el formato de los datos y la doctrina. Manda sobre el código
DECISIONES.md       el porqué de cada decisión, con lo que se descartó
PLAN.md             fases de construcción y criterios de hecho
CHANGELOG-DATOS.md  una entrada por release: qué cambió, y qué sigue sin saberse
datos/              las capas (GeoJSON RFC 7946, WGS84) y el manifiesto
fuentes/            archivo documental de todo lo citado
pipeline/           validar.py (doctrina como test, en CI) · vigilar.py (semanal)
                    consultar.py (consulta al IGN y al catastro; contrasta)
app/                el visor, y la página «Método» que lo explica
referencia/         la demo v4, canon de interacción
```

Las nueve capas con datos, por si sirve de índice:

| Capa | Clase | Qué registra |
|---|---|---|
| `minerales-proyectos` | verificada | Los proyectos: CRMA, productores singulares y yacimientos en disputa |
| `minerales-derechos` | verificada | Los derechos del Catastro Minero de esos mismos promotores, con perímetro |
| `minerales-dominios` | **ilustrativa** | Los distritos, a mano alzada y declarados como tales |
| `nuclear` | verificada | Un registro por reactor, con lo autorizado y lo acordado por separado |
| `gas-regasificacion` | verificada | Las siete plantas de GNL |
| `electricidad-interconexiones` | verificada | Los enlaces que cruzan frontera, con el extremo de fuera nombrado y sin coordenada |
| `generacion-electrica-provincia` | verificada | Las 52 provincias y su mezcla de generación por tecnología |
| `limites-soberania` | verificada | Ocho territorios, con quién administra y quién reclama |
| `espacios-maritimos` | verificada | Las aguas sin delimitar, la plataforma continental y el monte Tropic |

Los datos son **curación humana con fuente primaria**. El pipeline valida, vigila
y consulta; **nunca genera datos**, y nunca archiva una fuente por su cuenta.

> **Lo que este atlas no puede garantizar, dicho aquí y no en la letra pequeña.**
> La guardia semanal comprueba que las citas sigan vivas, pero **EUR-Lex y el
> IGME devuelven «200 OK» para documentos que ya no existen**, sirviendo una
> página de error. Cuando la URL promete un PDF, el engaño se detecta; cuando no,
> no hay forma barata de distinguirlo, y `vigilar.py` imprime cuántas citas
> quedan sin comprobar de verdad. Es la razón entera de que exista `fuentes/`: la
> copia archivada no depende de que un servidor ajeno siga siendo honesto.
>
> **Una fuente oficial puede contradecirse consigo misma.** Dos derechos del
> Catastro Minero tienen hoy dos situaciones jurídicas distintas según qué
> exportación se descargue, el mismo día y del mismo registro. Cuando pasa, el
> atlas **publica el desacuerdo y baja el campo a `parcial`**: no elige por su
> cuenta cuál de los dos vale.
>
> **Y una descarga oficial puede venir mutilada sin avisar.** La exportación en
> CSV de ese mismo catastro corta la lista de vértices a 424 caracteres: de 106
> derechos, 38 vienen cortados y 29 pierden **una esquina real**. Un polígono al
> que le falta una esquina cierra igual y parece correcto. Toda la geometría sale
> del shapefile por eso, y el CSV se archiva como evidencia de su propio defecto.
>
> ~~Y la única pieza del contrato **sin implementar**: la regla **R8**…~~
> **Cerrada el 2026-08-06** con la capa `minerales-dominios`. **Ninguna regla del
> contrato es prosa**: las nueve las comprueba el CI.

## Cómo se corrige un dato

1. Abre una *issue* señalando el registro (su `id`, p. ej.
   `minerales-proyectos:aguablanca`) y **qué fuente sostiene la corrección**.
   Una corrección sin fuente no se puede aplicar: es la única regla dura.
2. Si tienes la fuente primaria a mano, un *pull request* sobre `datos/` con el
   documento archivado en `fuentes/` va más rápido. La validación te dirá si la
   doctrina se cumple antes de que nadie lo revise.
3. Nada se borra. Un registro que deja de ser válido cambia de
   `estado_registro` (`vigente` → `historico` / `retirado`) y conserva su
   historia en Git.

Señalar un **hueco** —un dato que damos por bueno sin fuente primaria— es tan
útil como aportar un dato nuevo. Probablemente más.

## Licencias

- **Código** (`app/`, `pipeline/`, esquemas): [MIT](LICENSE).
- **Datos** (`datos/`): [CC BY 4.0](datos/LICENCIA-DATOS.md) — reutilización
  libre, incluida la comercial, citando la procedencia.

Ese documento explica también por qué ninguna capa incorpora datasets con
licencia contagiosa, y qué obliga eso a reconstruir desde fuente primaria.

## Cadencia

El visor consume **releases etiquetadas** (`datos-vAAAA.MM`), nunca la rama
viva. Cada release lleva su entrada en `CHANGELOG-DATOS.md`: qué cambió, por qué
y con qué evidencia — **y una sección de huecos que no es opcional**. Una release
que no declara lo que ignora está afirmando que lo sabe todo.

La página **«Método»** del visor cuenta todo esto para quien llega de fuera, y no
lo cuenta de memoria: la tabla de estados de verificación y el inventario de
capas los lee del vocabulario y del manifiesto de la release. Este README, que
llevaba ocho releases diciendo «fase F0, todavía no hay visor», es la prueba de
por qué.

---

El atlas registra; la interpretación vive en otra parte. El debate y el
seguimiento de cada capa se llevan en [El Tercio](https://www.eltercioviejo.com),
foro privado por invitación.
