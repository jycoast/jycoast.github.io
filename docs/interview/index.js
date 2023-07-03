module.exports = () => {
  return [
    {
      title: 'Java 基础',
      collapsable: true,
      children: [
        'java_basics/Java_basics.md',
        'java_basics/Java_collections.md',
        'java_basics/Java_concurrency.md',
        'java_basics/Java_network.md',
        'java_basics/Java_virtual_machine.md'
      ]
    },
    {
      title: '数据库',
      collapsable: true,
      children: [
        'database/Redis.md',
        'database/MySQL.md',
        'database/Elasticsearch.md'
      ]
    },
    {
      title: '常用框架',
      collapsable: true,
      children: [
        'common_framework/Spring.md',
        'common_framework/SpringBoot.md',
        'common_framework/Mybatis.md',
        'common_framework/Netty.md'
      ]
    },
    {
      title: '认证授权',
      collapsable: true,
      children: [
        'auth/cyber_security.md'
      ]
    },
    {
      title: '微服务/分布式',
      collapsable: true,
      children: [
        'distributed/microservice.md',
        'distributed/mq.md'
      ]
    },
  ]
}
