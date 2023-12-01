import { defineUserConfig, defaultTheme } from 'vuepress';
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { searchPlugin } from '@vuepress/plugin-search'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { pwaPlugin } from '@vuepress/plugin-pwa'
import codeCopyPlugin from '@snippetors/vuepress-plugin-code-copy'
import MarkdownItKatex from "markdown-it-katex";

export default defineUserConfig({
    markdown: {toc: {level:[1, 2, 3], shouldAllowNested: true}},
    lang: 'zh-CN',
    title: 'thinking in programming',
    // description: '这是我的第一个 VuePress 站点',
    head:[
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
      ],
    theme: defaultTheme({
        // 默认主题配置
        lang: 'zh-CN',
        logo: 'mlogo.svg',
        repo: 'https://github.com/jycoast',
        navbar: [
          {
              text: 'Java 面试',
              link: '/interview/'
          },
          {
              text: 'Java 基础',
              collapsible: true,
              children: [{
                  text: '函数式编程',
                  link: '/java_basics/functional_programming/'
              },
              {
                  text: 'Java核心技术原理',
                  link: '/java_basics/core_technology/'
              },
              {
                  text: 'Java知识体系合辑',
                  link: '/java_basics/knowledge_system/'
              }]
          },
          {
              text: '数据结构与算法',
              children: [{
                  text: '数据结构',
                  link: '/leetcode/data_structure.md'
              },
              {
                  text: '算法实战',
                  link: '/leetcode/algorithm.md'
              }]
          },
          {
              text: '数据库',
              collapsible: true,
              children: [{
                  text: '关系型数据库',
                  children: [{
                      text: '深入浅出MySQL',
                      link: '/database/mysql/'
                  },
                  ]
              },
              {
                  text: 'NoSQL',
                  children: [{
                      text: '深入浅出Redis',
                      link: '/database/redis/'
                  },
                  ]
              }]
          },
          {
              text: '常用框架',
              children: [{
                  text: 'Spring',
                  children: [{
                      text: 'Spring Framework',
                      link: '/framework/spring_framework/'
                  },
                  {
                      text: 'Spring AOP',
                      link: '/framework/spring_aop/'
                  },
                  {
                      text: 'Spring Boot',
                      link: '/framework/spring_boot/'
                  },
                  {
                      text: 'Spring Cloud',
                      link: '/framework/spring_cloud/'
                  },
                  ]
              },
              {
                  text: '网络通信',
                  children: [{
                      text: '深入理解Netty',
                      link: '/framework/netty/'
                  }]
              }]
          },
          {
              text: '中间件',
              children: [{
                  text: '深入理解JVM',
                  link: '/middleware/jvm/'
              },
              {
                  text: 'RocketMQ从实践到原理',
                  link: '/middleware/mq/'
              },
              {
                  text: 'Tomcat核心原理',
                  link: '/middleware/tomcat/'
              },
              ]
          },
          {
              text: '计算机原理',
              children: [{
                  text: '操作系统',
                  link: '/computer_theory/Os/'
              },
              ]
          },
          {
              text: '学习指南',
              children: [
                {
                    text: '深度好文',
                    link: '/study_guide/favorite_article/'
                },
                {
                    text: '资料大全',
                    link: '/study_guide/study_materials/'
                },
                {
                    text: '学习路线',
                    link: '/study_guide/study_path/'
                },
            ]
          },
          {
            text: '关于我',
            link: '/about/'
          },
        ],
    }),
    extendsMarkdown: (md) => {
      md.use(MarkdownItKatex);
    },
    plugins: [
        backToTopPlugin(),
        searchPlugin({
            // 配置项
          }),
          mediumZoomPlugin({
            // 配置项
          }),
        pwaPlugin({
            
        }),
        codeCopyPlugin()
      ],
});