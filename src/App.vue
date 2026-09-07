<script setup>
import { computed, onMounted } from 'vue'

const params = new URLSearchParams(window.location.search)
const seed = params.get('seed') || 'vue-og-demo'
const title = params.get('title') || 'Vue OG Demo'
const desc =
  params.get('desc') ||
  'Contoh website Vue client-side dengan Open Graph metadata untuk preview di WhatsApp, Twitter, dan platform sosial lainnya.'

const ogImage = computed(() => `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`)

onMounted(() => {
  document.title = title
})
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">Vue + Client-Side OG Demo</p>
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ desc }}</p>

      <img class="preview" :src="ogImage" :alt="`${title} social preview`" width="1200" height="630" />

      <div class="chips" aria-label="Highlights">
        <span>Vue 3</span>
        <span>Static HTML</span>
        <span>Open Graph</span>
      </div>
    </section>
  </main>
</template>
