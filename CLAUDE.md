# CLAUDE.md — Atlas Estratégico de España

Guía de trabajo para Claude Code. Léela entera antes de tocar nada.

## Qué es esto

Capa de inteligencia geoespacial pública sobre los activos estratégicos de
España: minerales críticos, energía, conectividad y el tablero de límites y
soberanía. No es un mapa bonito: es una herramienta de lectura del territorio
donde **cada dato lleva fuente, fecha y estado de verificación**.

Vive como **subdominio de El Tercio** (atlas.eltercioviejo.com), pero es un
proyecto separado: **jamás se toca el repositorio del foro desde aquí**. La
integración con el foro es editorial (enlaces a hilos), no de código.

## Fuentes de verdad, por orden

1. **CONTRATO-DATOS.md** — manda sobre el código. El código se adapta al
   contrato, nunca al revés. Sus reglas de doctrina (§6.4) son ley.
2. **DECISIONES.md** — el porqué de cada decisión y sus alternativas
   descartadas. NO se modifica salvo decisión deliberada de Arturo, anotada.
3. **referencia/atlas_v4.html** — demo estable. Es canon de **interacción y
   doctrina visual** (árboles, filtro, cuadros, fichas, estados de
   verificación), NO de implementación: el visor real se hace con MapLibre.
4. **PLAN.md** — fases y criterios de hecho.

## Stack objetivo

- **Frontend:** estático. MapLibre GL JS + datos GeoJSON. Sin backend, sin BD,
  sin cuentas. Vite o similar, lo más simple que funcione.
- **Datos:** GeoJSON RFC 7946 (WGS84) versionados en `datos/`, según contrato.
- **Pipeline:** Python en `pipeline/` — `validar.py` (esquema + doctrina, corre
  en CI). `vigilar.py` (avisa, JAMÁS escribe datos) está **diseñado y sin
  construir**: no lo des por hecho, va en F3.
- **Despliegue:** estático (Vercel o Cloudflare Pages) → CNAME
  `atlas.eltercioviejo.com` en Hostinger.
- **El visor lee releases etiquetadas** (`datos-vAAAA.MM`, con sufijo `.N` si hay
  más de una en el mes), nunca la rama viva.

## Reglas de taller (no negociables)

- **Lo simple gana.** Cambios mínimos. Un cambio lógico por commit.
- **Modo plan antes de cambios estructurales**: proponer plan → Arturo revisa →
  construir. Nada estructural sin ese paso.
- **El pipeline valida y vigila, nunca genera datos.** Los datos son curación
  humana con fuente primaria.
- **Nada de datos inventados.** Si falta un dato, se deja el hueco explícito
  (fuente `tipo: hueco`). Rellenar un hueco con verosimilitud es el peor bug
  posible de este proyecto.
- **Los registros no se borran**: cambian de `estado_registro`.
- **Estética sobria e institucional** (papel/tinta, ver la demo): NO la
  estética de El Tercio. El atlas habla como instrumento; el foro, como casa.
- Coordenadas con máximo 5 decimales. Diffs limpios.

## Doctrina en una frase

El atlas registra hechos con fuente y marca lo que no sabe; la interpretación
vive en El Tercio. Un anuncio de empresa o una noticia se registra con su
origen, pero **solo una fuente primaria sostiene un `confirmado`** — y el CI lo
comprueba.

## Contexto útil

- Autor y único mantenedor: Arturo (perfil: GIS profesional, Next.js/Supabase
  en El Tercio, QGIS/GDAL).
- La demo v4 contiene datos reales de arranque (7 proyectos CRMA verificados +
  3 singulares + 6 registros del tablero) que se migran al formato canónico en
  la fase F1 del plan. Los trazados de zonas son ilustrativos a mano alzada:
  así deben declararse hasta sustituirse por cartografía de fuente primaria.
- ~~Decisión PENDIENTE que bloquea el push remoto: repo público vs privado.~~
  **Resuelta el 2026-08-05: público desde el primer commit** (DECISIONES.md D9).
- **Estado: F0 cerrada** (2026-08-05). El contrato va por la **v1.1.0** y su
  §13 lleva el historial. `python pipeline/pruebas/correr.py` debe seguir dando
  16/16 después de cualquier cambio en `pipeline/` o en `datos/`: si baja, el
  atlas ha perdido lo único que lo separa de la verosimilitud.
- **Una sola regla del contrato no tiene diente todavía:** R8 (§6.5), que
  necesita la capa `minerales-dominios` para poder comprobarse. Está declarada
  como tal en el propio contrato — no es un olvido, y no debe descubrirse por su
  ausencia.
- Lo siguiente es **F1**: migrar los diez registros de la demo al formato
  canónico. Es trabajo de VERIFICACIÓN con fuentes primarias archivadas, no de
  código: localizar la decisión de la Comisión con su anexo (no la nota de
  prensa) y resolver o declarar los cuatro huecos.
