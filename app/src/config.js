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
 * **Desde el 2026-08-08 ese fichero existe** y vive en `ArturoVazquez/atlas-basemap`,
 * servido por GitHub Pages, que hace las dos cosas que un PMTiles necesita:
 * responde `206 Partial Content` con `Accept-Ranges` y manda
 * `Access-Control-Allow-Origin: *`. Comprobado contra el fichero real, no supuesto.
 *
 * **Se corta en z10 por un límite y por una razón.** El límite: GitHub BLOQUEA
 * cualquier fichero de más de 100 MiB, y el extracto pesa 85 MB a z10, 182 a z11
 * y 488 a z12 — solo el primero entra. La razón: el dato del atlas es `paraje` en
 * el mejor caso, y un fondo nítido hasta ver el tejado invita a leer el punto como
 * si estuviera medido al metro. Al pasar de z10 MapLibre estira las teselas y el
 * fondo se vuelve blando, y esa blandura dice la verdad sobre la precisión.
 *
 * `VITE_BASEMAP` sigue permitiendo apuntar a otro sitio sin tocar código: el día
 * que haya alojamiento sin ese tope, se regenera con otro `--maxzoom` y se cambia
 * la variable. El bucket de DEMOSTRACIÓN de Protomaps queda solo como red de
 * seguridad, y el visor lo delata en rojo si alguna vez vuelve a usarse: es de
 * ellos, sirve el planeta entero y no responde de nada.
 */

const DEMO = "https://demo-bucket.protomaps.com/v4.pmtiles";
const PROPIO = "https://arturovazquez.github.io/atlas-basemap/atlas-basemap.pmtiles";

export const BASEMAP = import.meta.env.VITE_BASEMAP || PROPIO;

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
