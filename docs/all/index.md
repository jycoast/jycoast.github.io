<script setup lang="ts">
import AllDocsTree from '../.vitepress/theme/components/AllDocsTree.vue'
import { bookSidebar } from '../.vitepress/theme/book-sidebar'
</script>

# 全部文档

这里汇总站点中的全部文章。顶部分类菜单提供常用入口，本页用于查找完整文档树。

<AllDocsTree :items="bookSidebar" />
