const interview = require('../interview')
const leetcode = require('../leetcode')
// const javaBasics = require('../java_basics')

module.exports = {
  title: '开卷有益',
  description: '蓝领码农',
  base: '/', // gh-page 中是增加了项目名
  dest: 'build/.vuepress/dist',  // 目录配置在外,纯粹是有代码洁癖和强迫症，并不能规避开发模式下同时构建不报错的问题
  host: 'localhost', // dev 的域名
  port: 8080,
  head:[
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
  ],
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    docsDir: 'docs',
    sidebar: 'auto',
    sidebarDepth: 3, // 嵌套标题侧边栏提取深度，最大为 2，会提取到 h3
    lastUpdated: '上次更新', // string | boolean
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'https://github.com/jycoast',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: 'GitHub',
    // 以下为可选的编辑链接选项
    // 假如你的文档仓库和项目本身不在一个仓库：
    // docsRepo: 'vuejs/vuepress',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'docs',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'master',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: 'Edit this page',
    // logo: '/mlogo.svg',
    // 主题级别的配置
    serviceWorker: {
      updatePopup: true // Boolean | Object, 默认值是 undefined.
    },
    nav: [
      { text: 'Java 面试', link: '/interview/' },
      {
        text: 'Java 基础', items: [
          { text: '函数式编程', link: '/java_basics/functional_programming/' },
          { text: 'Java核心技术原理', link: '/java_basics/core_technology/' },
          // { text: 'Java知识体系合辑', link: '/java_basics/knowledge_system/' }
        ]
      },
      {
        text: '数据结构与算法', items: [
          { text: '数据结构', link: '/leetcode/data_structure.md' },
          { text: '算法', link: '/leetcode/algorithm.md' }
        ]
      },
      {
        text: '数据库',
        items: [
          {
            text: '关系型数据库',
            items: [
              { text: 'MySQL', link: '/database/mysql/' },
            ]
          },
          {
            text: 'NoSQL',
            items: [
              { text: '深入浅出Redis', link: '/database/redis/' },
            ]
          }
        ]
      },
      {
        text: '常用框架', 
        items: [
          {
            text: 'Spring', 
            items:[
              { text: 'Spring Framework', link: '/framework/spring_framework/' },
              { text: 'Spring AOP', link: '/framework/spring_aop/' },
              { text: 'Spring Boot', link: '/framework/spring_boot/' },
              { text: 'Spring Cloud', link: '/framework/spring_cloud/' },
          ]
         }, 
          {
            text: '网络通信', 
            items:[
              { text: 'Netty', link: '/framework/netty/' }
          ]
         }
       ]
      },
      {
        text: '中间件', 
        items:[
          {text:'jvm', link: '/middleware/jvm/'},
          {text:'mq', link: '/middleware/mq/'},
          {text:'tomcat', link: '/middleware/tomcat/'},
      ]
    },
      {
        text: '计算机原理',
        items: [
          {text:'操作系统', link: '/computer_theory/Os/'},
        ]
      },
      {text: '深度好文', link: '/favorite_article/'},
    ],
    sidebar: {
      '/interview/': interview(),
      '/leetcode/': leetcode(),
      // '/java_basics/': javaBasics()
    },
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: {
        message: '有新内容更新啦~',
        buttonText: '立即获取新内容，确定后稍后自动刷新'
      }
    }],
    ['@vuepress/medium-zoom', {
      selector: '.theme-default-content img'
    }],
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }],
    ['vuepress-plugin-code-copy', true],
    ['@vuepress/last-updated', {
      transformer: (timestamp, lang) => {
        // 不要忘了安装 moment
        const moment = require('moment')
        // moment.locale(lang)
        // return moment(timestamp).fromNow()
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
      }
    }],
    ['vuepress-plugin-baidu-tongji-analytics', {
      key: '63b757e8938717e95e7218e8e1341393'
    }],
    ['vuepress-plugin-tags'],
    ['vuepress-plugin-baidu-autopush', true]
  ]
}
