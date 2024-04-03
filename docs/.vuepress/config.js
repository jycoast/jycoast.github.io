import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { searchProPlugin } from "vuepress-plugin-search-pro";
import { photoSwipePlugin } from "@vuepress/plugin-photo-swipe";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance";
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'
import { readingTimePlugin } from '@vuepress/plugin-reading-time'

export default defineUserConfig({
  lang: 'zh-CN',
  markdown: {toc: {level:[1, 2, 3], shouldAllowNested: true}},
  title: 'thinking in programming',
  description: 'My first VuePress Site',
  theme: defaultTheme({
    lang: 'zh-CN',
    logo: 'mlogo.svg',
    repo: 'https://github.com/jycoast',
    navbar: [
    {
        text: 'Java 面试',
        collapsible: false,
        children: [{
            text: 'Java基础',
            children: [{
                text: 'Java语言',
                link: '/interview/java_basics/Java_basic'
            },
            {
                text: 'Java集合与IO',
                link: '/interview/java_basics/Java_collections'
            },
            {
                text: 'Java并发编程',
                link: '/interview/java_basics/Java_concurrency'
            },
            {
                text: 'Java网络编程',
                link: '/interview/java_basics/Java_network'
            },
            {
                text: 'Java虚拟机',
                link: '/interview/java_basics/Java_virtual_machine'
            },
            {
                text: 'Java网络安全',
                link: '/interview/auth/cyber_security'
            }]
        },
        {
            text: '数据库',
            children: [{
                text: 'MySQL',
                link: '/interview/database/MySQL'
            },
            {
                text: 'Redis',
                link: '/interview/database/Redis'
            },
            {
                text: 'ElaticSearch',
                link: '/interview/database/Elasticsearch'
            }],
        },
        {
            text: '常用框架',
            children: [{
                text: 'Spring',
                link: '/interview/common_framework/Spring'
            },
            {
                text: 'SpringBoot',
                link: '/interview/common_framework/SpringBoot'
            },
            {
                text: 'Mybatis',
                link: '/interview/common_framework/Mybatis'
            },
            {
                text: 'Netty',
                link: '/interview/common_framework/Netty'
            }]
        },
        {
            text: '分布式',
            children: [{
                text: '微服务',
                link: '/interview/distributed/microservice'
            },
            {
                text: '消息队列',
                link: '/interview/distributed/mq'
            }]
        },
        {
            text: '系统架构',
            children: [{
                text: '设计模式',
                link: '/interview/architecture/design_pattern'
            }]
        },
        {
            text: '部署运维',
            children: [{
                text: 'Docker',
                link: '/interview/operations_maintenance/Docker'
            },
            {
                text: 'Linux',
                link: '/interview/operations_maintenance/Linux'
            },
            {
                text: 'Nginx',
                link: '/interview/operations_maintenance/Nginx'
            }],
        }]
    },
    {
        text: 'Java 基础',
        collapsible: true,
        children: [{
            text: 'JavaSE',
            children: [{
                text: 'Java函数式编程',
                link: '/java_basics/functional_programming/'
            },
            {
                text: 'Java集合与IO',
                link: '/java_basics/core_technology/'
            },
            {
                text: 'Java并发编程',
                link: '/java_basics/concurrent_programming/'
            },
            ]
        },
        {
            text: 'JavaEE',
            children: [{
                text: 'JNDI',
                link: '/java_basics/jndi/'
            },
            {
                text: 'JMX',
                link: '/java_basics/jmx/'
            },
            {
                text: 'RMi',
                link: '/java_basics/rmi/'
            },
            {
                text: 'JMS',
                link: '/java_basics/jms/'
            },
            {
                text: 'EJB',
                link: '/java_basics/ejb/'
            }],
        },
        {
            text: 'Java性能与监控',
            children: [{
                text: 'Java日志',
                link: '/java_basics/log/'
            },
            {
                text: 'Java监控',
                link: '/java_basics/monitoring/'
            }]
        }]
    },
    {
        text: '数据结构与算法',
        children: [{
            text: '数据结构',
            link: '/leetcode/data_structure.md'
        },
        {
            text: '常用算法',
            link: '/leetcode/algorithm.md'
        },
        {
            text: '算法刷题',
            link: '/leetcode/leetcode.md'
        },
        ]
    },
    {
        text: '数据库',
        collapsible: true,
        children: [{
            text: '关系型数据库',
            children: [{
                text: 'MySQL基础',
                link: '/database/mysql/'
            },
            {
                text: 'MySQL性能优化',
                link: '/database/mysql_perfomance/'
            },
            ]
        },
        {
            text: 'NoSQL',
            children: [{
                text: 'Redis',
                link: '/database/redis/'
            },
            {
                text: 'ElaticSearch',
                link: '/database/elatic_search/'
            },
            {
                text: 'MongoDB',
                link: '/database/mongodb/'
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
            text: 'Dubbo',
            children: [{
                text: 'Dubbo',
                link: '/framework/dubbo/'
            }]
        },
        {
            text: '网络通信',
            children: [{
                text: 'Netty',
                link: '/framework/netty/'
            }]
        },
        {
            text: 'Orm',
            children: [{
                text: 'Mybatis',
                link: '/framework/mybatis/'
            },
            ]
        },
        ]
    },
    {
        text: '中间件',
        children: [{
            text: 'Java虚拟机',
            link: '/middleware/jvm/'
        },
        {
            text: 'RocketMQ',
            link: '/middleware/mq/'
        },
        {
            text: 'Tomcat',
            link: '/middleware/Tomcat/'
        },
        {
            text: 'Zookeeper',
            link: '/middleware/zookeeper/'
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
        children: [{
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

  bundler: viteBundler(),
  plugins: [
    searchProPlugin({
      queryHistoryCount: 0,
    }),
    googleAnalyticsPlugin({
        id: 'G-6QKG0ZYM99',
    }),
    mdEnhancePlugin({
      // 使用 KaTeX 启用 TeX 支持
      katex: true,
      // 使用 mathjax 启用 TeX 支持
      mathjax: true,
      // 启用 Markmap
      markmap: true,
    }),
    // 这个插件有问题，所以让它对所有的元素都不生效
    mediumZoomPlugin({
        // 配置项
        selector: null
      }),
    photoSwipePlugin(),
    readingTimePlugin({
        // 配置项
      }),
  ],
})