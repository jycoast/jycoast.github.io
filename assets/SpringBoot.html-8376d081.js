import{_ as r,r as t,o as n,c as a,b as e,d as i,e as l,f as s}from"./app-4972449e.js";const d={},p=s('<h1 id="springboot面试题" tabindex="-1"><a class="header-anchor" href="#springboot面试题" aria-hidden="true">#</a> SpringBoot面试题</h1><h2 id="为什么springboot的-jar可以直接运行" tabindex="-1"><a class="header-anchor" href="#为什么springboot的-jar可以直接运行" aria-hidden="true">#</a> 为什么SpringBoot的 jar可以直接运行？</h2><p>https://blog.fundebug.com/2019/01/09/how-does-springboot-start/</p><h2 id="springboot自动装配过程及实现原理" tabindex="-1"><a class="header-anchor" href="#springboot自动装配过程及实现原理" aria-hidden="true">#</a> SpringBoot自动装配过程及实现原理？</h2><h2 id="springboot如何防止表单重复提交" tabindex="-1"><a class="header-anchor" href="#springboot如何防止表单重复提交" aria-hidden="true">#</a> SpringBoot如何防止表单重复提交？</h2><div class="note info"><p>幂等性，通俗的说就是一个接口，多次发起同一个请求，必须保证操作只能执行一次。</p></div><p>需要幂等性的场景：</p><ul><li>订单接口，不能多次创建订单</li><li>支付接口，重复支付同一笔订单只能扣一次钱</li><li>支付宝回调接口，可能会多次回调，必须处理重复回调</li><li>普通表单提交接口，因为网络超时、卡顿等原因多次点击提交，只能成功一次等等</li></ul><p>常见的方案：</p><ul><li><p>从数据库方面考虑，数据设计的时候，如果有唯一性，考虑建立唯一索引</p></li><li><p>从应用层面考虑，首先判断是单机服务还是分布式服务</p><ul><li>单机服务：考虑一些缓存Cache，利用缓存，来保证数据的重复提交</li><li>分布式服务：考虑将用户的信息，例如token和请求的url进行组装在一起形成令牌，存储到缓存中，例如redis，并设置超时时间为**秒，如此来保证数据的唯一性（利用了redis的分布式锁）</li></ul></li></ul><p>解决方案大致总结如下：</p><ul><li>唯一索引：防止新增脏数据</li><li>token机制：防止页面重复提交，实现接口的幂等性校验</li><li>分布式锁：redis（jredis、redisson）或zookeeper实现</li><li>悲观锁：获取数据的时候加锁（锁表或锁行）</li><li>乐观锁：基于版本号version实现，在更新数据那一刻校验数据</li><li>状态机：状态变更，更新数据时判断状态</li></ul>',12),c={href:"https://blog.csdn.net/ITBigGod/article/details/105510980",target:"_blank",rel:"noopener noreferrer"};function h(g,u){const o=t("ExternalLinkIcon");return n(),a("div",null,[p,e("p",null,[i("其中，前三种最为常见，更多内容可以参考："),e("a",c,[i("SpringBoot/Web项目防止表单/请求重复提交（单体和分布式）"),l(o)])])])}const _=r(d,[["render",h],["__file","SpringBoot.html.vue"]]);export{_ as default};
