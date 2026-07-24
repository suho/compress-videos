import { defineConfig } from 'vite'

// Relative base ('./') so the build works on GitHub Pages project sites
// (https://user.github.io/<repo>/) without hardcoding the repo name.
export default defineConfig({
  base: './',
  // Don't let Vite's dep optimizer pre-bundle ffmpeg — it rewrites the
  // library's internal Web Worker in a way that COEP (require-corp) blocks,
  // which makes ffmpeg.load() hang forever at "Loading…".
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    // Enable cross-origin isolation in `npm run dev` too, so the
    // multi-threaded ffmpeg core (SharedArrayBuffer) works locally.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
