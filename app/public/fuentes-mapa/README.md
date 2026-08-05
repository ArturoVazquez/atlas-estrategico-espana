# Los glifos del mapa, alojados aquí

MapLibre no puede usar las tipografías del sistema: necesita el alfabeto
troceado en ficheros `.pbf` por rangos Unicode, y los pide al vuelo mientras
navegas. Si esos ficheros viven en el servidor de otro, el mapa se queda sin
rótulos el día que ese servidor se mueva — el mismo riesgo por el que el atlas
archiva cada documento que cita y por el que el basemap está autoalojado.

Así que están aquí. **Noto Sans Regular**, seis rangos, 570 KB.

## Por qué esos seis y no los 256 que existen

No se eligieron a ojo: se **midieron**. Se recorrió el visor por el territorio
que el atlas cubre —Península, Baleares, Canarias, Estrecho, Melilla, norte de
Marruecos y Argelia— registrando qué rangos pedía MapLibre de verdad:

| Rango | Qué trae | Para qué |
|---|---|---|
| `0-255` | Latín básico y Latin-1 | español, portugués, francés |
| `256-511` | Latín extendido A | catalán, polaco, checo |
| `512-767` | Latín extendido B, AFI | transcripciones |
| `768-1023` | Diacríticos combinantes, griego | |
| `1536-1791` | **Árabe** | el Magreb |
| `11520-11775` | **Tifinagh** | el bereber, en Marruecos y Argelia |

Los dos últimos son la razón de medir en vez de suponer: nadie que escriba un
atlas de España se acuerda del tifinagh, y sin ese fichero los rótulos del Rif
saldrían en blanco justo en la zona que el tablero de F3 necesita leer.

## El límite, dicho

Este juego cubre **la extensión del extracto de producción**, no el planeta. Si
alguien navega hasta Grecia o Rusia con el bucket de demostración, verá rótulos
sin dibujar y un 404 en la consola: falta su rango, no está roto el visor.
Cuando el basemap definitivo sea el extracto acotado, ese caso deja de existir.

Si algún día se añade un idioma o una región, se vuelve a medir y se añade el
rango que falte. Medir cuesta un minuto; adivinar cuesta un mapa mudo.

## Licencia

Noto Sans, de The Noto Project Authors, bajo **SIL Open Font License 1.1** —
el texto íntegro está en `OFL.txt`, junto a los ficheros, como la licencia
exige. Los `.pbf` se tomaron de
[protomaps/basemaps-assets](https://github.com/protomaps/basemaps-assets).

La OFL es compatible con redistribuir estos ficheros dentro del sitio. No afecta
a la licencia de los datos del atlas (CC BY 4.0) ni a la del código (MIT): son
un tercer componente con la suya, igual que los documentos de `fuentes/`
conservan la de su emisor.
