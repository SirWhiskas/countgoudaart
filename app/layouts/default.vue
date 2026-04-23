<script setup lang="ts">
const links = [
  { label: 'Work', to: '/gallery' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 mix-blend-difference">
      <NuxtLink to="/" class="font-display text-sm tracking-[0.25em] uppercase text-ink-50 hover:text-white transition-colors">
        Count Gouda
      </NuxtLink>
      <nav class="flex items-center gap-8">
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

    <main class="flex-1">
      <slot />
    </main>

    <footer class="px-8 py-6 text-center">
      <p class="font-body text-sm text-ink-600 italic">
        &copy; {{ new Date().getFullYear() }} Count Gouda. All rights reserved.
      </p>
    </footer>
  </div>
</template>
