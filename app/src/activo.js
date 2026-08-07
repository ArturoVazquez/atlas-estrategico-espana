/**
 * El campo derivado `activo` (CONTRATO-DATOS.md §6.5).
 *
 * «¿Esto está en explotación hoy?» NO se lee de los datos: se calcula. Ningún
 * fichero de `datos/` contiene el campo `activo` —la regla R7 lo prohíbe y el
 * validador lo comprueba— porque un booleano editable a mano junto a un campo
 * de estado son dos fuentes de verdad que acaban contradiciéndose (D3).
 *
 * La demo v4 tenía `ACTIVO_PROY = {doade:false, laparrilla:false, …}` escrito a
 * mano. Es exactamente lo que este módulo existe para no volver a hacer.
 */

/** La tabla normativa de §6.5, transcrita. Nada más, y nada inventado. */
const TABLA = {
  "minerales-proyectos": (p) => p.fase === "produccion",
  nuclear: (p) => p.fase === "produccion",
  "gas-regasificacion": (p) => p.fase === "produccion",
  // La única que no mira `fase`: un dominio no es un expediente, es una comarca,
  // y su carácter ES la clase de cosa que es. Va en `categoria` (contrato 1.10).
  "minerales-dominios": (p) => p.categoria === "activo" || p.categoria === "mixto",
  // Un enlace en servicio SÍ está en explotación — al contrario que un derecho
  // minero, que es un título y no una obra, y por eso no figura en esta tabla.
  "electricidad-interconexiones": (p) => p.categoria === "en_servicio",
  "cables-submarinos": (p) => p.fase === "produccion",
  // El tablero NO APLICA: una reclamación de soberanía es una condición del
  // territorio, no una explotación. Ausente de la tabla a propósito.
  //
  // `parques-eolicos`, `plantas-solares` y `red-electrica` tampoco están, pero
  // por un motivo distinto que conviene no confundir (contrato 1.23). Ahí la
  // pregunta SÍ es de la clase de objeto correcta —a un parque eólico se le
  // puede preguntar perfectamente si está girando—: lo que pasa es que la
  // fuente no lo responde. La BTN cartografía el recinto y no dice si produce.
  // `null` es «no lo sé»; `false` sería afirmar que está parado.
};

/**
 * `true` · `false` · `null`.
 *
 * La diferencia entre `false` y `null` es del contrato y no es un detalle:
 * `false` AFIRMA que algo está parado; `null` dice que la pregunta no se le
 * hace a esa capa. Devolver `false` donde toca `null` convertiría «no aplica»
 * en «no está en explotación», que es una afirmación que nadie ha hecho.
 */
export function activo(idCapa, propiedades) {
  const regla = TABLA[idCapa];
  return regla ? Boolean(regla(propiedades)) : null;
}

/**
 * El filtro de la interfaz **solo esconde `false`** (§6.5). Un `null` siempre
 * pasa: una capa a la que no se le hace la pregunta no puede desaparecer por
 * no responderla.
 */
export function pasaFiltro(filtro, valor) {
  if (filtro === "todo" || valor === null || valor === undefined) return true;
  return filtro === "activo" ? valor === true : valor === false;
}
