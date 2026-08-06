import { resolve } from "node:path";
import { defineConfig } from "vite";

/**
 * Dos páginas: el visor y el método.
 *
 * Vite asume una sola entrada mientras solo hay un `index.html`. En cuanto
 * aparece la segunda hay que decírselo, o el build la deja fuera **sin avisar**:
 * `dist/` sale bien, el despliegue sale bien, y el enlace del pie da 404 en
 * producción. Es el único motivo por el que este fichero existe.
 */
export default defineConfig({
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        visor: resolve(import.meta.dirname, "index.html"),
        metodo: resolve(import.meta.dirname, "metodo.html"),
      },
    },
  },
});
