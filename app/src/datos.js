/**
 * Carga el manifiesto, los vocabularios y las capas publicadas.
 *
 * Todo sale de `public/datos/`, que el build copió DESDE LA ETIQUETA
 * (`preparar-datos.mjs`). El visor no sabe nada del árbol de trabajo, y ese es
 * el punto: sirve una release, no lo que alguien tenga sin guardar.
 */

const BASE = "/datos";

async function json(ruta) {
  const r = await fetch(`${BASE}/${ruta}`);
  if (!r.ok) throw new Error(`No se pudo leer ${ruta} (${r.status})`);
  return r.json();
}

/**
 * Los vocabularios son la ÚNICA fuente de rótulos y de orden. `vocabularios.json`
 * lo dice de sí mismo: «el orden de cada lista es el orden de presentación: el
 * visor no reordena ni traduce, lee de aquí». Traducir un enum en el código
 * sería la segunda fuente de verdad que D3 descartó.
 */
export function indexar(lista) {
  return new Map((lista || []).map((v) => [v.valor, v]));
}

export function rotulo(indice, valor, porDefecto = valor) {
  return indice.get(valor)?.etiqueta ?? porDefecto;
}

/**
 * El catálogo: manifiesto y vocabularios, SIN las capas.
 *
 * Lo pide la página «Método», que describe el atlas y no lo dibuja: cargarle las
 * siete colecciones para enseñar una tabla de rótulos serían megabytes por nada.
 * `cargar()` lo reutiliza, así que la ruta de lectura sigue siendo una sola.
 */
export async function cargarCatalogo() {
  const [manifiesto, vocabularios] = await Promise.all([
    json("manifest.json"),
    json("vocabularios.json"),
  ]);
  return { manifiesto, vocabularios };
}

export async function cargar() {
  const { manifiesto, vocabularios } = await cargarCatalogo();

  const publicadas = manifiesto.capas.filter((c) => c.fichero && !c.en_preparacion);

  // Las capas se cargan en paralelo y cada una carga con su entrada de
  // manifiesto al lado: el resto del visor no vuelve a buscar en el manifiesto.
  const capas = await Promise.all(
    publicadas.map(async (entrada) => ({
      entrada,
      coleccion: await json(entrada.fichero),
    }))
  );

  return { manifiesto, vocabularios, capas };
}
