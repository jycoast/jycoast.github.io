import fs from 'node:fs'
import path from 'node:path'

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

const pages = walk(docsRoot)
  .map((file) => {
    const source = fs.readFileSync(file, 'utf8')
    return {
      file: path.relative(process.cwd(), file).split(path.sep).join('/'),
      bytes: Buffer.byteLength(source),
      lines: source.split(/\r?\n/).length,
      images: (source.match(/!\[[^\]]*\]\([^)]*\)|<img\b/gi) ?? []).length,
      codeBlocks: Math.floor((source.match(/^```/gm) ?? []).length / 2),
    }
  })
  .sort((a, b) => b.bytes - a.bytes)

console.log(`Document performance audit: ${pages.length} markdown files`)
for (const page of pages.slice(0, 10)) {
  console.log(`${page.file}\t${Math.round(page.bytes / 1024)}KB\t${page.lines} lines\t${page.images} images\t${page.codeBlocks} code blocks`)
}

const oversized = pages.filter((page) => page.bytes > thresholdBytes)
console.log(`Oversized documents > ${thresholdBytes / 1024}KB: ${oversized.length}`)
