// UI strings per language. A value is a string with {param} placeholders, or a
// function of params when the wording depends on a number (plurals).
export const messages = {
  en: {
    'meta.title': 'Make Videos Smaller — private & in your browser',
    'meta.description':
      'Make video files smaller with three simple choices. Everything happens privately in your browser.',
    'lang.label': 'Language',
    'hero.title': 'Make your videos smaller',
    'hero.tagline': 'Choose how small you want them. Your videos stay on this device and are never uploaded.',
    'size.heading': 'Choose a size',
    'size.hint': 'Not sure? Balanced works well for most videos.',
    'size.groupLabel': 'Compression size',
    'size.recommended': 'Recommended',
    'size.estimate': 'About {low}–{high}% of original',
    'profile.quality.title': 'Better quality',
    'profile.quality.desc': 'Keep more detail',
    'profile.balanced.title': 'Balanced',
    'profile.balanced.desc': 'Good quality, much smaller',
    'profile.smallest.title': 'Smallest file',
    'profile.smallest.desc': 'Best for quick sharing',
    'advanced.title': 'Advanced settings',
    'advanced.optional': 'Optional',
    'codec.label': 'Video format',
    'codec.hint': 'H.264 works on the most devices',
    'codec.h264': 'H.264 (recommended)',
    'codec.h265': 'H.265 / HEVC',
    'codec.h265FirefoxOnly': 'H.265 / HEVC — Firefox only',
    'codec.noteDisabled':
      'H.265/HEVC is disabled: a known ffmpeg.wasm bug hangs it in Chrome/Safari. It works in Firefox, or use H.264 here.',
    'codec.noteFirefox':
      'H.265/HEVC produces smaller files but encodes slowly in-browser. H.264 is faster and universally compatible.',
    'crf.label': 'Video quality',
    'crf.hint': 'Lower is clearer; higher is smaller',
    'preset.label': 'Compression speed',
    'preset.hint': 'Slower can produce a slightly smaller file',
    'preset.ultrafast': 'Fastest',
    'preset.veryfast': 'Very fast',
    'preset.fast': 'Fast',
    'preset.medium': 'Standard',
    'preset.slow': 'Smaller file',
    'preset.slower': 'Smallest file',
    'audio.label': 'Sound quality',
    'audio.hint': 'Higher uses more space',
    'audio.96k': 'Standard',
    'audio.128k': 'Good',
    'audio.192k': 'High',
    'audio.256k': 'Very high',
    'files.heading': 'Add your videos',
    'files.hint': 'Choose one or several files.',
    'dropzone.label': 'Choose or drop video files',
    'dropzone.title': 'Choose videos',
    'dropzone.hint': 'or drag and drop them here',
    'estimate.total': 'Estimated total after compression',
    'estimate.note': 'Estimate only — the result depends on your video.',
    'estimate.file': 'Estimated:',
    'savings.smaller': '{pct}% smaller',
    'savings.larger': '{pct}% larger',
    'savings.same': 'about the same size',
    'file.download': '⬇ Download',
    'file.processing': 'processing…',
    'file.error': 'error',
    'file.ready': 'ready',
    'action.compress': 'Make videos smaller',
    'action.compressCount': ({ n }) => `Make ${n} video${n === 1 ? '' : 's'} smaller`,
    'action.compressing': 'Making videos smaller…',
    'action.clear': 'Clear list',
    'status.loading': 'Getting the compressor ready…',
    'status.loadFailed': '❌ Failed to load FFmpeg: {error}',
    'status.processing': 'Making “{name}” smaller ({index} of {total})…',
    'status.fileError': '❌ Error compressing “{name}”: {error}',
    'status.done': ({ ok, failed }) =>
      `Done — ${ok} video${ok === 1 ? '' : 's'} ready${failed ? `, ${failed} could not be compressed` : ''}.`,
    'footer.title': 'Private by design.',
    'footer.body': 'Your videos never leave this device.'
  },
  vi: {
    'meta.title': 'Giảm dung lượng video - riêng tư, ngay trong trình duyệt',
    'meta.description':
      'Giảm dung lượng video chỉ với ba lựa chọn đơn giản. Mọi thứ diễn ra riêng tư ngay trong trình duyệt của bạn.',
    'lang.label': 'Ngôn ngữ',
    'hero.title': 'Giảm dung lượng video',
    'hero.tagline': 'Chọn mức nén bạn muốn. Video luôn nằm trên thiết bị này và không bao giờ được tải lên.',
    'size.heading': 'Chọn kích thước',
    'size.hint': 'Chưa chắc? Mức Cân bằng phù hợp với hầu hết video.',
    'size.groupLabel': 'Mức nén',
    'size.recommended': 'Khuyên dùng',
    'size.estimate': 'Khoảng {low}–{high}% so với bản gốc',
    'profile.quality.title': 'Chất lượng cao',
    'profile.quality.desc': 'Giữ nhiều chi tiết hơn',
    'profile.balanced.title': 'Cân bằng',
    'profile.balanced.desc': 'Chất lượng tốt, nhỏ hơn nhiều',
    'profile.smallest.title': 'Nhỏ nhất',
    'profile.smallest.desc': 'Phù hợp để chia sẻ nhanh',
    'advanced.title': 'Cài đặt nâng cao',
    'advanced.optional': 'Không bắt buộc',
    'codec.label': 'Định dạng video',
    'codec.hint': 'H.264 phát được trên nhiều thiết bị nhất',
    'codec.h264': 'H.264 (khuyên dùng)',
    'codec.h265': 'H.265 / HEVC',
    'codec.h265FirefoxOnly': 'H.265 / HEVC - chỉ trên Firefox',
    'codec.noteDisabled':
      'H.265/HEVC đang tắt: một lỗi đã biết của ffmpeg.wasm làm treo trình duyệt trên Chrome/Safari. Định dạng này chạy được trên Firefox, hoặc bạn có thể dùng H.264 tại đây.',
    'codec.noteFirefox':
      'H.265/HEVC cho tệp nhỏ hơn nhưng mã hóa chậm trong trình duyệt. H.264 nhanh hơn và tương thích với mọi thiết bị.',
    'crf.label': 'Chất lượng video',
    'crf.hint': 'Thấp hơn thì nét hơn; cao hơn thì nhỏ hơn',
    'preset.label': 'Tốc độ nén',
    'preset.hint': 'Chậm hơn có thể cho tệp nhỏ hơn một chút',
    'preset.ultrafast': 'Nhanh nhất',
    'preset.veryfast': 'Rất nhanh',
    'preset.fast': 'Nhanh',
    'preset.medium': 'Tiêu chuẩn',
    'preset.slow': 'Tệp nhỏ hơn',
    'preset.slower': 'Tệp nhỏ nhất',
    'audio.label': 'Chất lượng âm thanh',
    'audio.hint': 'Cao hơn thì tốn dung lượng hơn',
    'audio.96k': 'Tiêu chuẩn',
    'audio.128k': 'Tốt',
    'audio.192k': 'Cao',
    'audio.256k': 'Rất cao',
    'files.heading': 'Thêm video',
    'files.hint': 'Chọn một hoặc nhiều tệp.',
    'dropzone.label': 'Chọn hoặc thả tệp video',
    'dropzone.title': 'Chọn video',
    'dropzone.hint': 'hoặc kéo và thả vào đây',
    'estimate.total': 'Tổng dung lượng ước tính sau khi nén',
    'estimate.note': 'Chỉ là ước tính - tùy vào từng video.',
    'estimate.file': 'Ước tính:',
    'savings.smaller': 'nhỏ hơn {pct}%',
    'savings.larger': 'lớn hơn {pct}%',
    'savings.same': 'gần như không đổi',
    'file.download': '⬇ Tải xuống',
    'file.processing': 'đang xử lý…',
    'file.error': 'lỗi',
    'file.ready': 'sẵn sàng',
    'action.compress': 'Giảm dung lượng video',
    'action.compressCount': ({ n }) => `Giảm dung lượng ${n} video`,
    'action.compressing': 'Đang giảm dung lượng video…',
    'action.clear': 'Xóa danh sách',
    'status.loading': 'Đang chuẩn bị công cụ nén…',
    'status.loadFailed': '❌ Không tải được FFmpeg: {error}',
    'status.processing': 'Đang giảm dung lượng “{name}” ({index}/{total})…',
    'status.fileError': '❌ Lỗi khi nén “{name}”: {error}',
    'status.done': ({ ok, failed }) =>
      `Xong - ${ok} video đã sẵn sàng${failed ? `, ${failed} video không nén được` : ''}.`,
    'footer.title': 'Riêng tư tuyệt đối.',
    'footer.body': 'Video của bạn không bao giờ rời khỏi thiết bị này.'
  }
}

export const languages = Object.keys(messages)
const STORAGE_KEY = 'lang'
const DEFAULT_LANG = 'vi'
const listeners = new Set()
let lang = detectLang()

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (languages.includes(saved)) return saved
  } catch {}
  return DEFAULT_LANG
}

export function getLang() {
  return lang
}

export function setLang(next) {
  if (!languages.includes(next) || next === lang) return
  lang = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {}
  listeners.forEach((fn) => fn(lang))
}

export function onLangChange(fn) {
  listeners.add(fn)
}

export function t(key, params = {}) {
  const msg = messages[lang][key] ?? messages.en[key] ?? key
  if (typeof msg === 'function') return msg(params)
  return msg.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

export function formatNumber(value, fractionDigits = 0) {
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)
}

// Fills static markup: data-i18n sets text, data-i18n-aria-label sets aria-label.
export function applyTranslations(root = document) {
  document.documentElement.lang = lang
  document.title = t('meta.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n)
  })
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel))
  })
}
