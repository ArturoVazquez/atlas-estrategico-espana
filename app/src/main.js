/**
 * El visor. Une el manifiesto, el mapa y la ficha, y no decide nada por su
 * cuenta: lo que se pinta y cómo se rotula sale de `datos/`.
 */

import { BASEMAP_ES_DEMO } from "./config.js";
import { cargar, indexar, rotulo } from "./datos.js";
import { crearFicha } from "./ficha.js";
import { anadirCapa, aplicarFiltro, colorDe, crearMapa, elevarPuntos, fijarColores, hundirFondo } from "./mapa.js";
import { construirPanel } from "./panel.js";

const estado = { filtro: "todo", encendidas: new Set(), capas: [] };

// Las subcapas que abren ficha, una por clase de geometría. `:halo` y `:borde`
// quedan fuera a propósito: son adorno del mismo registro.
//
// `:trazado` faltaba, y no era teórico: «Límite exterior de la plataforma
// continental al oeste de Canarias» llevaba publicado desde su release con la
// ficha inalcanzable, porque era la única línea del atlas y nadie fue a
// pincharla. Una lista con nombre lo hace difícil de olvidar otra vez.
const PINCHABLES = [":nucleo", ":relleno", ":trazado"];

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

      // Se pincha el núcleo de los puntos, el relleno de las zonas y el trazado
      // de las líneas. El halo y el borde no: son adorno del mismo registro y
      // duplicarían el manejador.
      for (const { id } of ids) {
        if (!PINCHABLES.some((sufijo) => id.endsWith(sufijo))) continue;
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
          // Una capa de FONDO cubre el país entero y cede ante cualquier otra
          // que tenga encima: sin esto, pinchar un derecho minero abriría la
          // ficha de su provincia, porque los dos manejadores se disparan y gana
          // el que se registró después. Hundirla arregla el dibujo, no el clic.
          if (capa.entrada.fondo && registrosBajo(mapa, e.point, { excluir: capa.entrada.id }).length) return;
          // Zonas y trazados ceden ante un punto que tengan encima, por lo mismo:
          // el punto es lo pequeño, y quien lo pincha lo está apuntando.
          if (!id.endsWith(":nucleo") && registrosBajo(mapa, e.point, { soloPuntos: true }).length) return;
          const buscar = (s) => capa.coleccion.features.find((f) => f.properties.slug === s);
          const slug = e.features[0]?.properties?.slug;
          const original = buscar(slug);
          if (!original) return;
          // Registros que comparten EXACTAMENTE la coordenada: dos reactores de
          // una misma central. Sin esto, el de abajo no se podría abrir nunca.
          // Solo tiene sentido entre PUNTOS: en una línea, `coordinates[0]` es
          // otro array y la comparación nunca sería cierta — parecería que
          // funciona sin hacer nada.
          const vecinos =
            original.geometry?.type !== "Point"
              ? []
              : capa.coleccion.features.filter(
                  (f) =>
                    f.properties.slug !== slug &&
                    f.geometry?.type === "Point" &&
                    f.geometry.coordinates[0] === original.geometry.coordinates[0] &&
                    f.geometry.coordinates[1] === original.geometry.coordinates[1]
                );
          ficha.abrir(original, capa.entrada, vecinos);
        });
        mapa.on("mouseenter", id, () => (mapa.getCanvas().style.cursor = "pointer"));
        mapa.on("mouseleave", id, () => (mapa.getCanvas().style.cursor = ""));
      }
    }
    // Con todas puestas: primero al fondo lo que el manifiesto marca como
    // fondo, y después los puntos arriba del todo. En ese orden, porque lo
    // segundo tiene que ganar a lo primero.
    hundirFondo(mapa, estado.capas);
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

/**
 * Los registros PINCHABLES que hay ahora mismo bajo el cursor.
 *
 * Sirve a las dos cesiones del clic, que son la misma idea aplicada dos veces:
 * lo pequeño gana a lo grande, porque es lo que el usuario creía estar
 * pinchando. `soloPuntos` mira nada más los núcleos —para que una zona ceda ante
 * un punto—; `excluir` deja fuera una capa entera —para que la de fondo ceda
 * ante cualquier otra—. Solo devuelve lo que está pintado: `queryRenderedFeatures`
 * ya respeta la visibilidad, así que una capa apagada no roba nada.
 */
function registrosBajo(mapa, punto, { soloPuntos = false, excluir = null } = {}) {
  const capas = estado.capas
    .filter((c) => c.entrada.id !== excluir)
    .flatMap((c) => c.ids)
    .filter(({ id, geom }) =>
      mapa.getLayer(id) &&
      (soloPuntos
        ? geom === "Point" && id.endsWith(":nucleo")
        : PINCHABLES.some((sufijo) => id.endsWith(sufijo))))
    .map(({ id }) => id);
  return capas.length ? mapa.queryRenderedFeatures(punto, { layers: capas }) : [];
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
