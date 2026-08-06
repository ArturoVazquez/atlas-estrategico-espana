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

/**
 * El color de cada categoría lo dice `vocabularios.json`, no este fichero.
 *
 * Estuvo aquí, cableado, mientras solo había una capa. Con cuatro se vio el
 * fallo de un vistazo: nuclear, gas y el tablero se pintaban todos del MISMO
 * gris, porque el código solo conocía las tres categorías de minerales y lo
 * demás caía en el color por defecto. Cuatro capas, indistinguibles.
 *
 * Es el mismo vicio que ya se quitó del panel y de la ficha: código que conoce
 * las capas de antemano. El vocabulario dice de sí mismo que el visor «no
 * reordena, no traduce y no elige colores».
 */
const COLOR_SIN_DECLARAR = "#6E6B60";

let VOCABULARIO_CATEGORIA = {};

/** Lo llama el arranque, una vez, con `vocabularios.categoria`. */
export function fijarColores(categoriasPorCapa) {
  VOCABULARIO_CATEGORIA = categoriasPorCapa || {};
}

export function colorDe(idCapa, categoria) {
  const lista = VOCABULARIO_CATEGORIA[idCapa] || [];
  return lista.find((v) => v.valor === categoria)?.color || COLOR_SIN_DECLARAR;
}

/** La expresión de color, construida desde los valores que traen los datos. */
function expresionColor(idCapa, categorias) {
  const casos = [];
  for (const c of categorias) casos.push(c, colorDe(idCapa, c));
  return casos.length
    ? ["match", ["get", "categoria"], ...casos, COLOR_SIN_DECLARAR]
    : COLOR_SIN_DECLARAR;
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
  // Cada capa de MapLibre recuerda a qué tipo de geometría atiende: el filtro de
  // explotación lo reescribe después y necesita conservarlo. Guardarlo aquí
  // evita que `aplicarFiltro` tenga que adivinarlo por el nombre del id.
  const ids = [];
  const anotar = (id, geom) => ids.push({ id, geom });

  const color = expresionColor(entrada.id, categorias);
  // Una capa ILUSTRATIVA no puede parecer medida (R5, y la doctrina de §6.6
  // aplicada al dibujo): va translúcida y con el borde discontinuo. Una
  // verificada va maciza. La diferencia tiene que verse sin leer la leyenda,
  // porque en un mapa gana lo que se ve.
  const ilustrativa = entrada.registro === "ilustrativo";

  if (entrada.geometria === "poligonos" || entrada.geometria === "mixta") {
    const relleno = `${entrada.id}:relleno`;
    const borde = `${entrada.id}:borde`;

    mapa.addLayer({
      id: relleno,
      type: "fill",
      source: fuente,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: { "fill-color": color, "fill-opacity": ilustrativa ? 0.1 : 0.22 },
    });

    mapa.addLayer({
      id: borde,
      type: "line",
      source: fuente,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "line-color": color,
        "line-width": ilustrativa ? 1.1 : 1.6,
        "line-opacity": ilustrativa ? 0.75 : 1,
        ...(ilustrativa ? { "line-dasharray": [3, 2] } : {}),
      },
    });

    anotar(relleno, "Polygon");
    anotar(borde, "Polygon");
  }

  if (entrada.geometria === "lineas" || entrada.geometria === "mixta") {
    const trazado = `${entrada.id}:trazado`;
    mapa.addLayer({
      id: trazado,
      type: "line",
      source: fuente,
      filter: ["==", ["geometry-type"], "LineString"],
      paint: {
        "line-color": color,
        "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.2, 12, 3],
        "line-opacity": ilustrativa ? 0.8 : 1,
        ...(ilustrativa ? { "line-dasharray": [4, 2] } : {}),
      },
    });
    anotar(trazado, "LineString");
  }

  // Los puntos van los ÚLTIMOS a propósito: se pintan encima de zonas y
  // trazados, que es donde tienen que estar para poder pincharse.
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
        "circle-color": color,
        "circle-stroke-width": 1.2,
        "circle-stroke-color": "#FBFAF5",
      },
    });

    anotar(halo, "Point");
    anotar(nucleo, "Point");
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

    for (const { id, geom } of ids) {
      if (!mapa.getLayer(id)) continue;
      mapa.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      mapa.setFilter(id, [
        "all",
        ["==", ["geometry-type"], geom],
        ["in", ["get", "slug"], ["literal", permitidos]],
      ]);
    }
  }
}
