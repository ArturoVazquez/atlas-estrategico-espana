/**
 * La ficha de un registro: el núcleo del contrato §5 puesto en pantalla.
 *
 * Lo que esta ficha tiene que conseguir es que **no se pueda leer un dato sin
 * ver de qué pie cojea**: su estado de verificación, la fuente que lo sostiene
 * y, cuando falta, el hueco dicho en voz alta. Por eso los sufijos `__v` y
 * `__f` (§6.2) no se esconden: se pintan al lado del campo que acompañan.
 */

import { indexar, rotulo } from "./datos.js";
import { colorDe } from "./mapa.js";

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

export function crearFicha(vocabularios) {
  const verif = indexar(vocabularios.registro.verif);
  const precision = indexar(vocabularios.registro.geo_precision);
  const fase = indexar(vocabularios.registro.fase);
  const tipoFuente = indexar(vocabularios.fuente.tipo);
  const panel = document.getElementById("ficha");
  const cuerpo = document.getElementById("ficha-contenido");

  const badge = (v) =>
    v ? `<span class="badge ${escapar(v)}">${escapar(rotulo(verif, v))}</span>` : "";

  /** Un campo con su estado de verificación y la fuente que lo sostiene. */
  const campo = (k, valor, props, base, fuentes, extra) => {
    if (valor === undefined || valor === null || valor === "") return "";
    const v = props[`${base}__v`];
    const f = props[`${base}__f`];
    const fuente = fuentes.find((x) => x.id === f);
    // Si un campo se declara verificado, la ficha DICE con qué. Un estado sin
    // su fuente al lado es media verdad, y R2 existe justo para impedirlo.
    const meta = [fuente && `según ${escapar(fuente.titulo)}`, extra]
      .filter(Boolean)
      .join(" · ");
    return (
      `<div class="campo"><div class="campo-k"><span>${escapar(k)}</span>${badge(v)}</div>` +
      `<div class="campo-v">${escapar(valor)}</div>` +
      (meta ? `<div class="campo-meta">${meta}</div>` : "") +
      `</div>`
    );
  };

  /**
   * @param {object[]} [vecinos] otros registros en la MISMA coordenada.
   *
   * Dos reactores de una central comparten punto porque no hay fuente que sitúe
   * cada edificio (§6.6). Sin esta lista, el de abajo sería inalcanzable: la
   * capa tendría siete registros y el visor enseñaría seis, que es una forma
   * silenciosa de perder un dato.
   */
  function abrir(feature, entrada, vecinos = []) {
    const p = feature.properties || {};
    const fuentes = p.fuentes || [];
    const cat = colorDe(entrada.id, p.categoria);
    const catRotulo = rotulo(
      indexar(vocabularios.categoria[entrada.id]),
      p.categoria,
      p.categoria || ""
    );

    const lugar = [p.municipio, p.provincia].filter(Boolean).join(" · ");
    const materias = (p.materias || [])
      .map((m) => `<span class="materia">${escapar(m)}</span>`)
      .join("");

    cuerpo.innerHTML = `
      <div class="ficha-cat" style="color:${cat}"><span class="pastilla" style="background:${cat}"></span>${escapar(catRotulo)}</div>
      <h3>${escapar(p.nombre)}</h3>
      ${p.nombre_oficial && p.nombre_oficial !== p.nombre
        ? `<div class="ficha-oficial">en el documento oficial: ${escapar(p.nombre_oficial)}</div>`
        : ""}
      ${lugar && lugar !== p.nombre ? `<div class="ficha-lugar">${escapar(lugar)}</div>` : ""}
      ${badge(p.verif)}
      ${p.descripcion ? `<div class="ficha-desc">${escapar(p.descripcion)}</div>` : ""}
      ${materias ? `<div class="materias">${materias}</div>` : ""}

      <div class="registro">
        ${camposDeCapa(p, fuentes, fase, campo)}
        ${(p.claves || []).map((c) => {
          const f = fuentes.find((x) => x.id === c.fuente);
          return `<div class="campo"><div class="campo-k"><span>${escapar(c.k)}</span>${badge(c.verif)}</div>` +
                 `<div class="campo-v">${escapar(c.v)}</div>` +
                 (f ? `<div class="campo-meta">según ${escapar(f.titulo)}</div>` : "") + `</div>`;
        }).join("")}
        ${precisionGeografica(p, precision, fuentes)}
      </div>

      ${vecinos.length ? `<div class="vecinos"><h4>También en este emplazamiento</h4>${
        vecinos.map((v) => `<button class="vecino" data-slug="${escapar(v.properties.slug)}">${escapar(v.properties.nombre)}</button>`).join("")
      }</div>` : ""}

      <div class="fuentes"><h4>Fuentes</h4>${fuentes.map((f) => pintarFuente(f, tipoFuente)).join("")}</div>
      ${p.nota ? `<div class="ficha-nota">${escapar(p.nota)}</div>` : ""}
      ${debate(p.debate_url)}`;

    for (const b of cuerpo.querySelectorAll(".vecino")) {
      b.addEventListener("click", () => {
        const otro = vecinos.find((v) => v.properties.slug === b.dataset.slug);
        if (otro) abrir(otro, entrada, [feature, ...vecinos.filter((v) => v !== otro)]);
      });
    }

    panel.classList.add("abierta");
    panel.setAttribute("aria-hidden", "false");
    document.querySelector(".ficha-cerrar")?.focus();
  }

  function cerrar() {
    panel.classList.remove("abierta");
    panel.setAttribute("aria-hidden", "true");
  }

  document.querySelector(".ficha-cerrar").addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrar();
  });

  return { abrir, cerrar };
}

/**
 * Los campos PROPIOS de la capa, sin saber qué capa es.
 *
 * La primera versión de esta ficha listaba a mano «Promotor», «Fase», «Estado»…
 * —los campos de `minerales-proyectos`— y al llegar la segunda capa no enseñaba
 * ni la potencia, ni los titulares, ni las fechas de autorización: los datos
 * estaban cargados y la ficha los ignoraba en silencio. El panel se construía
 * desde el manifiesto y la ficha no; a medias no vale.
 *
 * Ahora se pinta todo lo que no es del núcleo (§5) ni metadato: el contrato pide
 * que los campos de capa vayan PLANOS en `properties` (§5), y eso es justo lo
 * que permite recorrerlos sin conocerlos.
 */
const NUCLEO = new Set([
  "slug", "nombre", "nombre_oficial", "categoria", "descripcion", "estado_registro",
  "verif", "geo_precision", "geo_fuente", "fecha_alta", "fecha_verificacion",
  "fuentes", "claves", "nota", "debate_url", "municipio", "provincia",
]);

/**
 * `autorizacion_hasta` → «Autorización hasta».
 *
 * Sin tabla POR CAPA: si hiciera falta una, volveríamos a tener código que
 * conoce las capas de antemano. La excepción de abajo no lo es — son nombres de
 * CAMPO, valen para cualquier capa que los use, y existen porque las claves van
 * en `[a-z0-9_]` y de ahí no sale una tilde. «AMBITO» en versalitas se lee mal
 * y el atlas escribe en español.
 */
const ROTULOS = {
  ambito_territorial: "Ámbito territorial",
  sym: "Símbolos",
  anio: "Año",
  caracter_dato: "Carácter del dato",
  nuclear_gwh: "Nuclear (GWh)",
  eolica_gwh: "Eólica (GWh)",
  solar_fv_gwh: "Solar fotovoltaica (GWh)",
  solar_termica_gwh: "Solar térmica (GWh)",
  mareomotriz_gwh: "Mareomotriz y olas (GWh)",
  combustibles_gwh: "Combustibles (GWh)",
  cogeneracion_gwh: "Cogeneración (GWh)",
  hidraulica_gwh: "Hidráulica (GWh)",
  total_gwh: "Total (GWh)",
  codigo_promotor: "Código en el acto",
  consumo_gwh_anio: "Consumo declarado (GWh/año)",
  superficie_ha: "Superficie (ha)",
  pci_codigo: "Proyecto de la lista de la Unión",
  estado_pci: "Estado según la Comisión",
  puesta_en_servicio_prevista: "Puesta en servicio prevista",
  longitud_km: "Longitud declarada (km)",
  diametro_mm: "Diámetro (mm)",
  capacidad_mt_anio: "Capacidad (Mt/año)",
  potencia_mw: "Potencia (MW)",
  volumen_util_gwh: "Volumen útil (GWh)",
  produccion_t_anio: "Producción declarada (t/año)",
  beneficiario: "Beneficiario",
  cif: "Identificador fiscal",
  codigo_plan: "Plan de inversión",
  comision_verificacion: "Comisión de verificación",
  presupuesto_financiable: "Presupuesto financiable (€)",
  gasto_subvencionable: "Gasto subvencionable (€)",
  subvencion_propuesta: "Subvención PROPUESTA (€)",
  prestamo_propuesto: "Préstamo PROPUESTO (€)",
};

function rotularCampo(clave) {
  if (ROTULOS[clave]) return ROTULOS[clave];
  const t = clave.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/\bmw\b/gi, "(MW)");
}

function camposDeCapa(p, fuentes, fase, campo) {
  const salida = [];
  for (const [clave, valor] of Object.entries(p)) {
    if (NUCLEO.has(clave) || clave.includes("__")) continue;
    if (valor === null || valor === undefined || valor === "") continue;
    // `fase` es el único que se traduce, porque es vocabulario controlado (§6.5).
    //
    // Las CIFRAS se escriben a la española, que es el idioma del atlas: punto de
    // millar y coma decimal. Se aplica a todo número —una regla, no una lista de
    // sufijos que hay que ampliar cada vez que nace una capa— con **una sola
    // excepción, `anio`**, porque un año con separador de miles diría «2.024».
    // No se fuerzan decimales: así una tensión de 400 kV sigue diciendo «400» y
    // un consumo de 3279,7 GWh dice «3.279,7».
    const texto = clave === "fase"
      ? rotulo(fase, valor, valor)
      : Array.isArray(valor) ? valor.join(" · ")
      : typeof valor === "number" && clave !== "anio"
        ? valor.toLocaleString("es-ES")
        : String(valor);
    // Un `_fecha` acompaña al campo anterior: se cuelga de él como metadato.
    if (clave.endsWith("_fecha")) continue;
    const extra = p[`${clave}_fecha`] ? `dato de ${p[`${clave}_fecha`]}` : "";
    salida.push(campo(rotularCampo(clave), texto, p, clave, fuentes, extra));
  }
  return salida.join("");
}

/**
 * La precisión geográfica, que es lo que impide que el mapa mienta.
 *
 * Un punto pintado sobre buena cartografía afirma exactitud aunque la ficha
 * diga lo contrario, y en un mapa gana lo que se ve (§6.6). Si la ficha no
 * dice de qué precisión es la coordenada, el visor está afirmando algo que los
 * datos no sostienen — así que este campo NO es opcional.
 */
function precisionGeografica(p, precision, fuentes) {
  if (!p.geo_precision) return "";
  const def = precision.get(p.geo_precision);
  const f = fuentes.find((x) => x.id === p.geo_fuente__f);
  const meta = [p.geo_fuente, f && `según ${f.titulo}`].filter(Boolean).join(" · ");
  return (
    `<div class="campo"><div class="campo-k"><span>Precisión geográfica</span>` +
    (p.geo_fuente__v ? `<span class="badge ${escapar(p.geo_fuente__v)}">${escapar(p.geo_fuente__v.replace("_", " "))}</span>` : "") +
    `</div><div class="campo-v">${escapar(def?.etiqueta || p.geo_precision)}` +
    (def?.def ? ` — ${escapar(def.def)}` : "") +
    `</div>` +
    (meta ? `<div class="campo-meta">${escapar(meta)}</div>` : "") +
    `</div>`
  );
}

/**
 * El enlace al hilo donde se debate este registro (§5, `debate_url`).
 *
 * Estaba en el contrato y en `nucleo.schema.json` desde el principio, y la ficha
 * **se lo tragaba en silencio**: `debate_url` figura en el conjunto NUCLEO —el
 * de los campos que no se listan como fila— y no se pintaba en ningún otro
 * sitio. El día que un registro trajera su hilo, el enlace no habría aparecido y
 * nadie se habría enterado, que es la forma más cara de perder un dato.
 *
 * Va al PIE y separado, no como una fila más: es la salida de la ficha hacia el
 * foro, no un atributo del registro. Y el atlas no interpreta — por eso el
 * rótulo dice dónde se discute, no qué se concluye.
 */
function debate(url) {
  if (!url) return "";
  return `<a class="debate" href="${escapar(url)}" target="_blank" rel="noopener">` +
         `Se debate en El Tercio →</a>`;
}

/** Un hueco se pinta COMO hueco: en cursiva, sin enlace y sin disimulo. */
function pintarFuente(f, tipoFuente) {
  if (f.tipo === "hueco") {
    return `<div class="fuente hueco">${escapar(f.titulo)}</div>`;
  }
  const etiqueta = rotulo(tipoFuente, f.tipo, f.tipo);
  const titulo = f.url
    ? `<a href="${escapar(f.url)}" target="_blank" rel="noopener">${escapar(f.titulo)}</a>`
    : escapar(f.titulo);
  return (
    `<div class="fuente">${titulo}` +
    (f.fecha ? ` <span class="f-fecha">· ${escapar(f.fecha)}</span>` : "") +
    `<span class="f-tipo">${escapar(etiqueta)}</span></div>`
  );
}
