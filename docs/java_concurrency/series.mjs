// 本清单决定页面的分类与篇目顺序，顺序即渲染顺序。
// 每篇文章对应 parts/<name>.md，标题取自该文件 frontmatter 的 title。
export default {
  dir: 'parts',
  parts: [
    { title: '基础篇', articles: ['monitor', 'cpu-cache', 'cas'] },
    { title: '核心篇', articles: ['overview', 'thread-safe-question', 'thread-safe-answer', 'jmm', 'happens-before', 'notify', 'synchronized', 'mesa-synchronized', 'lock', 'aqs', 'nature'] },
    { title: '实战篇', articles: ['juc', 'blocking-queue', 'thread-pool', 'distributed-lock'] },
    { title: '番外篇', articles: ['mysql-concurrency', 'redis-concurrency'] },
  ],
}
