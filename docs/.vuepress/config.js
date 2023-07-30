import { defineUserConfig, defaultTheme } from 'vuepress';
import { backToTopPlugin } from '@vuepress/plugin-back-to-top'
import { searchPlugin } from '@vuepress/plugin-search'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { pwaPlugin } from '@vuepress/plugin-pwa'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '开卷有益',
    // description: '这是我的第一个 VuePress 站点',
    head:[
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
      ],
    theme: defaultTheme({
        // 默认主题配置
        lang: 'zh-CN',
        // logo: 'mlogo.svg',
        repo: 'https://github.com/jycoast',
        navbar: [
            { text: 'Java 面试', link: '/interview/' },
            {
              text: 'Java 基础', 
              collapsible: true,
              children: [
                { text: '函数式编程', link: '/java_basics/functional_programming/' },
                { text: 'Java核心技术原理', link: '/java_basics/core_technology/' },
                { text: 'Java知识体系合辑', link: '/java_basics/knowledge_system/' }
              ]
            },
            {
              text: '数据结构与算法', children: [
                { text: '数据结构', link: '/leetcode/data_structure.md' },
                { text: '算法', link: '/leetcode/algorithm.md' }
              ]
            },
            {
              text: '数据库',
              collapsible: true,
              children: [
                {
                  text: '关系型数据库',
                  children: [
                    { text: 'MySQL', link: '/database/mysql/' },
                  ]
                },
                {
                  text: 'NoSQL',
                  children: [
                    { text: '深入浅出Redis', link: '/database/redis/' },
                  ]
                }
              ]
            },
            {
              text: '常用框架', 
              children: [
                {
                  text: 'Spring', 
                  children:[
                    { text: 'Spring Framework', link: '/framework/spring_framework/' },
                    { text: 'Spring AOP', link: '/framework/spring_aop/' },
                    { text: 'Spring Boot', link: '/framework/spring_boot/' },
                    { text: 'Spring Cloud', link: '/framework/spring_cloud/' },
                ]
               }, 
                {
                  text: '网络通信', 
                  children:[
                    { text: 'Netty', link: '/framework/netty/' }
                ]
               }
             ]
            },
            {
              text: '中间件', 
              children:[
                {text:'jvm', link: '/middleware/jvm/'},
                {text:'mq', link: '/middleware/mq/'},
                {text:'tomcat', link: '/middleware/tomcat/'},
            ]
          },
            {
              text: '计算机原理',
              children: [
                {text:'操作系统', link: '/computer_theory/Os/'},
              ]
            },
            {text: '深度好文', link: '/favorite_article/'},
          ],
    }),
    plugins: [
        backToTopPlugin(),
        searchPlugin({
            // 配置项
          }),
          mediumZoomPlugin({
            // 配置项
          }),
        pwaPlugin({
            
        })
      ],
});