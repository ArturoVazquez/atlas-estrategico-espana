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
      // Una capa de FONDO va más opaca, y no es capricho: está la más baja de
      // todas, así que no tapa nada del atlas, y a 0,22 —el valor bueno para una
      // zona suelta sobre el mapa base— las ocho tecnologías se volvían el mismo
      // pastel y la leyenda prometía colores que el mapa no daba. Es el mismo
      // fallo que ya se corrigió en los dominios minerales, esta vez por
      // opacidad y no por borde.
      paint: {
        "fill-color": color,
        "fill-opacity": entrada.fondo ? 0.46 : ilustrativa ? 0.14 : 0.22,
      },
    });

    // Lo que dice «esto no está medido» es el TRAZO DISCONTINUO, no la palidez.
    // Con una capa de juguete el relleno al 0.1 y el borde al 0.75 parecían bien;
    // con los dieciséis dominios de verdad, las categorías se volvían el mismo
    // beige y la leyenda prometía cinco colores que el mapa no daba. El borde
    // recupera su opacidad entera: la discontinuidad ya hace ese trabajo, y
    // apagar el color encima no aclaraba nada — solo escondía el dato.
    mapa.addLayer({
      id: borde,
      type: "line",
      source: fuente,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "line-color": color,
        "line-width": ilustrativa ? 1.3 : 1.6,
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
 * Sube TODOS los puntos por encima de TODAS las zonas y trazados.
 *
 * `anadirCapa` ya pone los puntos los últimos dentro de su capa, pero eso no
 * basta en cuanto hay dos capas: el orden entre ellas lo fija el manifiesto, y
 * ahí `minerales-proyectos` va antes que `minerales-dominios`. Resultado: la
 * mancha del dominio se pintaba ENCIMA de las minas y se las quedaba, de modo
 * que pinchar Las Cruces abría la ficha de la Faja Pirítica. Justo del revés.
 *
 * La regla no es «esta capa sobre aquella» —eso sería código que conoce las
 * capas— sino una de geometría: **un punto siempre por encima de una superficie**,
 * porque si no, no se puede pinchar. Se aplica una vez, al final, cuando ya
 * están todas.
 */
export function elevarPuntos(mapa, capas) {
  for (const { ids } of capas)
    for (const { id, geom } of ids)
      if (geom === "Point" && mapa.getLayer(id)) mapa.moveLayer(id);
}

/**
 * Hunde al fondo las capas que el manifiesto marca con `fondo: true` (§3).
 *
 * `elevarPuntos()` resolvió punto-sobre-zona. Esto resuelve el caso que trajo la
 * primera COROPLETA: `generacion-electrica-provincia` cubre España entera, y en
 * el manifiesto va después de los derechos y los dominios mineros — o sea que se
 * pintaba encima de ellos y se los quedaba.
 *
 * La regla vuelve a no ser «esta capa bajo aquella», que sería código que conoce
 * las capas: es el manifiesto quien declara que una capa es fondo, y aquí solo
 * se obedece. Se mueven todas sus capas de MapLibre delante de la primera de la
 * primera capa que NO es fondo, así que su orden relativo se conserva.
 */
export function hundirFondo(mapa, capas) {
  const primera = capas.find((c) => !c.entrada.fondo)?.ids?.[0]?.id;
  if (!primera) return;
  for (const { entrada, ids } of capas) {
    if (!entrada.fondo) continue;
    for (const { id } of ids) if (mapa.getLayer(id)) mapa.moveLayer(id, primera);
  }
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
