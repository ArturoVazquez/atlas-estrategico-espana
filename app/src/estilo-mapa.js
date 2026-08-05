/**
 * El estilo del mapa base: papel y tinta.
 *
 * Se escribe a mano en vez de retocar un estilo de terceros porque la estética
 * es doctrina, no adorno (CLAUDE.md): sobria e institucional, y deliberadamente
 * NO la de El Tercio. El atlas habla como instrumento; el foro, como casa.
 *
 * Los colores son los mismos tokens de `referencia/atlas_v4.html`, que es el
 * canon visual. El mapa base tiene que quedarse CALLADO: es el papel sobre el
 * que se leen los datos, y si compite con ellos, estorba.
 *
 * Esquema de capas: Protomaps v4 (`protomaps` como source-layer prefix).
 */

import { ATRIBUCION, BASEMAP } from "./config.js";

// Los tokens de la v4, aquí en JS porque MapLibre no lee variables CSS.
const PAPEL = "#F1EFE9";
const TIERRA = "#FBFAF5";
const MAR = "#DCE2E2";
const LIMITE = "#D3D0C5";
const LIMITE_PAIS = "#B4B0A2";
const COSTA = "#A9A699";
const TINTA_SUAVE = "#6E6B60";
const TINTA_TENUE = "#98948A";
const VIARIO = "#E6E2D8";
const AGUA_INT = "#D8DFE0";
const VERDE = "#EDEEE4";

export function estiloMapa() {
  return {
    version: 8,
    // Los glifos también son nuestros: viven en `public/fuentes-mapa/`. Si los
    // pidiéramos a un tercero, el mapa se quedaría sin rótulos el día que ese
    // servidor se mueva — el mismo argumento que llevó a autoalojar el basemap.
    // Son seis rangos y 570 KB, MEDIDOS navegando el territorio y el vecindario
    // en vez de elegidos a ojo; el porqué de cada uno está en el README de esa
    // carpeta, incluido el tifinagh, que nadie habría supuesto.
    glyphs: "/fuentes-mapa/{fontstack}/{range}.pbf",
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${BASEMAP}`,
        attribution: ATRIBUCION,
      },
    },
    layers: [
      { id: "fondo", type: "background", paint: { "background-color": MAR } },

      { id: "tierra", type: "fill", source: "protomaps", "source-layer": "earth",
        paint: { "fill-color": TIERRA } },

      // Los `kind` son los que trae de verdad el esquema de Protomaps v4,
      // comprobados sobre las teselas y no copiados de un ejemplo: la v4 pasó de
      // `pmap:kind` a `kind`, y un filtro contra el nombre viejo no falla — deja
      // la capa en blanco, que es peor porque parece que el dato no está.
      { id: "verde", type: "fill", source: "protomaps", "source-layer": "landuse",
        filter: ["in", ["get", "kind"],
          ["literal", ["forest", "wood", "park", "nature_reserve", "scrub", "grassland", "meadow"]]],
        paint: { "fill-color": VERDE, "fill-opacity": 0.65 } },

      // `water` trae polígonos (lagos, embalses, mar interior) Y líneas (ríos)
      // en la misma source-layer. Pintarlo todo como relleno dibuja cuñas
      // absurdas atravesando el mapa: un `fill` sobre una línea cierra el
      // polígono por donde puede. Van separados, cada uno con su tipo.
      { id: "agua", type: "fill", source: "protomaps", "source-layer": "water",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": AGUA_INT } },

      { id: "rios", type: "line", source: "protomaps", "source-layer": "water",
        minzoom: 6,
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": AGUA_INT,
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 14, 2],
        } },

      // El viario, apenas insinuado y solo de cerca: el atlas no es un
      // callejero, y a zoom de país las carreteras solo ensucian. Autovías y
      // vías principales; ni pistas ni pistas de aterrizaje.
      { id: "viario", type: "line", source: "protomaps", "source-layer": "roads",
        minzoom: 7,
        filter: ["in", ["get", "kind"], ["literal", ["highway", "major_road"]]],
        paint: {
          "line-color": VIARIO,
          "line-width": ["interpolate", ["linear"], ["zoom"], 7, 0.4, 14, 1.8],
        } },

      // `county` es la provincia y `region` la comunidad autónoma. La provincia
      // solo de cerca: a zoom de país son 50 líneas que no dicen nada.
      { id: "limite-provincia", type: "line", source: "protomaps",
        "source-layer": "boundaries", minzoom: 6.5,
        filter: ["==", ["get", "kind"], "county"],
        paint: { "line-color": LIMITE, "line-width": 0.6 } },

      { id: "limite-region", type: "line", source: "protomaps",
        "source-layer": "boundaries", minzoom: 4.5,
        filter: ["==", ["get", "kind"], "region"],
        paint: { "line-color": LIMITE, "line-width": 0.9 } },

      { id: "limite-pais", type: "line", source: "protomaps",
        "source-layer": "boundaries",
        filter: ["==", ["get", "kind"], "country"],
        paint: { "line-color": LIMITE_PAIS, "line-width": 1.1 } },

      { id: "costa", type: "line", source: "protomaps", "source-layer": "earth",
        paint: { "line-color": COSTA, "line-width": 0.8 } },

      // Topónimos: los justos. Un nombre de pueblo compitiendo con una mina es
      // ruido; a partir de zoom 6 empiezan a hacer falta para orientarse.
      // El atlas habla español, así que los topónimos también: `name:es` cuando
      // existe y el nombre local cuando no. Es lo que hace que el vecindario
      // diga «Marruecos» y no «Maroc» al lado de Ceuta.
      { id: "topos-pais", type: "symbol", source: "protomaps",
        "source-layer": "places", maxzoom: 7,
        filter: ["==", ["get", "kind"], "country"],
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "text-letter-spacing": 0.18,
          "text-transform": "uppercase",
        },
        paint: {
          "text-color": TINTA_TENUE,
          "text-halo-color": PAPEL,
          "text-halo-width": 1.4,
        } },

      { id: "topos-localidad", type: "symbol", source: "protomaps",
        "source-layer": "places", minzoom: 5.5,
        filter: ["==", ["get", "kind"], "locality"],
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 9.5, 12, 12.5],
          // Que el rótulo ceda ante los datos: si estorba a un punto del atlas,
          // desaparece. El mapa base es el papel, no el mensaje.
          "symbol-sort-key": ["coalesce", ["get", "sort_key"], 0],
        },
        paint: {
          "text-color": TINTA_SUAVE,
          "text-halo-color": PAPEL,
          "text-halo-width": 1.6,
        } },
    ],
  };
}
