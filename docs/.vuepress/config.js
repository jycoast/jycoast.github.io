const themeConfig = require('./config/theme/')

module.exports = {
  title: null,
  description: "行则将至.",
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  themeConfig:{
    valineConfig: {
      appId: '7v2GG0irxq6tRIjc7CqxYSeA-gzGzoHsz',
      appKey: 'DJrwLzOHvrHDmo9x8pGfbIOw',
    },
    type: 'blog',
    startYear: '2020',
    author: '吉永超',
    blogConfig: {
      category: {
        location: 2,     // 在导航栏菜单中所占的位置，默认2
        text: '分类' // 默认文案 “分类”
      },
      tag: {
        location: 3,     // 在导航栏菜单中所占的位置，默认3
        text: '标签'      // 默认文案 “标签”
      }
    },
    friendLink: [
      {
        title: '简书',
        desc: '不是前端的后端不是好全栈',
        logo: "jianshu.jpg",
        link: 'https://www.jianshu.com/u/8f5d90376485'
      },
      {
        title: '掘金',
        desc: '不是前端的后端不是好全栈',
        logo: '/juejin.jpg',
        link: 'https://juejin.im/user/1345457965251991'
      }],
      nav: [
        { text: '首页', link: '/', icon: 'reco-home' },
        { text: '时间轴', link: '/timeline/', icon: 'reco-date' },
        { text: '关于我', link: '/views/personalInfo/', icon: 'reco-account'}
      ],
      authorAvatar: '/avatar.jpg'
  },
  markdown: {
    lineNumbers: true
  },
  plugins: ['@vuepress/medium-zoom', 'flowchart',['vuepress-plugin-code-copy', true]] 
}  