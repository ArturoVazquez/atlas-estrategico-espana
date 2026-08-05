/**
 * Dónde vive el mapa base, y por qué está autoalojado.
 *
 * El atlas archiva cada documento que cita porque «las URLs se pudren»
 * (fuentes/README.md). Colgar el mapa base de un servicio gratuito ajeno sería
 * el mismo riesgo que el proyecto rechaza en todo lo demás: el día que ese
 * servicio cierre, el atlas se queda en blanco y no hay copia de nada.
 *
 * Por eso el basemap es UN FICHERO nuestro —un extracto PMTiles de Protomaps,
 * OpenStreetMap bajo ODbL— en almacenamiento propio. El navegador lo lee con
 * range requests: no hay servidor de teselas que mantener.
 *
 * `VITE_BASEMAP` permite apuntar a otro sitio sin tocar código. Mientras el
 * bucket definitivo no exista, cae al bucket de DEMOSTRACIÓN de Protomaps, que
 * sirve el planeta entero (137 GB) y NO es para producción: es de ellos, no
 * responde de nada y puede desaparecer sin avisar. Está aquí para poder
 * desarrollar y verificar, no para publicar.
 */

const DEMO = "https://demo-bucket.protomaps.com/v4.pmtiles";

export const BASEMAP = import.meta.env.VITE_BASEMAP || DEMO;

export const BASEMAP_ES_DEMO = BASEMAP === DEMO;

/** Atribución obligatoria de OpenStreetMap. No es opcional ni decorativa. */
export const ATRIBUCION =
  '<a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · ' +
  '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a>';

/**
 * El encuadre de arranque: la Península con Baleares. Canarias y el Magreb
 * están en el extracto y se alcanzan navegando — el tablero (F3) los necesita.
 */
export const ENCUADRE = {
  center: [-3.7, 40.2],
  zoom: 5.1,
  maxZoom: 14,
  minZoom: 3,
};
