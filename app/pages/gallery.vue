<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({ title: 'Work — Count Gouda' })

interface ArtPiece {
  imgTitle: string
  imgSrc: string
  artTitle: string
  artDimensions: { height: number | null; width: number | null }
  artMedium: string
  artDescription: string
  categories?: string[]
}

const { data: pieces } = useFetch<ArtPiece[]>('/data/gallery.json', {
  server: false,
  default: () => [],
})

const selected = ref<ArtPiece | null>(null)
const enlarged = ref(false)
const activeCategory = ref<string | null>(null)

const allCategories = computed(() => {
  const set = new Set<string>()
  for (const p of pieces.value ?? []) {
    for (const c of (p.categories ?? [])) set.add(c)
  }
  return [...set].sort()
})

const filteredPieces = computed(() => {
  if (!activeCategory.value) return pieces.value ?? []
  return (pieces.value ?? []).filter((p: ArtPiece) => p.categories?.includes(activeCategory.value!))
})

const dimensionLabel = (piece: ArtPiece) => {
  const { width, height } = piece.artDimensions
  if (width && height) return `${width} × ${height} in`
  if (width) return `${width} in wide`
  if (height) return `${height} in tall`
  return null
}

const closeModal = () => { enlarged.value = false; selected.value = null }
const closeEnlarged = () => { enlarged.value = false }

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') enlarged.value ? closeEnlarged() : closeModal()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="pt-12 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-10">
      <h2 class="font-display text-xs tracking-[0.35em] uppercase text-ink-400">Work</h2>
      <a
        href="https://fineartamerica.com/profiles/count-gouda/shop"
        target="_blank"
        rel="noopener noreferrer"
        class="font-display text-xs tracking-[0.3em] uppercase border border-ink-700 text-ink-500 px-4 py-2 hover:border-ink-400 hover:text-ink-300 transition-colors duration-300"
      >
        Shop Prints
      </a>
    </div>

    <!-- Category filter -->
    <div v-if="allCategories.length > 0" class="flex flex-wrap gap-2 mb-12">
      <button
        class="font-display text-xs tracking-[0.2em] uppercase px-4 py-1.5 border transition-colors duration-200"
        :class="activeCategory === null
          ? 'border-ink-100 text-ink-100'
          : 'border-ink-700 text-ink-500 hover:border-ink-400 hover:text-ink-300'"
        @click="activeCategory = null"
      >All</button>
      <button
        v-for="cat in allCategories"
        :key="cat"
        class="font-display text-xs tracking-[0.2em] uppercase px-4 py-1.5 border transition-colors duration-200"
        :class="activeCategory === cat
          ? 'border-ink-100 text-ink-100'
          : 'border-ink-700 text-ink-500 hover:border-ink-400 hover:text-ink-300'"
        @click="activeCategory = cat"
      >{{ cat }}</button>
    </div>

    <!-- Empty state -->
    <div v-if="!pieces?.length" class="flex flex-col items-center justify-center py-40 gap-4 text-ink-600">
      <p class="font-body italic text-xl">Images coming soon.</p>
    </div>

    <!-- No matches for active filter -->
    <div v-else-if="filteredPieces.length === 0" class="flex flex-col items-center justify-center py-40 gap-4 text-ink-600">
      <p class="font-body italic text-xl">No pieces in this category yet.</p>
    </div>

    <!-- Masonry gallery -->
    <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      <div
        v-for="piece in filteredPieces"
        :key="piece.imgSrc"
        class="break-inside-avoid group relative overflow-hidden cursor-pointer"
        @click="selected = piece"
      >
        <img
          :src="piece.imgSrc"
          :alt="piece.imgTitle"
          class="w-full block grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
          decoding="async"
        />
        <div class="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/40 transition-colors duration-300" />
        <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-ink-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p v-if="piece.artTitle" class="font-display text-xs tracking-widest uppercase text-ink-100">
            {{ piece.artTitle }}
          </p>
          <p v-if="dimensionLabel(piece)" class="font-body text-xs text-ink-400 mt-0.5">
            {{ dimensionLabel(piece) }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="selected"
        class="fixed inset-0 z-50 bg-ink-950/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        @click.self="closeModal"
      >
        <div class="relative bg-ink-900 border border-ink-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2">

          <!-- Close button -->
          <button
            class="absolute top-4 right-4 z-10 text-ink-500 hover:text-ink-100 transition-colors"
            aria-label="Close"
            @click="closeModal"
          >
            <i class="pi pi-times text-lg" />
          </button>

          <!-- Image -->
          <div
            class="bg-ink-950 flex items-center justify-center relative group/img cursor-zoom-in"
            @click="enlarged = true"
          >
            <img
              :src="selected.imgSrc"
              :alt="selected.imgTitle"
              class="w-full object-contain max-h-[60vh] md:max-h-[90vh]"
            />
            <div class="absolute bottom-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
              <span class="bg-ink-950/70 text-ink-300 rounded px-2 py-1 text-xs font-display tracking-widest uppercase">
                <i class="pi pi-search-plus mr-1" />Enlarge
              </span>
            </div>
          </div>

          <!-- Metadata -->
          <div class="p-8 flex flex-col gap-5">
            <div>
              <p class="font-display text-xs tracking-[0.3em] uppercase text-ink-500 mb-2">Work</p>
              <h2 class="font-display text-2xl tracking-wide text-white uppercase leading-tight">
                {{ selected.artTitle || selected.imgTitle || '—' }}
              </h2>
            </div>

            <div v-if="dimensionLabel(selected) || selected.artMedium" class="flex flex-col gap-1 border-t border-ink-800 pt-4">
              <p v-if="selected.artMedium" class="font-body text-sm text-ink-300">
                {{ selected.artMedium }}
              </p>
              <p v-if="dimensionLabel(selected)" class="font-body text-sm text-ink-500">
                {{ dimensionLabel(selected) }}
              </p>
            </div>

            <div
              v-if="selected.artDescription"
              class="border-t border-ink-800 pt-4 prose-ink"
              v-html="selected.artDescription"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Enlarged lightbox -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="enlarged && selected"
        class="fixed inset-0 z-[60] bg-ink-950/95 flex items-center justify-center cursor-zoom-out"
        @click="closeEnlarged"
      >
        <img
          :src="selected.imgSrc"
          :alt="selected.imgTitle"
          class="max-w-full max-h-full object-contain select-none"
          style="width: 95vw; height: 95vh;"
          @click.stop
        />
        <button
          class="absolute top-4 right-4 text-ink-500 hover:text-ink-100 transition-colors"
          aria-label="Close enlarged view"
          @click="closeEnlarged"
        >
          <i class="pi pi-times text-xl" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
