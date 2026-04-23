<script setup lang="ts">
import { ref, watch } from 'vue'
import Galleria from 'primevue/galleria'

interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title?: string
}

const props = defineProps<{ imageGallery: GalleryImage[] }>()
const emit = defineEmits(['onGalleryEnd'])

const displayGalleryFull = ref(false)
const responsiveOptions = ref([
  { breakpoint: '1500px', numVisible: 5 },
  { breakpoint: '1024px', numVisible: 3 },
  { breakpoint: '768px', numVisible: 2 },
  { breakpoint: '560px', numVisible: 1 },
])
const activeIndex = ref(0)

const showGallery = () => { displayGalleryFull.value = true }
const hideGallery = () => { activeIndex.value = 0; displayGalleryFull.value = false }
const goToNextImage = () => {
  activeIndex.value = activeIndex.value === props.imageGallery.length - 1
    ? props.imageGallery.length - 1
    : activeIndex.value + 1
}

watch(activeIndex, (newIndex) => {
  if (newIndex === props.imageGallery.length - 1) emit('onGalleryEnd')
})

defineExpose({ showGallery, hideGallery, goToNextImage })
</script>

<template>
  <Galleria
    v-model:active-index="activeIndex"
    v-model:visible="displayGalleryFull"
    :value="imageGallery"
    :responsiveOptions="responsiveOptions"
    :fullScreen="true"
    :numVisible="5"
    :circular="true"
    containerStyle="max-width: 99%; max-height: 99vh;"
    :showItemNavigators="true"
    :showThumbnails="false"
  >
    <template #item="slotProps">
      <img
        :src="slotProps.item.itemImageSrc"
        :alt="slotProps.item.alt"
        style="max-width: 100%; max-height: 95vh; object-fit: contain; display: block; margin: auto;"
      />
    </template>
    <template #thumbnail="slotProps">
      <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" style="display: block;" />
    </template>
  </Galleria>
</template>
