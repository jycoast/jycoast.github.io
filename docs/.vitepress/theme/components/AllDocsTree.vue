<script setup lang="ts">
import type { BookItem } from '../book-sidebar'

defineProps<{
  items: BookItem[]
}>()

function isExternal(link?: string) {
  return Boolean(link && /^(https?:|mailto:)/.test(link))
}
</script>

<template>
  <ul class="all-docs-tree">
    <li v-for="item in items" :key="item.id">
      <a
        v-if="item.link"
        :href="item.link"
        :target="isExternal(item.link) ? '_blank' : undefined"
        :rel="isExternal(item.link) ? 'noreferrer' : undefined"
      >
        {{ item.text }}
      </a>
      <span v-else>{{ item.text }}</span>
      <AllDocsTree v-if="item.children?.length" :items="item.children" />
    </li>
  </ul>
</template>
