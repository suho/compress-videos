# 🎬 Compress Videos

Compress videos **entirely in your browser** with FFmpeg compiled to WebAssembly.
No server, no uploads — your files never leave your device. Deployable for free on
GitHub Pages.

Drop one or many videos, tune quality, and download the compressed results.

## How it works

- **Engine:** [`ffmpeg.wasm`](https://ffmpegwasm.netlify.app/) — the FFmpeg CLI
  compiled to WebAssembly, running in a Web Worker on the client.
- **No backend:** it's a static site. Files are read with the File API, processed
  in-memory, and offered back as a download via an object URL.
- **Tech stack:** vanilla JS + [Vite](https://vitejs.dev/). Hosted on **GitHub Pages**
  via GitHub Actions.

The compression mirrors a command like:

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 26 -preset medium \
  -pix_fmt yuv420p -acodec aac -b:a 128k -map_metadata -1 -movflags +faststart output.mp4
```

Adjustable in the UI: **codec, CRF (quality), preset, audio bitrate**. Metadata is
stripped (`-map_metadata -1`) and `+faststart` is applied for instant web playback.

## ⚠️ About H.265 / HEVC

The original goal was the HEVC command
(`-vcodec libx265 -tag:v hvc1 …`). After end-to-end testing, here's the honest state
of in-browser HEVC today:

| Codec | Engine | Chrome / Safari | Firefox |
|-------|--------|:---------------:|:-------:|
| **H.264** (`libx264`) | single-threaded core | ✅ works | ✅ works |
| **H.265** (`libx265`) | multi-threaded core | ❌ **hangs** | ✅ works |

`libx265` needs POSIX threads to run. The single-threaded ffmpeg.wasm core has none
(so x265 deadlocks instantly), and the multi-threaded core hits a
[known ffmpeg.wasm bug (#772)](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/772)
that deadlocks on Chromium and Safari — it only completes in **Firefox**.

So the app:

- Defaults to **H.264**, which reliably compresses in every browser.
- Offers **H.265/HEVC** but **enables it only on Firefox** (using the multi-threaded
  core + cross-origin isolation). It's disabled elsewhere so it can never freeze a tab.

H.264 at CRF 24–28 still gives excellent size reduction with universal playback;
HEVC yields ~20–30% smaller files but is slow to encode in WASM (no GPU).

> The multi-threaded (HEVC) path needs `SharedArrayBuffer`, which requires COOP/COEP
> headers. GitHub Pages can't set custom headers, so
> [`coi-serviceworker`](https://github.com/gzuidhof/coi-serviceworker) injects them
> client-side (it reloads the page once on first visit). H.264 needs none of this.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173  (dev server sets COOP/COEP for the HEVC path)
npm run build    # outputs static site to dist/
npm run preview  # serve the production build locally
```

Add `?debug` to the URL to print FFmpeg logs to the console.

## Deploy to GitHub Pages (free)

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and
   deploys automatically. Your site goes live at
   `https://<user>.github.io/<repo>/`.

The build uses a relative base path, so it works under a project subpath without
extra config.

## Notes & limits

- Everything runs in RAM, so very large files are bounded by available memory
  (browser tabs typically cap around ~2 GB for WASM). Multi-GB videos may fail.
- The FFmpeg core (~30 MB WASM) is fetched from the unpkg CDN on first compress and
  cached by the browser thereafter.
- Files are processed one at a time when you queue multiple.
