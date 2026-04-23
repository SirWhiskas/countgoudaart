<script setup lang="ts">
const links = [
  { label: 'Work', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Studio', to: '/gesture-timer' },
]
</script>

<template>
  <div class="h-dvh relative overflow-hidden bg-ink-950">
    <!-- Header floats over the image -->
    <header class="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-5 bg-ink-800/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
      <NuxtLink to="/" class="font-display text-sm tracking-[0.25em] uppercase text-ink-50 md:text-ink-950 md:font-semibold hover:text-white md:hover:text-ink-700 transition-colors">
        <span class="md:hidden">CG</span>
        <span class="hidden md:inline">Count Gouda</span>
      </NuxtLink>
      <nav class="flex items-center gap-4 md:gap-8">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="font-display text-xs tracking-[0.2em] uppercase text-ink-100 md:text-ink-950 md:font-semibold hover:text-white md:hover:text-ink-700 transition-colors"
          active-class="text-white md:text-ink-950"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="h-full">
      <slot />
    </main>
  </div>
</template>
