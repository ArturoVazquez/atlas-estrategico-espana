/**
 * El panel de capas, construido ENTERO desde el manifiesto y los vocabularios.
 *
 * Este fichero no sabe qué capas existen, ni cómo se llaman los árboles, ni
 * cuántas ramas hay en gris. Lo lee todo. Ese es el criterio de hecho de la
 * fase: **añadir una capa al manifiesto la hace aparecer sin tocar aquí nada.**
 *
 * La demo v4 tenía las listas a mano (`CAPAS`, `ARBOLES` con sus `prep:[…]`), y
 * mantenerlas sincronizadas con el manifiesto habría sido cuestión de tiempo
 * hasta que dejaran de coincidir.
 */

import { indexar, rotulo } from "./datos.js";

const AVISO =
  "El mapa declara su propio horizonte: las ramas en gris existen en la " +
  "taxonomía y esperan su release. Nada llega sin casa; nada se publica a medias.";

const NOTA_FILTRO =
  "«activo» es un campo derivado del estado de cada registro — nunca editado a " +
  "mano. Corta a través de los árboles; recurso y tablero quedan al margen.";

function elemento(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

/**
 * @param {object} opciones
 * @param {(filtro:string)=>void} opciones.alFiltrar
 * @param {(idCapa:string, encendida:boolean)=>void} opciones.alConmutar
 */
export function construirPanel(contenedor, manifiesto, vocabularios, opciones) {
  const arboles = vocabularios.manifiesto.arbol; // el orden es el del vocabulario
  const registros = indexar(vocabularios.manifiesto.registro);

  // ── el filtro de explotación ──────────────────────────────────────────
  const filtro = elemento("div");
  filtro.id = "filtro";
  filtro.appendChild(elemento("h2", null, "Explotación"));

  const seg = elemento("div", "seg");
  const OPCIONES = [
    ["todo", "Todo"],
    ["activo", "En explotación"],
    ["latente", "Latente"],
  ];
  for (const [valor, texto] of OPCIONES) {
    const b = elemento("button", valor === "todo" ? "on" : null, texto);
    b.dataset.f = valor;
    b.addEventListener("click", () => {
      seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      opciones.alFiltrar(valor);
    });
    seg.appendChild(b);
  }
  filtro.appendChild(seg);
  filtro.appendChild(elemento("div", "filtro-nota", NOTA_FILTRO));
  contenedor.appendChild(filtro);

  // ── un árbol por dominio, con sus ramas ───────────────────────────────
  for (const arbol of arboles) {
    const suyas = manifiesto.capas.filter((c) => c.arbol === arbol.valor);
    if (!suyas.length) continue; // un árbol sin ramas no se dibuja vacío

    const det = elemento("details");
    det.open = true;
    const sum = elemento("summary", null, arbol.etiqueta);

    // Si TODAS las ramas del árbol son de una clase de registro que no sea la
    // corriente (p. ej. «análisis»), se rotula el árbol entero con ella. Es lo
    // que la v4 hacía a mano con `intangibles`.
    const clases = new Set(suyas.map((c) => c.registro).filter(Boolean));
    if (clases.size === 1 && !clases.has("verificado")) {
      const [unica] = clases;
      sum.appendChild(elemento("span", "arbol-tag", rotulo(registros, unica).toLowerCase()));
    }
    det.appendChild(sum);

    const ramas = elemento("div", "ramas");
    for (const capa of suyas) {
      ramas.appendChild(
        capa.en_preparacion ? ramaEnGris(capa) : ramaViva(capa, registros, opciones)
      );
    }
    det.appendChild(ramas);
    contenedor.appendChild(det);
  }

  contenedor.appendChild(elemento("div", "aviso", AVISO));
}

function ramaViva(capa, registros, opciones) {
  const label = elemento("label", "capa-item");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = true;
  input.dataset.capa = capa.id;
  input.addEventListener("change", () => opciones.alConmutar(capa.id, input.checked));

  const nombre = elemento("span", "capa-nombre");
  nombre.appendChild(document.createTextNode(capa.titulo));
  if (capa.registro) {
    nombre.appendChild(elemento("span", "capa-tag", rotulo(registros, capa.registro)));
  }

  label.append(input, elemento("span", "capa-check"), nombre);
  return label;
}

/** La regla del horizonte (§3, D4), LEÍDA del manifiesto en vez de repetida. */
function ramaEnGris(capa) {
  const div = elemento("div", "rama-prep");
  div.appendChild(elemento("span", null, capa.titulo));
  div.appendChild(elemento("span", "prep-tag", "en preparación"));
  return div;
}
