import { defineConfig } from 'vitepress'
import { topNav } from './theme/book-sidebar'

export default defineConfig({
  lang: 'zh-CN',
  title: 'thinking in programming',
  cleanUrls: false,
  markdown: {
    math: true,
    lineNumbers: true,
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
