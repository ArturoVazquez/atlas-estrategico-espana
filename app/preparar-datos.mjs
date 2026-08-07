#!/usr/bin/env node
/**
 * Copia `datos/` DESDE LA ETIQUETA a `public/datos/`, antes de construir.
 *
 * CONTRATO-DATOS.md §8: «La app no lee ficheros vivos: lee la última release
 * etiquetada». En un sitio estático la única forma honesta de cumplirlo es que
 * el build fije la etiqueta — si el visor leyera el `datos/` del árbol de
 * trabajo, publicaría datos a medio verificar cada vez que alguien guarda un
 * fichero, y la palabra «release» no significaría nada.
 *
 * Lee del OBJETO de git, no del disco: da igual lo sucio que esté el árbol de
 * trabajo, sale exactamente lo que se etiquetó. Esa es toda la propiedad que se
 * busca, y por eso no vale copiar ficheros.
 *
 * Solo git y Node: nada de `tar`, `sh` ni `unzip`. Un despliegue que depende de
 * qué herramientas trae el runner es un despliegue que se rompe el día que
 * cambian el runner.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const DESTINO = join(AQUI, "public", "datos");

const { etiqueta } = JSON.parse(readFileSync(join(AQUI, "release.json"), "utf8"));

const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Que la etiqueta exista se comprueba ANTES de borrar nada: un despliegue que
// destruye lo que tenía y luego falla es peor que uno que no llega a empezar.
try {
  // stderr a «pipe» para que el «fatal:» de git no se cuele por delante del
  // mensaje de abajo, que es el que explica qué hacer.
  execFileSync("git", ["rev-parse", "--verify", `${etiqueta}^{tag}`], {
    cwd: RAIZ,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch {
  console.error(
    `\n  La etiqueta «${etiqueta}» no existe en este repositorio.\n` +
      `  El visor sirve releases, no la rama viva (contrato §8):\n` +
      `  sin etiqueta no hay nada que servir.\n\n  Etiquetas disponibles:\n    ` +
      git("tag", "-l").trim().split("\n").join("\n    ") + "\n"
  );
  process.exit(1);
}

const ficheros = git("ls-tree", "-r", "--name-only", etiqueta, "datos")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

if (!ficheros.some((f) => f === "datos/manifest.json")) {
  console.error(`\n  «${etiqueta}» no contiene datos/manifest.json. No se toca nada.\n`);
  process.exit(1);
}

rmSync(DESTINO, { recursive: true, force: true });

for (const fichero of ficheros) {
  // Los .md de datos/ (la licencia) no los sirve el visor: son documentación
  // del repo, y el sitio ya enlazará al repositorio. Los ficheros ocultos
  // (.gitkeep) tampoco: existen para que git conserve un directorio vacío.
  const nombre = posix.basename(fichero);
  if (fichero.endsWith(".md") || nombre.startsWith(".")) continue;

  const relativo = posix.relative("datos", fichero);
  const salida = join(DESTINO, relativo);
  mkdirSync(dirname(salida), { recursive: true });
  // `git show` devuelve el contenido del blob tal cual quedó etiquetado.
  writeFileSync(
    salida,
    execFileSync("git", ["show", `${etiqueta}:${fichero}`], {
      cwd: RAIZ,
      maxBuffer: 64 * 1024 * 1024,
    })
  );
}

const m = JSON.parse(readFileSync(join(DESTINO, "manifest.json"), "utf8"));
const conDatos = m.capas.filter((c) => c.fichero).length;

// El manifiesto dice de qué release es, y la etiqueta dice cuál se está
// sirviendo. Si no coinciden, alguien publicó una release y se dejó la cabecera
// del manifiesto sin tocar — que es exactamente lo que pasó tres veces seguidas
// el 2026-08-07, porque se actualizaban las entradas de capa una a una y nunca
// lo de arriba. AVISA y no rompe: el dato servido es el de la etiqueta y está
// bien; lo que está mal es lo que el manifiesto dice de sí mismo.
const declarada = String(m.release ?? "");
if (declarada && !etiqueta.endsWith(declarada)) {
  console.warn(
    `\n  ⚠ El manifiesto dice ser de la release «${declarada}» y se está sirviendo` +
      `\n    «${etiqueta}». Se sirve la etiqueta, que es lo correcto — pero la` +
      `\n    cabecera de datos/manifest.json se quedó sin actualizar.\n`
  );
}

console.log(
  `  ${etiqueta} → public/datos/   release ${m.release} · ` +
    `${conDatos} capa(s) con datos · ${m.capas.length - conDatos} en preparación`
);
