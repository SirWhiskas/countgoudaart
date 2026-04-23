<script setup lang="ts">
useHead({ title: 'Work — Count Gouda' })

// Drop your images into /public/art/ and list them here.
// Each entry: { src, alt, title (optional) }
const pieces = [
  // { src: '/art/piece-01.jpg', alt: 'Figure study in charcoal', title: 'Untitled I' },
]
</script>

<template>
  <div class="pt-28 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
    <h2 class="font-display text-xs tracking-[0.35em] uppercase text-ink-400 mb-16">Work</h2>

    <!-- Empty state while you add images -->
    <div v-if="pieces.length === 0" class="flex flex-col items-center justify-center py-40 gap-4 text-ink-600">
      <p class="font-body italic text-xl">Images coming soon.</p>
    </div>

    <!-- Masonry-style gallery -->
    <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      <div
        v-for="piece in pieces"
        :key="piece.src"
        class="break-inside-avoid group relative overflow-hidden"
      >
        <img
          :src="piece.src"
          :alt="piece.alt"
          class="w-full block grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
          decoding="async"
        />
        <div
          v-if="piece.title"
          class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-ink-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <p class="font-display text-xs tracking-widest uppercase text-ink-100">{{ piece.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
