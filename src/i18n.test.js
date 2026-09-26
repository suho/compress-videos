import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { languages, messages } from './i18n.js'

const enKeys = Object.keys(messages.en).sort()

describe('i18n', () => {
  it.each(languages)('%s has the same keys as en', (lang) => {
    expect(Object.keys(messages[lang]).sort()).toEqual(enKeys)
  })

  it('has a message for every key used in index.html and main.js', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    const js = readFileSync(new URL('./main.js', import.meta.url), 'utf8')
    const used = [
      ...html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g),
      ...js.matchAll(/\bt\('([^']+)'/g),
      ...js.matchAll(/(?:setStatus\(|dataset\.i18n = )'([^']+)'/g)
    ].map((m) => m[1])
    expect(used.length).toBeGreaterThan(0)
    expect(used.filter((key) => !(key in messages.en))).toEqual([])
  })
})
