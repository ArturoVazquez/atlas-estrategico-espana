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

**Estado:** en construcción. Fase F0 (contrato, esquemas y validación). Todavía
no hay visor publicado ni release de datos.

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
datos/              las capas (GeoJSON RFC 7946, WGS84) y el manifiesto
fuentes/            archivo documental de todo lo citado
pipeline/           validar.py (doctrina como test, en CI) · vigilar.py (semanal)
                    consultar.py (consulta al IGN y al catastro; contrasta)
app/                el visor
referencia/         la demo v4, canon de interacción
```

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
> Y la única pieza del contrato **sin implementar**: la regla **R8** no tendrá
> diente hasta que exista la capa `minerales-dominios` (CONTRATO-DATOS.md §6.5).
> Está declarada como tal para que no se descubra por su ausencia.

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
y con qué evidencia.

---

El atlas registra; la interpretación vive en otra parte. El debate y el
seguimiento de cada capa se llevan en [El Tercio](https://www.eltercioviejo.com),
foro privado por invitación.
