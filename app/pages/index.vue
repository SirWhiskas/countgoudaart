<script setup lang="ts">
useHead({ title: 'Count Gouda — Fantasy Figure Drawing' })
</script>

<template>
  <section class="relative h-screen w-full overflow-hidden">

    <!-- Hero image — replace src with your first piece -->
    <div class="absolute inset-0">
      <img
        :src="'/art/hero.JPEG'"
        alt="Hero artwork by Count Gouda"
        class="w-full h-full object-cover object-center"
      />
      <!-- Dark vignette so text reads over any image -->
      <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
    </div>

    <!-- Hero text -->
    <div class="absolute bottom-0 left-0 right-0 px-8 pb-16 md:px-16 md:pb-20">
      <p class="font-body text-ink-300 italic text-lg mb-3 tracking-wide">
        Charcoal &amp; Newsprint
      </p>
      <h1 class="font-display text-5xl md:text-7xl text-white tracking-widest uppercase leading-none mb-6">
        Count<br />Gouda
      </h1>
      <NuxtLink
        to="/gallery"
        class="inline-block font-display text-xs tracking-[0.3em] uppercase border border-ink-400 text-ink-200 px-6 py-3 hover:border-white hover:text-white transition-colors duration-300"
      >
        View Work
      </NuxtLink>
    </div>

  </section>
</template>
