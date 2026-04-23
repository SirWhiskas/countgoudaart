<script setup lang="ts">
const links = [
  { label: 'Work', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Studio', to: '/gesture-timer' },
]
</script>

<template>
  <div class="h-dvh flex flex-col overflow-hidden">
    <header class="sticky top-0 z-50 shrink-0 flex items-center justify-between px-4 md:px-8 py-5 sm:bg-ink-800 lg:bg-transparent">
      <NuxtLink to="/" class="font-display text-sm tracking-[0.25em] uppercase text-ink-50 hover:text-white transition-colors">
        <span class="md:hidden">CG</span>
        <span class="hidden md:inline">Count Gouda</span>
      </NuxtLink>
      <nav class="flex items-center gap-4 md:gap-8">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="font-display text-xs tracking-[0.2em] uppercase text-ink-200 hover:text-white transition-colors"
          active-class="text-white"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="flex-1 overflow-y-auto min-h-0">
      <slot />
    </main>

    <footer class="shrink-0 px-8 py-6 text-center">
      <p class="font-body text-sm text-ink-600 italic">
        &copy; {{ new Date().getFullYear() }} Count Gouda. All rights reserved.
      </p>
    </footer>
  </div>
</template>
