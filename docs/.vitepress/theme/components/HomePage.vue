<script setup lang="ts">
import { withBase } from 'vitepress'
import { bookSidebar, type BookItem } from '../book-sidebar'

function isExternal(link?: string) {
  return Boolean(link && /^(https?:|mailto:)/.test(link))
}

function countPages(items: BookItem[]): number {
  return items.reduce((count, item) => {
    const own = item.link && !isExternal(item.link) ? 1 : 0
    return count + own + (item.children ? countPages(item.children) : 0)
  }, 0)
}

const domainCount = bookSidebar.filter((item) => item.id !== 'about').length
const documentCount = countPages(bookSidebar)
</script>

<template>
  <div class="custom-home">
    <section class="home-hero">
      <div class="home-hero__copy">
        <h1>thinking in programming</h1>
        <div class="home-hero__actions">
          <a class="home-button home-button--primary" :href="withBase('/study_guide/study_path/')">
            从学习路线开始 <span>→</span>
          </a>
          <a class="home-button home-button--secondary" :href="withBase('/interview/')">
            进入 Java 面试
          </a>
        </div>
        <div class="home-hero__meta">
          <span><strong>{{ domainCount }}</strong> 个知识领域</span>
          <span><strong>{{ documentCount }}</strong> 篇技术文档</span>
          <span>持续整理中</span>
        </div>
      </div>

      <div class="home-hero__visual" aria-hidden="true">
        <div class="home-orbit home-orbit--outer"></div>
        <div class="home-orbit home-orbit--inner"></div>
        <div class="home-hero__logo"><img src="/mlogo.svg" alt="" /></div>
        <div class="home-float home-float--java">语言基础</div>
        <div class="home-float home-float--spring">应用框架</div>
        <div class="home-float home-float--redis">数据存储</div>
        <div class="home-float home-float--jvm">系统原理</div>
      </div>
    </section>
  </div>
</template>
