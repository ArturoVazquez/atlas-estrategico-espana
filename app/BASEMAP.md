# El mapa base: cómo se genera y dónde se pone

El visor no usa un servicio de teselas de nadie. Usa **un fichero PMTiles
nuestro**, que el navegador lee con *range requests*: no hay servidor de teselas
que mantener, y el día que Protomaps u OpenFreeMap cierren, el atlas sigue
dibujándose.

No es una manía técnica: es la misma razón por la que `fuentes/` existe. Un atlas
que archiva cada documento que cita porque «las URLs se pudren» no puede colgar
su mapa base de la buena voluntad de un tercero.

## Estado

**Falta el fichero de producción.** Mientras no exista, el visor cae al *bucket
de demostración* de Protomaps —que es de ellos, sirve el planeta entero y no
responde de nada— y **lo dice en su propio pie, en rojo**. Ese aviso desaparece
solo cuando `VITE_BASEMAP` apunta a un fichero propio.

## 1 · Generar el extracto

Con el [CLI de go-pmtiles](https://github.com/protomaps/go-pmtiles/releases).
Extrae del planeta remoto por *range requests*: **no** hay que descargar los
137 GB.

```sh
pmtiles extract https://demo-bucket.protomaps.com/v4.pmtiles atlas-basemap.pmtiles \
  --bbox=-18.3,27.5,4.4,43.9 \
  --maxzoom=13
```

**El recuadro no es arbitrario: es el mismo que el contrato valida en §7.4**
—Canarias incluidas—, así que el mapa base cubre exactamente el territorio en el
que un dato del atlas puede caer, y ni un grado más. De propina entra el norte
del Magreb, que es el vecindario que el tablero necesita en F3.

**Tamaños medidos** (con `--dry-run`, sobre ese recuadro):

| `--maxzoom` | Archivo | Qué se ve |
|---|---|---|
| 12 | **488 MB** | comarca; suficiente para leer el territorio |
| 13 | **1,0 GB** | pueblo y carretera |
| 14 | **2,0 GB** | calle |

**Recomendado: 13.** Hay un argumento de doctrina y no solo de peso. La
geometría publicada es `paraje` en el mejor caso (§6.6): un punto que se puede
ampliar hasta ver el tejado invita a leerlo como medido, que es justo lo que la
tanda de geometría se propuso impedir. Si el mapa base se queda en 13, MapLibre
estira las teselas al ampliar más — el mapa se ve *blando* al acercarse, y esa
blandura dice la verdad sobre la precisión del dato.

## 2 · Ponerlo donde se pueda leer

Hace falta almacenamiento que sirva **range requests** y permita **CORS**.
Cloudflare R2 encaja porque el egress es gratis, que es el perfil de coste de un
mapa público; cualquier S3 compatible vale.

CORS mínimo en el bucket:

```json
[{ "AllowedOrigins": ["https://atlas.eltercioviejo.com", "http://localhost:5173"],
   "AllowedMethods": ["GET", "HEAD"],
   "AllowedHeaders": ["range", "if-match"],
   "ExposeHeaders": ["etag", "content-range"] }]
```

`ExposeHeaders` no es opcional: sin `content-range` el cliente PMTiles no puede
leer por trozos y el mapa se queda en blanco sin decir por qué.

## 3 · Apuntar el visor

```sh
VITE_BASEMAP=https://<tu-bucket>/atlas-basemap.pmtiles npm run build
```

Y ya está: el aviso rojo del pie desaparece porque el visor comprueba si la URL
es la del bucket de demostración.

## Comprobado hasta dónde se pudo

El camino entero —generar un extracto con este mismo recuadro, servirlo nosotros
y que el visor lo pinte— **está probado**: con un extracto de prueba a `z≤8`
(12 MB) el visor dibuja el mapa y sus once puntos con **cero peticiones a
terceros** y ninguna respuesta ≥400. Lo único sin probar es la subida al bucket,
que necesita una cuenta.

> Trampa que costó un rato, por si vuelve a pasar: en Git Bash,
> `VITE_BASEMAP=/fichero.pmtiles` se convierte solo en una ruta de Windows
> (`C:/Program Files/Git/fichero.pmtiles`) antes de llegar al programa. Con
> `MSYS_NO_PATHCONV=1` delante, no.
