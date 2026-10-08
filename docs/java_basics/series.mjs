// 本清单决定页面的分类与篇目顺序，顺序即渲染顺序。
// 每篇文章对应 parts/<name>.md，标题取自该文件 frontmatter 的 title。
// 本组不设分组标题，且 articleLevel 设为 1：七篇文章的标题与「Java EE 总览」
// 同为页面的一级标题，文章内部的章节依次降为二、三级标题。
export default {
  dir: 'parts',
  articleLevel: 1,
  parts: [
    { articles: ['servlet', 'jsp', 'jndi', 'jmx', 'rmi', 'jms', 'ejb'] },
  ],
}
