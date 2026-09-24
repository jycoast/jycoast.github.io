// Turn a shell page plus a manifest of fragment files into one composed page.
//
// A page opts in by adding a scalar frontmatter key pointing at a manifest:
//
//   ---
//   title: Java 并发
//   series: ./series.mjs
//   ---
//
//   <!-- series -->
//
// The manifest lists the fragments grouped under page-level sections:
//
//   export default {
//     dir: 'parts',                       // optional, defaults to 'parts'
//     parts: [
//       { title: '基础篇', articles: ['monitor', 'cpu-cache'] },
//     ],
//   }
//
// Each fragment is a normal markdown file carrying its own `title:` frontmatter;
// that title becomes the article heading on the composed page.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/
const PLACEHOLDER = '<!-- series -->'
const DEFAULT_PART_DIR = 'parts'
const ARTICLE_HEADING_LEVEL = 3 // H1 is the section, H2 the article, so fragments start at H3
const MAX_HEADING_LEVEL = 4 // the left outline renders levels 1-4

/** Read the flat `key: value` frontmatter block. Nested values are not supported. */
export function parseFrontmatter(source) {
  const match = source.match(FRONTMATTER_RE)
  if (!match) return {}

  const result = {}
  for (const line of match[1].split(/\r?\n/)) {
    const entry = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!entry) continue
    result[entry[1]] = entry[2].trim().replace(/^("|')(.*)\1$/, '$2')
  }
  return result
}

/** Split a markdown file into frontmatter text, parsed frontmatter and body. */
function splitSource(source) {
  const match = source.match(FRONTMATTER_RE)
  if (!match) return { frontmatterText: '', frontmatter: {}, body: source }
  return {
    frontmatterText: match[0].trimEnd(),
    frontmatter: parseFrontmatter(source),
    body: source.slice(match[0].length),
  }
}

function walkMarkdown(dir, result = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, result)
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(full)
  }
  return result
}

// Manifests are plain data modules; cache by path + mtime so edits are picked up
// without leaking a module instance on every transform.
const manifestCache = new Map()

async function loadManifest(manifestPath) {
  const mtime = fs.statSync(manifestPath).mtimeMs
  const cached = manifestCache.get(manifestPath)
  if (cached && cached.mtime === mtime) return cached.value

  const imported = await import(pathToFileURL(manifestPath).href)
  const value = imported.default ?? imported
  if (!Array.isArray(value.parts)) {
    throw new Error(`${manifestPath}: manifest must export { parts: [...] }`)
  }
  manifestCache.set(manifestPath, { mtime, value })
  return value
}

function normalizeManifest(value) {
  const dir = value.dir ?? DEFAULT_PART_DIR
  const parts = value.parts.map((part, index) => {
    if (!part?.title || !Array.isArray(part.articles)) {
      throw new Error(`parts[${index}] must be { title, articles: [...] }`)
    }
    return { title: part.title, articles: part.articles }
  })
  return { dir, parts }
}

/** Resolve the fragments referenced by a manifest, in order. */
function resolveFragments(chapterDir, manifest) {
  const fragmentDir = path.resolve(chapterDir, manifest.dir)
  const fragments = []
  for (const part of manifest.parts) {
    for (const name of part.articles) {
      const file = path.resolve(fragmentDir, `${name}.md`)
      if (!fs.existsSync(file)) {
        throw new Error(`series fragment not found: ${file} (referenced as "${name}")`)
      }
      fragments.push(file)
    }
  }
  return { fragmentDir, fragments }
}

function shiftHeadings(body) {
  const lines = body.split('\n')
  const levels = []
  let inFence = false
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(/^(#{1,6})\s/)
    if (match) levels.push(match[1].length)
  }
  const shift = levels.length ? ARTICLE_HEADING_LEVEL - Math.min(...levels) : 0

  inFence = false
  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      const match = line.match(/^(#{1,6})(\s+.*)$/)
      if (!match) return line
      return '#'.repeat(Math.min(match[1].length + shift, MAX_HEADING_LEVEL)) + match[2]
    })
    .join('\n')
}

/** Fragment body: drop its frontmatter and the leading H1 (the manifest supplies the title). */
function fragmentBody(absFile) {
  const { body } = splitSource(fs.readFileSync(absFile, 'utf8'))
  const lines = body.trim().split('\n')
  const first = lines.findIndex((line) => line.trim())
  if (/^#\s+/.test(lines[first] ?? '')) {
    lines.splice(first, 1)
    while (lines[first] !== undefined && !lines[first].trim()) lines.splice(first, 1)
  }
  return shiftHeadings(lines.join('\n').trim())
}

/**
 * Compose the page for a shell file.
 * Returns undefined when the page declares no `series` manifest.
 */
export async function composeSeries(source, absShellFile) {
  const { frontmatter, body } = splitSource(source)
  const pointer = frontmatter.series
  if (!pointer) return undefined

  const chapterDir = path.dirname(absShellFile)
  const manifestPath = path.resolve(chapterDir, pointer)
  const manifest = normalizeManifest(await loadManifest(manifestPath))
  const { fragments } = resolveFragments(chapterDir, manifest)

  const chunks = []
  let cursor = 0
  for (const part of manifest.parts) {
    chunks.push(`# ${part.title}`)
    for (const name of part.articles) {
      const absFile = fragments[cursor++]
      const { frontmatter: meta } = splitSource(fs.readFileSync(absFile, 'utf8'))
      const title = meta.title || path.basename(absFile, '.md')
      chunks.push(`## ${title}`)
      chunks.push(fragmentBody(absFile))
    }
  }

  if (!body.includes(PLACEHOLDER)) {
    throw new Error(`${absShellFile}: series page is missing the ${PLACEHOLDER} placeholder`)
  }
  const composed = body.replace(PLACEHOLDER, `\n${chunks.join('\n\n')}\n`)
  const frontmatterText = source.match(FRONTMATTER_RE)?.[0] ?? ''

  return { code: `${frontmatterText}${composed}`, fragments, manifestPath }
}

/**
 * Find every series in the docs tree.
 * A chapter is any directory containing a `series.mjs` manifest.
 */
export async function discoverSeries(docsRoot) {
  const manifests = collectManifests(docsRoot)

  const chapters = []
  for (const manifestPath of [...new Set(manifests)]) {
    const manifest = normalizeManifest(await loadManifest(manifestPath))
    const chapterDir = path.dirname(manifestPath)
    const { fragmentDir, fragments } = resolveFragments(chapterDir, manifest)
    chapters.push({
      manifestPath,
      chapterDir,
      fragmentDir,
      fragments,
      referenced: new Set(fragments.map((file) => path.resolve(file))),
    })
  }

  return {
    chapters,
    fragmentDirs: new Set(chapters.map((chapter) => chapter.fragmentDir)),
    fragmentFiles: new Set(chapters.flatMap((chapter) => [...chapter.referenced])),
  }
}

/** `series.mjs` is never markdown, so walk it separately. */
function collectManifests(dir, result = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return result
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collectManifests(full, result)
    else if (entry.isFile() && entry.name === 'series.mjs') result.push(full)
  }
  return result
}

/** True when a markdown file lives in a series fragment directory. */
export function isFragmentDir(fragmentDirs, file) {
  const resolved = path.resolve(file)
  for (const dir of fragmentDirs) {
    if (resolved === dir || resolved.startsWith(dir + path.sep)) return true
  }
  return false
}
