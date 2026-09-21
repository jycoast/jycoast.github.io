import fs from 'node:fs'
import path from 'node:path'
import type { HeadConfig, PageData } from 'vitepress'

export const SITE_URL = 'https://jycoder.club'
export const SITE_TITLE = 'thinking in programming'
export const SITE_DESCRIPTION = '面向 Java、数据库、常用框架与计算机基础的中文技术知识库。'

const MAX_DESCRIPTION_LENGTH = 160

interface SeoPageData {
  relativePath?: string
  frontmatter?: Record<string, unknown>
  isNotFound?: boolean
}

interface SourceInfo {
  frontmatter: Record<string, unknown>
  body: string
}

export interface SeoMetadata {
  title: string
  description: string
  route: string
  url: string
}

export function routeFromRelativePath(relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/')
  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) return `/${normalized.slice(0, -'index.md'.length)}`
  if (normalized.endsWith('.md')) return `/${normalized.slice(0, -'.md'.length)}.html`
  return `/${normalized}`
}

export function canonicalUrl(route: string): string {
  return new URL(route, `${SITE_URL}/`).toString()
}

function parseFrontmatter(value: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of value.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!match) continue
    const rawValue = match[2].trim()
    result[match[1]] = rawValue.replace(/^("|')(.*)\1$/, '$2')
  }
  return result
}

function readSource(srcDir: string, relativePath: string): SourceInfo {
  const sourcePath = path.join(srcDir, relativePath)
  const source = fs.readFileSync(sourcePath, 'utf8')
  const frontmatterMatch = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/)
  const body = frontmatterMatch ? source.slice(frontmatterMatch[0].length) : source

  return {
    frontmatter: frontmatterMatch ? parseFrontmatter(frontmatterMatch[1]) : {},
    body,
  }
}

function stripMarkdown(value: string): string {
  return value
    .replace(/<!--(?:.|\n|\r)*?-->/g, ' ')
    .replace(/<script(?:.|\n|\r)*?<\/script>/gi, ' ')
    .replace(/<style(?:.|\n|\r)*?<\/style>/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function shorten(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (Array.from(normalized).length <= MAX_DESCRIPTION_LENGTH) return normalized
  return `${Array.from(normalized).slice(0, MAX_DESCRIPTION_LENGTH - 1).join('')}…`
}

function firstHeading(body: string): string | undefined {
  const heading = body.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/m)
  if (!heading) return undefined
  const value = stripMarkdown(heading[1])
  return value || undefined
}

function firstParagraph(body: string): string | undefined {
  const lines = body.split(/\r?\n/)
  let paragraph: string[] = []
  let inFence = false

  const flush = () => {
    const value = stripMarkdown(paragraph.join(' '))
    paragraph = []
    return value
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      paragraph = []
      continue
    }
    if (inFence || /^\s*<!--/.test(line) || /^\s*</.test(line)) {
      paragraph = []
      continue
    }
    if (!line.trim()) {
      const value = flush()
      if (value) return value
      continue
    }
    if (/^\s{0,3}#{1,6}\s+/.test(line)) {
      const value = flush()
      if (value) return value
      continue
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const value = flush()
      if (value) return value
      continue
    }
    paragraph.push(line)
  }

  return flush() || undefined
}

function fileTitle(relativePath: string): string {
  const basename = path.posix.basename(relativePath, '.md')
  const withoutIndex = basename === 'index'
    ? path.posix.basename(path.posix.dirname(relativePath))
    : basename
  return withoutIndex === '.'
    ? SITE_TITLE
    : withoutIndex.replace(/[-_]+/g, ' ').trim() || SITE_TITLE
}

function sourceForPage(pageData: SeoPageData, srcDir: string): SourceInfo {
  if (!pageData.relativePath) return { frontmatter: {}, body: '' }
  try {
    return readSource(srcDir, pageData.relativePath)
  } catch {
    return { frontmatter: pageData.frontmatter ?? {}, body: '' }
  }
}

export function resolveSeoMetadata(pageData: SeoPageData, srcDir: string): SeoMetadata | undefined {
  if (!pageData.relativePath || pageData.isNotFound) return undefined

  const source = sourceForPage(pageData, srcDir)
  const frontmatter = { ...source.frontmatter, ...(pageData.frontmatter ?? {}) }
  const route = routeFromRelativePath(pageData.relativePath)
  const title = typeof frontmatter.title === 'string' && frontmatter.title.trim()
    ? frontmatter.title.trim()
    : firstHeading(source.body) ?? fileTitle(pageData.relativePath)
  const paragraph = firstParagraph(source.body)
  const description = typeof frontmatter.description === 'string' && frontmatter.description.trim()
    ? shorten(frontmatter.description)
    : shorten(paragraph ? `${title}：${paragraph}` : `${title}：${SITE_DESCRIPTION}`)

  return {
    title,
    description: description || SITE_DESCRIPTION,
    route,
    url: canonicalUrl(route),
  }
}

export function seoHead(metadata: SeoMetadata, renderedTitle: string): HeadConfig[] {
  const pageType = metadata.route === '/' ? 'website' : 'article'
  return [
    ['meta', { name: 'description', content: metadata.description }],
    ['link', { rel: 'canonical', href: metadata.url }],
    ['meta', { property: 'og:type', content: pageType }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:title', content: renderedTitle || metadata.title }],
    ['meta', { property: 'og:description', content: metadata.description }],
    ['meta', { property: 'og:url', content: metadata.url }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: renderedTitle || metadata.title }],
    ['meta', { name: 'twitter:description', content: metadata.description }],
    ['meta', { name: 'twitter:url', content: metadata.url }],
  ]
}

export function pageMetadata(pageData: PageData, srcDir: string) {
  return resolveSeoMetadata(pageData, srcDir)
}
