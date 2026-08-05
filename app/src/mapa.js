/**
 * El mapa: MapLibre sobre un PMTiles autoalojado, y las capas del atlas encima.
 *
 * Cada capa del manifiesto se convierte en una fuente GeoJSON y una o más capas
 * de MapLibre según su `geometria`. Nada de esto sabe QUÉ capas hay: se lo dice
 * el manifiesto, que es la condición para que añadir una capa no toque código.
 */

import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { activo, pasaFiltro } from "./activo.js";
import { ATRIBUCION, ENCUADRE } from "./config.js";
import { estiloMapa } from "./estilo-mapa.js";

/** Colores por categoría, con los tokens del canon visual. */
const COLOR_CATEGORIA = {
  estrategico_ue: "#96361F",
  produccion_singular: "#31614E",
  en_disputa: "#9C7A14",
};
const COLOR_OTRO = "#6E6B60";

export function colorDe(categoria) {
  return COLOR_CATEGORIA[categoria] || COLOR_OTRO;
}

/** La expresión de color, construida desde los valores que traen los datos. */
function expresionColor(categorias) {
  const casos = [];
  for (const c of categorias) casos.push(c, colorDe(c));
  return casos.length ? ["match", ["get", "categoria"], ...casos, COLOR_OTRO] : COLOR_OTRO;
}

export function crearMapa(contenedor) {
  maplibregl.addProtocol("pmtiles", new Protocol().tile);

  const mapa = new maplibregl.Map({
    container: contenedor,
    style: estiloMapa(),
    ...ENCUADRE,
    attributionControl: false,
    // El atlas es un instrumento de lectura, no un paseo: la rotación solo
    // desorienta y la brújula sería un control más que explicar.
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: { around: "center" },
  });

  mapa.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: ATRIBUCION }));
  mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
  mapa.touchZoomRotate.disableRotation();

  return mapa;
}

/**
 * Añade una capa del manifiesto. Devuelve los ids de MapLibre que ha creado,
 * para que el panel pueda encenderlos y apagarlos sin saber cómo están hechos.
 */
export function anadirCapa(mapa, { entrada, coleccion }) {
  const fuente = `atlas:${entrada.id}`;
  mapa.addSource(fuente, { type: "geojson", data: coleccion });

  const categorias = [
    ...new Set(coleccion.features.map((f) => f.properties?.categoria).filter(Boolean)),
  ];
  const ids = [];

  // Por ahora solo puntos: es la única geometría que hay publicada. Cuando
  // lleguen polígonos y líneas (F3) entran aquí, mirando `entrada.geometria`.
  if (entrada.geometria === "puntos" || entrada.geometria === "mixta") {
    const halo = `${entrada.id}:halo`;
    const nucleo = `${entrada.id}:nucleo`;

    mapa.addLayer({
      id: halo,
      type: "circle",
      source: fuente,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 12, 15],
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": 0,
        "circle-stroke-color": "#26251F",
      },
    });

    mapa.addLayer({
      id: nucleo,
      type: "circle",
      source: fuente,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 4.5, 12, 9],
        "circle-color": expresionColor(categorias),
        "circle-stroke-width": 1.2,
        "circle-stroke-color": "#FBFAF5",
      },
    });

    ids.push(halo, nucleo);
  }

  return { fuente, ids };
}

/**
 * Aplica el filtro de explotación reescribiendo el `filter` de MapLibre.
 *
 * El `activo` se calcula aquí, en el consumidor, tal y como manda §6.5 — y por
 * eso el filtro se expresa como una lista de ids permitidos: la derivación es
 * JavaScript, no una expresión de MapLibre que habría que mantener en paralelo
 * a la tabla del contrato.
 */
export function aplicarFiltro(mapa, capas, filtro, encendidas) {
  for (const { entrada, coleccion, ids } of capas) {
    const visible = encendidas.has(entrada.id);
    // Se filtra por `slug` y no por el id del Feature: MapLibre solo promueve
    // ids numéricos, y los del atlas son «capa:slug». El contrato garantiza que
    // el slug es único dentro de la capa (§7.2), que es justo lo que hace falta.
    const permitidos = coleccion.features
      .filter((f) => pasaFiltro(filtro, activo(entrada.id, f.properties || {})))
      .map((f) => f.properties?.slug);

    for (const id of ids) {
      if (!mapa.getLayer(id)) continue;
      mapa.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      mapa.setFilter(id, [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["in", ["get", "slug"], ["literal", permitidos]],
      ]);
    }
  }
}
