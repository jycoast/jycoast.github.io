import fs from 'node:fs'
import path from 'node:path'
import { discoverSeries, isFragmentDir } from '../docs/.vitepress/series.mjs'

const repoRoot = process.cwd()
const docsRoot = path.join(repoRoot, 'docs')
const distRoot = path.join(docsRoot, '.vitepress', 'dist')
const siteUrl = 'https://jiyc.kdns.fr'

function collectMarkdown(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === '.vuepress' || entry.name.startsWith('.')) continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectMarkdown(fullPath, result)
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(fullPath)
  }
  return result
}

function routeFor(filePath) {
  const relative = path.relative(docsRoot, filePath).split(path.sep).join('/')
  if (relative === 'index.md') return '/'
  if (relative.endsWith('/index.md')) return `/${relative.slice(0, -'index.md'.length)}`
  return `/${relative.slice(0, -'.md'.length)}.html`
}

function htmlPathFor(route) {
  const relative = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}${route.endsWith('/') ? 'index.html' : ''}`
  return path.join(distRoot, relative)
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
}

function singleMatch(html, expression, label, file) {
  const matches = [...html.matchAll(expression)]
  if (matches.length !== 1) {
    throw new Error(`${file}: expected exactly one ${label}, found ${matches.length}`)
  }
  return matches[0]
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const series = await discoverSeries(docsRoot)
const files = collectMarkdown(docsRoot).filter((file) => !isFragmentDir(series.fragmentDirs, file))
const routes = files.map(routeFor)
const routeSet = new Set(routes)
assert(routes.length === routeSet.size, 'Duplicate Markdown routes detected')
const seenTitles = new Map()
const seenDescriptions = new Map()

for (const route of routes) {
  const outputPath = htmlPathFor(route)
  assert(fs.existsSync(outputPath), `${route}: missing generated page ${path.relative(repoRoot, outputPath)}`)
  const file = path.relative(repoRoot, outputPath).split(path.sep).join('/')
  const html = fs.readFileSync(outputPath, 'utf8')
  const title = singleMatch(html, /<title>([^<]*)<\/title>/g, '<title>', file)[1].trim()
  const description = singleMatch(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/g, 'description', file)[1].trim()
  const canonical = singleMatch(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/g, 'canonical', file)[1]
  assert(title, `${file}: title is empty`)
  assert(title !== 'thinking in programming', `${file}: generic site title remains`)
  assert(description, `${file}: description is empty`)
  assert(description !== 'A VitePress site', `${file}: default VitePress description remains`)
  assert(canonical === new URL(route, `${siteUrl}/`).toString(), `${file}: canonical ${canonical} does not match ${route}`)
  assert(!/noindex/i.test(html), `${file}: noindex directive prevents indexing`)
  seenTitles.set(title, [...(seenTitles.get(title) ?? []), route])
  seenDescriptions.set(description, [...(seenDescriptions.get(description) ?? []), route])
}

const sitemapPath = path.join(distRoot, 'sitemap.xml')
assert(fs.existsSync(sitemapPath), 'Missing generated sitemap.xml')
const sitemap = fs.readFileSync(sitemapPath, 'utf8')
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]))
const expectedUrls = routes.map((route) => new URL(route, `${siteUrl}/`).toString())
assert(sitemapUrls.length === expectedUrls.length, `Sitemap contains ${sitemapUrls.length} URLs; expected ${expectedUrls.length}`)
assert(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate URLs')
for (const url of expectedUrls) {
  assert(sitemapUrls.includes(url), `Sitemap is missing ${url}`)
}
for (const url of sitemapUrls) {
  assert(url.startsWith(`${siteUrl}/`) || url === siteUrl, `Sitemap contains URL outside ${siteUrl}: ${url}`)
  assert(!/404/i.test(url), `Sitemap contains a 404 URL: ${url}`)
}

const robotsPath = path.join(distRoot, 'robots.txt')
assert(fs.existsSync(robotsPath), 'Missing generated robots.txt')
const robots = fs.readFileSync(robotsPath, 'utf8')
assert(/User-agent:\s*\*/i.test(robots), 'robots.txt has no wildcard user-agent')
assert(/Allow:\s*\//i.test(robots), 'robots.txt does not allow crawling')
assert(robots.includes(`${siteUrl}/sitemap.xml`), 'robots.txt does not reference the sitemap')

console.log(`SEO audit passed: ${routes.length} Markdown routes, ${sitemapUrls.length} sitemap URLs`)
