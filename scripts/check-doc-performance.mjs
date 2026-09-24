import fs from 'node:fs'
import path from 'node:path'
import { discoverSeries, isFragmentDir } from '../docs/.vitepress/series.mjs'

const docsRoot = path.join(process.cwd(), 'docs')
const thresholdBytes = 300 * 1024

function walk(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(fullPath, result)
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(fullPath)
  }
  return result
}

// Series fragments render inside their shell page, so they are judged as one unit.
const series = await discoverSeries(docsRoot)
const fragmentsByDir = new Map()
for (const chapter of series.chapters) {
  fragmentsByDir.set(chapter.fragmentDir, chapter.fragments)
}

const pages = walk(docsRoot)
  .filter((file) => !isFragmentDir(series.fragmentDirs, file))
  .map((file) => {
    const source = fs.readFileSync(file, 'utf8')
    // A series shell page renders its fragments too, so count them together.
    const chapter = series.chapters.find(
      (item) => path.resolve(file).startsWith(item.chapterDir + path.sep),
    )
    const fragmentSources = chapter
      ? chapter.fragments.map((fragment) => fs.readFileSync(fragment, 'utf8'))
      : []
    const combined = [source, ...fragmentSources].join('\n')
    return {
      file: path.relative(process.cwd(), file).split(path.sep).join('/'),
      bytes: Buffer.byteLength(combined),
      lines: combined.split(/\r?\n/).length,
      images: (combined.match(/!\[[^\]]*\]\([^)]*\)|<img\b/gi) ?? []).length,
      codeBlocks: Math.floor((combined.match(/^```/gm) ?? []).length / 2),
    }
  })
  .sort((a, b) => b.bytes - a.bytes)

console.log(`Document performance audit: ${pages.length} markdown files (series shell pages include their fragments)`)
for (const page of pages.slice(0, 10)) {
  console.log(`${page.file}\t${Math.round(page.bytes / 1024)}KB\t${page.lines} lines\t${page.images} images\t${page.codeBlocks} code blocks`)
}

const oversized = pages.filter((page) => page.bytes > thresholdBytes)
console.log(`Oversized documents > ${thresholdBytes / 1024}KB: ${oversized.length}`)
