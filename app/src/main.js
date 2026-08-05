/**
 * El visor. Une el manifiesto, el mapa y la ficha, y no decide nada por su
 * cuenta: lo que se pinta y cómo se rotula sale de `datos/`.
 */

import { BASEMAP_ES_DEMO } from "./config.js";
import { cargar, indexar, rotulo } from "./datos.js";
import { crearFicha } from "./ficha.js";
import { anadirCapa, aplicarFiltro, colorDe, crearMapa } from "./mapa.js";
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

      for (const id of ids) {
        if (!id.endsWith(":nucleo")) continue;
        // OJO: no se usa `e.features[0]`. MapLibre serializa a TEXTO las
        // propiedades que son arrays u objetos al pasarlas por el pipeline de
        // teselas, así que `materias`, `fuentes` y `claves` llegarían como
        // cadenas JSON y la ficha reventaría al recorrerlas. Se busca el
        // registro original en la colección cargada, que es la que vino de la
        // release y conserva sus tipos.
        mapa.on("click", id, (e) => {
          const slug = e.features[0]?.properties?.slug;
          const original = capa.coleccion.features.find((f) => f.properties.slug === slug);
          if (original) ficha.abrir(original, capa.entrada);
        });
        mapa.on("mouseenter", id, () => (mapa.getCanvas().style.cursor = "pointer"));
        mapa.on("mouseleave", id, () => (mapa.getCanvas().style.cursor = ""));
      }
    }
    refrescar();
    leyenda(capas, vocabularios);
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
  }
}

/** La leyenda sale de los vocabularios de cada capa, no de una lista aparte. */
function leyenda(capas, vocabularios) {
  const caja = document.getElementById("leyenda");
  const vistos = new Set();
  const filas = [];

  for (const { entrada, coleccion } of capas) {
    const indice = indexar(vocabularios.categoria[entrada.id]);
    for (const f of coleccion.features) {
      const c = f.properties?.categoria;
      if (!c || vistos.has(c)) continue;
      vistos.add(c);
      filas.push(
        `<div class="l-item"><span class="l-dot" style="background:${colorDe(c)}"></span>` +
        `${rotulo(indice, c)}</div>`
      );
    }
  }

  if (!filas.length) return;
  caja.innerHTML = `<h2>Categorías</h2>${filas.join("")}`;
}

arrancar();
