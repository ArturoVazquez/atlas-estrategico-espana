# El mapa base: cómo se genera y dónde vive

El visor no usa un servicio de teselas de nadie. Usa **un fichero PMTiles
nuestro**, que el navegador lee con *range requests*: no hay servidor de teselas
que mantener, y el día que Protomaps u OpenFreeMap cierren, el atlas sigue
dibujándose.

No es una manía técnica: es la misma razón por la que `fuentes/` existe. Un atlas
que archiva cada documento que cita porque «las URLs se pudren» no puede colgar
su mapa base de la buena voluntad de un tercero.

## Estado — HECHO (2026-08-08)

| | |
|---|---|
| Fichero | `atlas-basemap.pmtiles`, **80,9 MiB** |
| Dónde | [`ArturoVazquez/atlas-basemap`](https://github.com/ArturoVazquez/atlas-basemap), servido por GitHub Pages |
| URL | `https://arturovazquez.github.io/atlas-basemap/atlas-basemap.pmtiles` |
| Recuadro | `-18.3, 27.5, 4.4, 43.9` — el mismo que valida el contrato en §7.4 |
| Zooms | 0 a **10** |

El aviso rojo del pie ya no sale: solo aparece si el visor cae al bucket de
demostración de Protomaps, y ya no cae.

## Por qué GitHub Pages, y no otra cosa

Un PMTiles necesita del servidor **dos** cosas: que sirva **trozos** del fichero
(`206 Partial Content` con `Accept-Ranges`) y que permita **CORS**. Se
comprobaron con peticiones reales, no leyendo documentación:

| Candidato | Trozos | CORS | Veredicto |
|---|---|---|---|
| **GitHub Pages** | ✅ | ✅ `Access-Control-Allow-Origin: *` | **el elegido** |
| GitHub **Releases** | ✅ | ❌ **ninguna cabecera CORS** | el navegador lo bloquearía |
| Vercel Hobby | — | — | tope de **100 MB** por fichero estático |
| Cloudflare R2 | ✅ | ✅ configurable | vale, pero exige cuenta nueva |

> **La trampa que costó el plan entero:** GitHub Pages admite **1 GB de sitio**,
> pero git **BLOQUEA cualquier fichero de más de 100 MiB** en el push. Son dos
> límites distintos y el que manda es el segundo. Un plan hecho leyendo solo el
> primero da un mapa de 488 MB que no se puede subir.

## Por qué se corta en z10

Por un límite y por una razón, en ese orden — y conviene no confundirlos.

**El límite.** Tamaños medidos con `--dry-run` sobre este recuadro:

| `--maxzoom` | Archivo | ¿Cabe en GitHub? | Qué se ve |
|---|---|---|---|
| **10** | **85 MB** | ✅ | comarca y ciudad |
| 11 | 182 MB | ❌ | pueblo grande |
| 12 | 488 MB | ❌ | pueblo y carretera |
| 13 | 1,0 GB | ❌ | calle |

**La razón.** La geometría publicada es `paraje` en el mejor caso (§6.6). Un
fondo al que puedes acercarte hasta ver el tejado **invita a leer el punto como
si estuviera medido al metro**, que es justo lo que la doctrina de precisión se
propone impedir. Pasado z10 MapLibre estira las teselas: el mapa se ve **blando**
al acercarse, y esa blandura dice la verdad sobre el dato.

`maxZoom` del visor sigue en **14**, a propósito: acercarse tiene que poder
hacerse. Lo que cambia es que el fondo deja de fingir nitidez antes que el dato.

**Si algún día hace falta más detalle** —y con alojamiento sin ese tope, cabe—,
se regenera con otro `--maxzoom`, se sube y se cambia `VITE_BASEMAP`. El visor no
se entera.

## Cómo se regenera

Con el [CLI de go-pmtiles](https://github.com/protomaps/go-pmtiles/releases).
Extrae del planeta remoto por *range requests*: **no** hay que descargar los
137 GB. Tardó 16 segundos.

```sh
pmtiles extract https://demo-bucket.protomaps.com/v4.pmtiles atlas-basemap.pmtiles \
  --bbox=-18.3,27.5,4.4,43.9 \
  --maxzoom=10
```

Se sube al repositorio del mapa base —**no al del atlas**, que es un archivo de
citas y no debe cargar 81 MB de binario en su historial— y GitHub Pages lo sirve
sin más configuración.

## Si se cambia de alojamiento

Hace falta que sirva **range requests** y permita **CORS**. En un bucket S3
compatible, el CORS mínimo:

```json
[{ "AllowedOrigins": ["https://atlas.eltercioviejo.com", "http://localhost:5173"],
   "AllowedMethods": ["GET", "HEAD"],
   "AllowedHeaders": ["range", "if-match"],
   "ExposeHeaders": ["etag", "content-range"] }]
```

`ExposeHeaders` no es opcional: sin `content-range` el cliente PMTiles no puede
leer por trozos y el mapa se queda en blanco sin decir por qué.

Y si el mapa base acabara servido **desde el mismo dominio que el atlas**, el
CORS deja de existir como problema: es la misma web pidiéndose a sí misma.

```sh
VITE_BASEMAP=https://<donde-sea>/atlas-basemap.pmtiles npm run build
```

> Trampa que costó un rato, por si vuelve a pasar: en Git Bash,
> `VITE_BASEMAP=/fichero.pmtiles` se convierte solo en una ruta de Windows
> (`C:/Program Files/Git/fichero.pmtiles`) antes de llegar al programa. Con
> `MSYS_NO_PATHCONV=1` delante, no. Le pasa igual a `gh api /repos/...`.
