# PLAN.md — Atlas Estratégico de España

Fases de construcción. Cada fase tiene criterio de hecho verificable.
Flujo: Claude Code propone plan por fase → Arturo revisa → se construye.

---

## F0 · Esqueleto del repositorio — ✅ HECHA (2026-08-05)

- ~~Estructura según CONTRATO-DATOS.md §2~~ + `referencia/`, `pipeline/pruebas/`
  y `.github/workflows/`, que el §2 no dibujaba y ahora sí.
- ~~`manifest.json` y `vocabularios.json` de arranque.~~ Las **quince** capas van
  `en_preparacion`, porque ninguna tiene datos: la regla del horizonte aplicada
  al propio manifiesto. Los vocabularios llevan **rótulo y definición** por
  valor, no solo el enum — así el panel de F2 no hereda castellano en el código.
- ~~JSON Schema: `nucleo` + `minerales-proyectos`.~~ Sin `$ref` entre ficheros:
  dos pasadas sobre el mismo documento, como pide §7.1. Los enums **no** se
  repiten en el esquema; se validan contra `vocabularios.json`.
- ~~`validar.py` + GitHub Action.~~ Corre en PR **y** en push a `main`, y el CI
  prueba primero el validador y solo después los datos: un validador roto pasa
  cualquier cosa en verde, y una garantía falsa es peor que ninguna.
- ~~Redactar CONTRATO-DATOS v1.1.~~ Hecho, con §13 de historial. Cerró además el
  matiz abierto de D3 y trajo el campo controlado `fase`.
- ~~⚠ Resolver D9.~~ **Público.** Ver DECISIONES.md D9.

**Hecho cuando:** ~~`validar.py` pasa en verde sobre un fichero de ejemplo y
falla correctamente ante cada violación de doctrina (probar las 5 reglas).~~

**Cumplido, y por encima:** `python pipeline/pruebas/correr.py` → **16 pruebas
en verde**. Se probaron las cinco reglas pedidas, las dos que la v1.1 añadió
(R6, R7) y las **siete comprobaciones de §7** que el criterio no exigía —
estaban escritas y sin ejercitar, y un control que nadie ejercita puede llevar
meses roto sin que se note. El runner no comprueba que el validador falle:
comprueba que falle **por la regla violada y por ninguna otra**.

> **Lo único que F0 deja a deber, y está dicho en el contrato:** la regla **R8**
> (un dominio `desarrollo`/`historico` no puede contener una mina en producción)
> es normativa desde la v1.1 pero **no tiene diente** hasta que exista la capa
> `minerales-dominios`, en F3. Es la única regla del contrato sin implementar.

## F1 · Primera colección real: minerales-proyectos

- Migrar los 10 registros de la demo v4 al formato canónico del contrato.
- Pasada de verificación: localizar y **archivar** en `fuentes/` los documentos
  primarios (decisión CE con anexo, no la nota de prensa); resolver o declarar
  los huecos (Montevive, Vicálvaro, Matamulas, promotor de El Moto).
- Primera release: `datos-v2026.MM` + entrada inaugural del changelog.

**Hecho cuando:** la colección valida en CI, cada `confirmado` tiene primaria
archivada, y los huecos existen como huecos, no como rellenos.

## F2 · Visor MapLibre (el salto de potencia)

- MapLibre GL JS; decisión de basemap al empezar la fase (candidatos:
  Protomaps/PMTiles autoalojado, OpenFreeMap; criterio: coste cero, sin API
  key, estética sobria personalizable).
- Portar del prototipo v4: panel de árboles + ramas en gris, filtro de
  explotación (leyendo el campo `activo` derivado de los datos), fichas y
  cuadros con la doctrina visual (relleno/discontinuo/hueco), leyenda.
- Capas desde `datos/` de la release etiquetada. Registro de capas desde el
  manifiesto (añadir capa = cero código de panel).
- El vecindario (norte de África incluido) lo da el basemap de serie.

**Hecho cuando:** la v4 queda obsoleta a ojos de Arturo: mismo contenido,
cartografía de otra liga, y añadir una capa de prueba no toca código de panel.

## F3 · Capas del listón de salida

- **Límites y soberanía** (verificada): pasada de instrumentos con fuente
  primaria archivada (Utrecht, listas ONU, leyes 37-17/38-17, Badajoz 1801,
  Viena art. 105; verificar fecha y naturaleza del acuerdo UE–RU sobre
  Gibraltar); zonas sin delimitar según doctrina D5.
- **Gas y regasificación**: las plantas de GNL con fuente Enagás/CNMC.
- **Nuclear**: los 7 reactores con calendario de cierre; fuentes CSN/MITECO.
- Dominios minerales: primer ascenso de una mancha ilustrativa a cartografía
  de fuente primaria (candidata: Faja Pirítica, IGME).

**Hecho cuando:** las tres capas validan con su esquema propio y ninguna ficha
publicada contiene prensa sosteniendo un confirmado.

## F4 · Despliegue e integración editorial

- Deploy estático + CNAME `atlas.eltercioviejo.com` (DNS en Hostinger).
- Página "Método" pública: doctrina, contrato enlazado, cómo se corrige un dato.
- Hilo fijado en La hacienda presentando el atlas (voz de la casa); `debate_url`
  cableado en las fichas; changelog de la release como primera respuesta.

**Hecho cuando:** el subdominio sirve la release v1, la cadena
ficha → hilo → atlas funciona en ambos sentidos, y el foro tiene su hilo.

## Horizonte (post-v1, por orden acordado)

Red eléctrica e interconexiones → renovable por provincia → agua embalsada →
centros de datos → H2Med → PERTE acotado → intangibles (clase `analisis`,
ámbito mundo). El pipeline de expedientes de cambio (D7) cuando haya señales
reales con las que diseñarlo.
