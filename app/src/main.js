/**
 * El visor. Une el manifiesto, el mapa y la ficha, y no decide nada por su
 * cuenta: lo que se pinta y cómo se rotula sale de `datos/`.
 */

import { BASEMAP_ES_DEMO } from "./config.js";
import { cargar, indexar, rotulo } from "./datos.js";
import { crearFicha } from "./ficha.js";
import { anadirCapa, aplicarFiltro, colorDe, crearMapa, elevarPuntos, fijarColores } from "./mapa.js";
import { construirPanel } from "./panel.js";

const estado = { filtro: "todo", encendidas: new Set(), capas: [] };

function fallo(mensaje) {
  document.getElementById("sello-capas").textContent = "no se pudieron cargar los datos";
  document.getElementById("pie-aviso").textContent = mensaje;
  console.error(mensaje);
}

async function arrancar() {
  let datos;
  try {
    datos = await cargar();
  } catch (e) {
    // Un visor que se queda en blanco sin explicar por qué es peor que uno que
    // no arranca: aquí casi siempre significa que falta `npm run datos`.
    return fallo(
      `No se pudo leer la release en public/datos/ (${e.message}). ` +
      `¿Se ha ejecutado «npm run datos»?`
    );
  }

  const { manifiesto, vocabularios, capas } = datos;
  // Los colores del mapa salen del vocabulario, no del código.
  fijarColores(vocabularios.categoria);
  const ficha = crearFicha(vocabularios);

  // ── la cabecera dice qué release se está mirando ──────────────────────
  document.getElementById("sello-release").textContent = manifiesto.release;
  const enGris = manifiesto.capas.filter((c) => c.en_preparacion).length;
  document.getElementById("sello-capas").textContent =
    `${capas.length} capa${capas.length === 1 ? "" : "s"} con datos · ${enGris} en preparación`;
  document.getElementById("capa-titulo").textContent =
    capas.length === 1 ? `— ${capas[0].entrada.titulo.toLowerCase()}` : "";

  if (BASEMAP_ES_DEMO) {
    // Se dice en el pie, no en un comentario: publicar contra el bucket de
    // demostración de Protomaps sería colgar el atlas de un servicio que no
    // responde de nada, y eso tiene que verse.
    document.getElementById("pie-basemap").innerHTML =
      '<span class="demo">mapa base: bucket de DEMOSTRACIÓN, no apto para publicar</span>';
  }

  // ── el mapa ───────────────────────────────────────────────────────────
  const mapa = crearMapa("mapa");
  // Solo en desarrollo: permite inspeccionar y conducir el mapa desde la consola
  // o desde un navegador automatizado. En el build de producción no existe.
  if (import.meta.env.DEV) window.__mapa = mapa;

  mapa.on("load", () => {
    for (const capa of capas) {
      const { ids } = anadirCapa(mapa, capa);
      estado.capas.push({ ...capa, ids });
      estado.encendidas.add(capa.entrada.id);

      // Se pincha el núcleo de los puntos y el relleno de las zonas. El halo y
      // el borde no: son adorno del mismo registro y duplicarían el manejador.
      for (const { id } of ids) {
        if (!id.endsWith(":nucleo") && !id.endsWith(":relleno")) continue;
        // OJO: no se usa `e.features[0]`. MapLibre serializa a TEXTO las
        // propiedades que son arrays u objetos al pasarlas por el pipeline de
        // teselas, así que `materias`, `fuentes` y `claves` llegarían como
        // cadenas JSON y la ficha reventaría al recorrerlas. Se busca el
        // registro original en la colección cargada, que es la que vino de la
        // release y conserva sus tipos.
        mapa.on("click", id, (e) => {
          // Subir los puntos arriba arregla el DIBUJO, no el clic: MapLibre
          // avisa a todas las capas que hay bajo el cursor, y la que se
          // registró después se queda con la ficha. Así que una zona cede
          // cuando debajo del cursor hay un punto — que es lo que el usuario
          // creía estar pinchando.
          if (id.endsWith(":relleno") && puntosBajo(mapa, e.point).length) return;
          const buscar = (s) => capa.coleccion.features.find((f) => f.properties.slug === s);
          const slug = e.features[0]?.properties?.slug;
          const original = buscar(slug);
          if (!original) return;
          // Registros que comparten EXACTAMENTE la coordenada: dos reactores de
          // una misma central. Sin esto, el de abajo no se podría abrir nunca.
          const [lon, lat] = original.geometry.coordinates;
          const vecinos = capa.coleccion.features.filter(
            (f) =>
              f.properties.slug !== slug &&
              f.geometry?.coordinates?.[0] === lon &&
              f.geometry?.coordinates?.[1] === lat
          );
          ficha.abrir(original, capa.entrada, vecinos);
        });
        mapa.on("mouseenter", id, () => (mapa.getCanvas().style.cursor = "pointer"));
        mapa.on("mouseleave", id, () => (mapa.getCanvas().style.cursor = ""));
      }
    }
    // Con todas puestas: los puntos por encima de las zonas, siempre.
    elevarPuntos(mapa, estado.capas);
    refrescar();
  });

  // ── el panel, construido desde el manifiesto ──────────────────────────
  construirPanel(document.getElementById("capas"), manifiesto, vocabularios, {
    alFiltrar(f) {
      estado.filtro = f;
      refrescar();
    },
    alConmutar(id, encendida) {
      encendida ? estado.encendidas.add(id) : estado.encendidas.delete(id);
      refrescar();
    },
  });

  function refrescar() {
    if (!mapa.isStyleLoaded() && !estado.capas.length) return;
    aplicarFiltro(mapa, estado.capas, estado.filtro, estado.encendidas);
    // La leyenda se rehace con el estado: apagar una capa retira su bloque.
    leyenda(estado.capas, vocabularios, estado.encendidas);
  }
}

/** Los registros de punto que hay ahora mismo bajo el cursor, de cualquier capa. */
function puntosBajo(mapa, punto) {
  const nucleos = estado.capas
    .flatMap((c) => c.ids)
    .filter(({ id, geom }) => geom === "Point" && id.endsWith(":nucleo") && mapa.getLayer(id))
    .map(({ id }) => id);
  return nucleos.length ? mapa.queryRenderedFeatures(punto, { layers: nucleos }) : [];
}

/**
 * La leyenda, AGRUPADA POR CAPA.
 *
 * Con una capa daba igual; con cuatro era una lista plana de nueve entradas sin
 * dueño, donde «En operación» y «Reclamado a España» aparecían al mismo nivel
 * como si fueran del mismo asunto. Cada capa tiene su vocabulario de categorías
 * y la leyenda ahora lo respeta: un bloque por capa encendida, y solo con las
 * categorías que ese fichero trae de verdad.
 */
function leyenda(capas, vocabularios, encendidas) {
  const caja = document.getElementById("leyenda");
  const bloques = [];

  for (const { entrada, coleccion } of capas) {
    if (!encendidas.has(entrada.id)) continue;
    const indice = indexar(vocabularios.categoria[entrada.id]);
    const vistos = new Set();
    const filas = [];
    for (const f of coleccion.features) {
      const c = f.properties?.categoria;
      if (!c || vistos.has(c)) continue;
      vistos.add(c);
      filas.push(
        `<div class="l-item"><span class="l-dot" style="background:${colorDe(entrada.id, c)}"></span>` +
        `${rotulo(indice, c)}</div>`
      );
    }
    if (filas.length) {
      bloques.push(`<div class="l-capa"><h3>${entrada.titulo}</h3>${filas.join("")}</div>`);
    }
  }

  caja.innerHTML = bloques.length ? `<h2>Leyenda</h2>${bloques.join("")}` : "";
}

arrancar();
