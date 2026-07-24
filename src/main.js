import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import './style.css'

const CORE_VERSION = '0.12.10'
// Single-threaded core: no SharedArrayBuffer needed, runs everywhere. Used for H.264.
const ST_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`
// Multi-threaded core: needed for H.265 (libx265 requires threads). Due to a known
// ffmpeg.wasm bug (github #772) it only completes on Firefox — hangs on Chromium/Safari.
const MT_BASE = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/esm`

const isFirefox = /firefox/i.test(navigator.userAgent)
const debug = new URLSearchParams(location.search).has('debug')

// ---- DOM ----
const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('fileInput')
const fileListEl = document.getElementById('fileList')
const compressBtn = document.getElementById('compressBtn')
const clearBtn = document.getElementById('clearBtn')
const statusEl = document.getElementById('status')
const crfInput = document.getElementById('crf')
const crfValue = document.getElementById('crfValue')
const presetSelect = document.getElementById('preset')
const audioSelect = document.getElementById('audioBitrate')
const codecSelect = document.getElementById('codec')
const codecNote = document.getElementById('codecNote')
const sizeOptions = [...document.querySelectorAll('.size-option')]
const estimateSummary = document.getElementById('estimateSummary')

// ---- State ----
/** @type {{file: File, id: string, status: string, progress?: number, resultUrl?: string, outName?: string, outSize?: number}[]} */
let items = []
const cores = {} // codec-family -> { ffmpeg, loading }
let running = false
let selectedProfile = 'balanced'

const profiles = {
  quality: {
    crf: '22',
    preset: 'medium',
    audioBitrate: '192k',
    estimate: [0.55, 0.8]
  },
  balanced: {
    crf: '26',
    preset: 'medium',
    audioBitrate: '128k',
    estimate: [0.35, 0.6]
  },
  smallest: {
    crf: '30',
    preset: 'slow',
    audioBitrate: '96k',
    estimate: [0.2, 0.4]
  }
}

// ---- FFmpeg lifecycle (one instance per core type, lazily loaded) ----
async function getFFmpeg(multiThread) {
  const key = multiThread ? 'mt' : 'st'
  const slot = (cores[key] ??= {})
  if (slot.ffmpeg) return slot.ffmpeg
  if (slot.loading) return slot.loading

  slot.loading = (async () => {
    const instance = new FFmpeg()
    const base = multiThread ? MT_BASE : ST_BASE
    instance.on('log', ({ message }) => {
      if (debug) console.log('[ffmpeg]', message)
    })

    setStatus('Getting the compressor ready…')

    const config = {
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')
    }
    if (multiThread) {
      config.workerURL = await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript')
    }
    await instance.load(config)
    slot.ffmpeg = instance
    return instance
  })()

  return slot.loading
}

// ---- Codec option availability ----
// H.265 only works on Firefox (mt core). Disable it elsewhere so it can't hang the tab.
function initCodecOptions() {
  const hevcOption = [...codecSelect.options].find((o) => o.value === 'h265')
  if (!isFirefox) {
    hevcOption.disabled = true
    hevcOption.textContent = 'H.265 / HEVC — Firefox only'
    codecNote.textContent =
      'H.265/HEVC is disabled: a known ffmpeg.wasm bug hangs it in Chrome/Safari. It works in Firefox, or use H.264 here.'
  } else {
    codecNote.textContent =
      'H.265/HEVC produces smaller files but encodes slowly in-browser. H.264 is faster and universally compatible.'
  }
}

// ---- File handling ----
function addFiles(fileList) {
  const vids = [...fileList].filter(
    (f) => f.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(f.name)
  )
  for (const file of vids) {
    items.push({
      file,
      id: `${file.name}-${file.size}-${items.length}-${file.lastModified}`,
      status: 'queued'
    })
  }
  render()
}

function render() {
  fileListEl.innerHTML = ''
  const estimate = getEstimateRange()
  for (const item of items) {
    const li = document.createElement('li')
    li.className = 'file-item'
    li.dataset.status = item.status

    const info = document.createElement('div')
    info.className = 'file-info'
    info.innerHTML = `
      <span class="file-name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</span>
      <span class="file-meta">${
        item.outSize
          ? `${formatBytes(item.file.size)} → <strong>${formatBytes(item.outSize)}</strong> <span class="savings">${savings(item.file.size, item.outSize)}</span>`
          : `${formatBytes(item.file.size)} <span class="meta-divider">•</span> Estimated: <strong>${formatEstimate(item.file.size, estimate)}</strong>`
      }</span>
    `

    const right = document.createElement('div')
    right.className = 'file-right'

    if (item.status === 'done' && item.resultUrl) {
      const a = document.createElement('a')
      a.className = 'btn small'
      a.href = item.resultUrl
      a.download = item.outName
      a.textContent = '⬇ Download'
      right.appendChild(a)
    } else {
      const badge = document.createElement('span')
      badge.className = 'badge'
      badge.textContent =
        item.status === 'processing'
          ? item.progress != null
            ? `${Math.round(item.progress * 100)}%`
            : 'processing…'
          : item.status === 'error'
            ? 'error'
            : 'ready'
      right.appendChild(badge)
    }

    li.appendChild(info)
    li.appendChild(right)
    fileListEl.appendChild(li)
  }

  const hasFiles = items.length > 0
  compressBtn.disabled = !hasFiles || running
  clearBtn.disabled = !hasFiles || running
  compressBtn.textContent = running
    ? 'Making videos smaller…'
    : `Make ${hasFiles ? `${items.length} video${items.length === 1 ? '' : 's'}` : 'videos'} smaller`

  if (hasFiles) {
    const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0)
    estimateSummary.hidden = false
    estimateSummary.innerHTML = `
      <div>
        <span class="estimate-label">Estimated total after compression</span>
        <strong>${formatEstimate(totalBytes, estimate)}</strong>
      </div>
      <p>Estimate only — the result depends on your video.</p>
    `
  } else {
    estimateSummary.hidden = true
    estimateSummary.innerHTML = ''
  }
}

// ---- Compression ----
async function compressAll() {
  if (running || items.length === 0) return
  running = true
  render()

  const useHevc = codecSelect.value === 'h265'
  const crf = crfInput.value
  const preset = presetSelect.value
  const audioBitrate = audioSelect.value

  let instance
  try {
    instance = await getFFmpeg(useHevc) // HEVC -> mt core, H.264 -> st core
  } catch (err) {
    console.error(err)
    setStatus(`❌ Failed to load FFmpeg: ${err.message}`, 'error')
    running = false
    render()
    return
  }

  let done = 0
  for (const item of items) {
    if (item.status === 'done') {
      done++
      continue
    }

    item.status = 'processing'
    item.progress = 0
    render()
    setStatus(`Making “${item.file.name}” smaller (${done + 1} of ${items.length})…`)

    const inName = 'input_' + sanitize(item.file.name)
    const outName = makeOutName(item.file.name, useHevc)

    const onProgress = ({ progress }) => {
      item.progress = Math.max(0, Math.min(1, progress))
      render()
    }
    instance.on('progress', onProgress)

    try {
      await instance.writeFile(inName, await fetchFile(item.file))
      await instance.exec(buildArgs({ inName, outName, useHevc, crf, preset, audioBitrate }))

      const data = await instance.readFile(outName)
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      item.resultUrl = URL.createObjectURL(blob)
      item.outName = outName
      item.outSize = blob.size
      item.status = 'done'

      await instance.deleteFile(inName).catch(() => {})
      await instance.deleteFile(outName).catch(() => {})
    } catch (err) {
      console.error(err)
      item.status = 'error'
      setStatus(`❌ Error compressing “${item.file.name}”: ${err.message}`, 'error')
    } finally {
      instance.off('progress', onProgress)
      done++
      render()
    }
  }

  running = false
  render()

  const ok = items.filter((i) => i.status === 'done').length
  const failed = items.filter((i) => i.status === 'error').length
  setStatus(
    `Done — ${ok} video${ok === 1 ? '' : 's'} ready${failed ? `, ${failed} could not be compressed` : ''}.`,
    failed ? 'error' : 'success'
  )
}

// Mirrors the requested command; H.264 swaps the codec/tag but keeps the same
// quality knobs, pixel format, audio, metadata stripping, and adds +faststart.
function buildArgs({ inName, outName, useHevc, crf, preset, audioBitrate }) {
  const video = useHevc
    ? ['-vcodec', 'libx265', '-tag:v', 'hvc1', '-x265-params', `log-level=error`]
    : ['-vcodec', 'libx264', '-threads', '1']
  return [
    '-i', inName,
    ...video,
    '-crf', String(crf),
    '-preset', preset,
    '-pix_fmt', 'yuv420p',
    '-acodec', 'aac',
    '-b:a', audioBitrate,
    '-map_metadata', '-1',
    '-movflags', '+faststart',
    outName
  ]
}

// ---- Helpers ----
function makeOutName(name, useHevc) {
  const dot = name.lastIndexOf('.')
  const stem = dot > 0 ? name.slice(0, dot) : name
  return `${sanitize(stem)}-${useHevc ? 'hevc' : 'h264'}.mp4`
}

function sanitize(name) {
  return name.replace(/[^\w.\-]+/g, '_')
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function savings(before, after) {
  const pct = (1 - after / before) * 100
  return pct >= 0 ? `${pct.toFixed(0)}% smaller` : `${Math.abs(pct).toFixed(0)}% larger`
}

function getEstimateRange() {
  const profile = profiles[selectedProfile]
  const settingsMatchProfile =
    crfInput.value === profile.crf &&
    presetSelect.value === profile.preset &&
    audioSelect.value === profile.audioBitrate &&
    codecSelect.value === 'h264'

  if (settingsMatchProfile) return profile.estimate

  const crf = Number(crfInput.value)
  const codecFactor = codecSelect.value === 'h265' ? 0.78 : 1
  const presetFactors = {
    ultrafast: 1.18,
    veryfast: 1.1,
    fast: 1.04,
    medium: 1,
    slow: 0.96,
    slower: 0.93
  }
  const audioFactors = { '96k': 0.94, '128k': 1, '192k': 1.08, '256k': 1.16 }
  const midpoint =
    0.47 *
    Math.pow(2, (26 - crf) / 8) *
    codecFactor *
    (presetFactors[presetSelect.value] ?? 1) *
    (audioFactors[audioSelect.value] ?? 1)

  return [Math.max(0.1, midpoint * 0.72), Math.min(1.15, midpoint * 1.28)]
}

function formatEstimate(originalBytes, [lowRatio, highRatio]) {
  return `${formatBytes(originalBytes * lowRatio)}–${formatBytes(originalBytes * highRatio)}`
}

function selectProfile(profileName) {
  const profile = profiles[profileName]
  if (!profile || running) return

  selectedProfile = profileName
  crfInput.value = profile.crf
  crfValue.textContent = profile.crf
  presetSelect.value = profile.preset
  audioSelect.value = profile.audioBitrate
  codecSelect.value = 'h264'

  for (const option of sizeOptions) {
    const selected = option.dataset.profile === profileName
    option.classList.toggle('selected', selected)
    option.setAttribute('aria-checked', String(selected))
  }
  render()
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function setStatus(msg, kind = '') {
  statusEl.textContent = msg
  statusEl.className = `status ${kind}`
}

// ---- Events ----
crfInput.addEventListener('input', () => {
  crfValue.textContent = crfInput.value
  render()
})
sizeOptions.forEach((option) =>
  option.addEventListener('click', () => selectProfile(option.dataset.profile))
)
;[codecSelect, presetSelect, audioSelect].forEach((control) =>
  control.addEventListener('change', render)
)

dropzone.addEventListener('click', () => fileInput.click())
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fileInput.click()
  }
})
fileInput.addEventListener('change', () => {
  addFiles(fileInput.files)
  fileInput.value = ''
})

;['dragenter', 'dragover'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault()
    dropzone.classList.add('dragover')
  })
)
;['dragleave', 'drop'].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault()
    if (ev === 'dragleave' && dropzone.contains(e.relatedTarget)) return
    dropzone.classList.remove('dragover')
  })
)
dropzone.addEventListener('drop', (e) => {
  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
})

compressBtn.addEventListener('click', compressAll)
clearBtn.addEventListener('click', () => {
  if (running) return
  items.forEach((i) => i.resultUrl && URL.revokeObjectURL(i.resultUrl))
  items = []
  render()
  setStatus('')
})

initCodecOptions()
render()
