import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { pageMetadata, seoHead, SITE_DESCRIPTION, SITE_URL } from './seo'
import { composeSeries, discoverSeries } from './series.mjs'
import { topNav } from './theme/book-sidebar'

const docsRoot = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.dirname(docsRoot)

const series = await discoverSeries(srcDir)
const fragmentDirPatterns = [...series.fragmentDirs]
  .map((dir) => `${path.relative(srcDir, dir).split(path.sep).join('/')}/**`)
  .sort()

export default defineConfig({
  lang: 'zh-CN',
  title: 'thinking in programming',
  description: SITE_DESCRIPTION,
  cleanUrls: false,
  // Fragment files are composed into their shell page, never published on their own.
  srcExclude: fragmentDirPatterns,
  sitemap: {
    hostname: SITE_URL,
    transformItems: (items) => items.filter((item) => !item.url.endsWith('/404.html')),
  },
  vite: {
    plugins: [
      {
        name: 'vitepress-series',
        // Must run before VitePress turns markdown into a Vue module.
        enforce: 'pre',
        async transform(code, id) {
          const [file] = id.split('?')
          if (!file.endsWith('.md')) return
          const composed = await composeSeries(code, file)
          if (!composed) return
          for (const fragment of composed.fragments) this.addWatchFile(fragment)
          this.addWatchFile(composed.manifestPath)
          return { code: composed.code, map: null }
        },
      },
    ],
  },
  transformPageData: (pageData, { siteConfig }) => {
    const metadata = pageMetadata(pageData, siteConfig.srcDir)
    return metadata
      ? { title: metadata.title, description: metadata.description }
      : undefined
  },
  transformHead: ({ pageData, siteConfig, title }) => {
    const metadata = pageMetadata(pageData, siteConfig.srcDir)
    return metadata ? seoHead(metadata, title) : []
  },
  markdown: {
    math: true,
    lineNumbers: false,
    image: {
      lazyLoading: true,
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-6QKG0ZYM99',
      },
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-6QKG0ZYM99', { send_page_view: false });`,
    ],
  ],
  themeConfig: {
    logo: '/mlogo.svg',
    nav: topNav,
    sidebar: false,
    aside: 'left',
    sidebarMenuLabel: '文章目录',
    returnToTopLabel: '返回顶部',
    search: {
      provider: 'local',
    },
    outline: {
      level: [1, 4],
      label: '文章目录',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jycoast' },
    ],
    footer: {
      copyright: 'Copyright © 2020-present 吉永超',
    },
  },
})
