import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const docsRoot = path.join(repoRoot, 'docs')
const navigationSource = fs.readFileSync(
  path.join(docsRoot, '.vitepress', 'theme', 'book-sidebar.ts'),
  'utf8',
)

function routeFor(filePath) {
  const relative = path.relative(docsRoot, filePath).split(path.sep).join('/')
  if (relative === 'index.md') return '/'
  if (relative.endsWith('/index.md')) return `/${relative.slice(0, -'index.md'.length)}`
  return `/${relative.slice(0, -'.md'.length)}.html`
}

function collectMarkdown(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === '.vuepress' || entry.name.startsWith('.')) continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectMarkdown(fullPath, result)
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(fullPath)
  }
  return result
}

function normalizeLink(link) {
  return link.split('#')[0].split('?')[0]
}

const files = collectMarkdown(docsRoot)
const routes = files.map(routeFor)
const duplicateRoutes = routes.filter((route, index) => routes.indexOf(route) !== index)
const localLinks = [...navigationSource.matchAll(/\blink:\s*['"]([^'"]+)['"]/g)]
  .map((match) => normalizeLink(match[1]))
  .filter((link) => link.startsWith('/'))

const routeSet = new Set(routes)
const linkCounts = new Map()
for (const link of localLinks) linkCounts.set(link, (linkCounts.get(link) ?? 0) + 1)

const utilityRoutes = new Set(['/all/'])
const orphanRoutes = routes.filter((route) => !utilityRoutes.has(route) && !linkCounts.has(route))
const brokenLinks = [...new Set(localLinks.filter((link) => !routeSet.has(link)))]
const duplicateLinks = [...linkCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([link, count]) => `${link} (${count})`)

const required = ['/framework/spring_aop/']
const missingRequired = required.filter((route) => !linkCounts.has(route))

console.log(`Navigation audit: ${routes.length} markdown routes, ${localLinks.length} local navigation links`)
console.log(`Orphan routes: ${orphanRoutes.length}`)
console.log(`Broken local links: ${brokenLinks.length}`)
console.log(`Duplicate navigation links: ${duplicateLinks.length}`)

if (orphanRoutes.length) {
  console.error('\nOrphan routes:')
  orphanRoutes.forEach((route) => console.error(`- ${route}`))
}
if (brokenLinks.length) {
  console.error('\nBroken local links:')
  brokenLinks.forEach((link) => console.error(`- ${link}`))
}
if (duplicateLinks.length) {
  console.error('\nDuplicate navigation links:')
  duplicateLinks.forEach((link) => console.error(`- ${link}`))
}
if (missingRequired.length) {
  console.error('\nMissing required routes:')
  missingRequired.forEach((route) => console.error(`- ${route}`))
}
if (duplicateRoutes.length) {
  console.error('\nDuplicate routes:')
  ;[...new Set(duplicateRoutes)].forEach((route) => console.error(`- ${route}`))
}

if (orphanRoutes.length || brokenLinks.length || duplicateLinks.length || missingRequired.length || duplicateRoutes.length) {
  process.exitCode = 1
}
