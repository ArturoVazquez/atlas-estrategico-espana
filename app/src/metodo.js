/**
 * La página «Método» — la parte que NO se escribe a mano.
 *
 * Los estados de verificación, los tipos de fuente y el inventario de capas se
 * pintan desde la release, no desde prosa copiada. El motivo está a la vista en
 * el propio repositorio: el README se quedó ocho releases diciendo «fase F0,
 * todavía no hay visor publicado ni release de datos». Un texto que describe un
 * dato y vive aparte del dato **envejece sin que nadie lo note**.
 *
 * Así que aquí solo va a mano lo que no es dato: qué es el atlas, cómo se
 * corrige un registro y qué no puede garantizar.
 */

import { BASEMAP_ES_DEMO } from "./config.js";
import { cargarCatalogo, indexar, rotulo } from "./datos.js";

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/** Una tabla de definiciones desde una lista del vocabulario. */
function tabla(lista, extra = () => "") {
  return (lista || [])
    .map(
      (v) =>
        `<div class="fila">` +
        `<div class="k">${escapar(v.etiqueta)}${extra(v)}</div>` +
        `<div class="d">${escapar(v.def || "")}</div>` +
        `</div>`
    )
    .join("");
}

function fallo(mensaje) {
  // Un hueco en la página que explica los huecos se dice, no se disimula: si
  // esto se quedara en blanco, el lector creería que el atlas no tiene capas.
  for (const id of ["estados", "fuentes", "capas"]) {
    const n = document.getElementById(id);
    if (n) n.innerHTML = `<p class="fallo">${escapar(mensaje)}</p>`;
  }
  document.getElementById("release").textContent = "no disponible";
}

async function pintar() {
  let catalogo;
  try {
    catalogo = await cargarCatalogo();
  } catch (e) {
    return fallo(
      `No se ha podido leer la release publicada (${e.message}). ` +
      `Esta parte de la página se lee del propio manifiesto, así que sin él no ` +
      `se puede afirmar qué hay publicado.`
    );
  }
  const { manifiesto, vocabularios } = catalogo;

  // ── del vocabulario ────────────────────────────────────────────────────
  document.getElementById("estados").innerHTML = tabla(vocabularios.registro.verif);
  document.getElementById("fuentes").innerHTML = tabla(
    vocabularios.fuente.tipo,
    (v) => (v.sostiene_confirmado ? ` <span class="sostiene">sostiene un confirmado</span>` : "")
  );

  // ── del manifiesto ─────────────────────────────────────────────────────
  document.getElementById("release").textContent = manifiesto.release;

  const arboles = indexar(vocabularios.manifiesto.arbol);
  const registros = indexar(vocabularios.manifiesto.registro);

  // El orden de los árboles lo manda el vocabulario, como en el panel del mapa.
  const bloques = vocabularios.manifiesto.arbol
    .map(({ valor }) => {
      const capas = manifiesto.capas.filter((c) => c.arbol === valor);
      if (!capas.length) return "";
      const filas = capas
        .map((c) => {
          // Solo la CLASE DE REGISTRO, que es la señal de confianza y de lo que
          // va esta página. El grupo y el árbol organizan el panel del mapa;
          // aquí «Ilustrativa · Lo que tiene» solo era ruido.
          const viva = Boolean(c.fichero) && !c.en_preparacion;
          const sello = viva
            ? escapar(rotulo(registros, c.registro, c.registro))
            : "en preparación";
          return `<div class="capa ${viva ? "" : "gris"}">` +
                 `<span class="n">${escapar(c.titulo)}</span>` +
                 `<span class="s">${sello}</span></div>`;
        })
        .join("");
      return `<div class="arbol"><h3>${escapar(rotulo(arboles, valor))}</h3>${filas}</div>`;
    })
    .join("");

  const vivas = manifiesto.capas.filter((c) => c.fichero && !c.en_preparacion).length;
  const grises = manifiesto.capas.length - vivas;
  document.getElementById("capas").innerHTML =
    `<p class="recuento">${vivas} capa${vivas === 1 ? "" : "s"} con datos · ` +
    `${grises} declarada${grises === 1 ? "" : "s"} y todavía vacía${grises === 1 ? "" : "s"}</p>` +
    bloques;

  // El aviso del mapa base solo se enseña mientras sea verdad, igual que en el
  // pie del visor. Una advertencia que sobrevive a su motivo enseña a ignorarlas.
  if (BASEMAP_ES_DEMO) document.getElementById("li-basemap").hidden = false;
}

pintar();
