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

*Todavía no hay ninguna release. La primera (`minerales-proyectos`) llega en la
fase F1 del plan, cuando los diez registros de la demo de referencia estén
migrados al formato canónico y sus fuentes primarias archivadas en `fuentes/`.*
