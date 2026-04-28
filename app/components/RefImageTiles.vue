<script setup lang="ts">
import { ref, computed } from 'vue'
import Image from 'primevue/image'
import DataView from 'primevue/dataview'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title?: string
}

defineProps<{ images: GalleryImage[] }>()
const emit = defineEmits(['quickWarmUp'])

const layout = ref<'list' | 'grid'>('grid')
const options = ref(['list', 'grid'])
const pageNumberOverride = ref(0)
const numberOfDisplayRows = ref(12)

const preDefinedPage = computed(() => {
  const offset = pageNumberOverride.value - 1
  if (offset <= 0) return 0
  return offset * numberOfDisplayRows.value
})
</script>

<template>
  <DataView :value="images" :layout="layout" paginator :rows="numberOfDisplayRows" :first="preDefinedPage">
    <template #header>
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1">
            <span class="text-sm text-surface-400">Per page:</span>
            <InputNumber v-model="numberOfDisplayRows" :min="1" :max="100" size="small" inputClass="w-14 text-sm text-center" />
          </div>
          <div class="flex items-center gap-1">
            <span class="text-sm text-surface-400">Jump to page:</span>
            <InputNumber v-model="pageNumberOverride" :min="0" size="small" inputClass="w-14 text-sm text-center" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button icon="pi pi-stopwatch" label="Quick Warm-up" size="small" severity="secondary" @click="emit('quickWarmUp')" />
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
        </div>
      </div>
    </template>

    <template #list="slotProps">
      <div class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
        <div v-for="item in slotProps.items" :key="item.itemImageSrc">
          <div class="flex items-center gap-3 p-3">
            <div class="w-16 h-16 shrink-0 rounded overflow-hidden bg-surface-100 dark:bg-surface-800">
              <Image :src="item.thumbnailImageSrc" :alt="item.alt" class="block w-full h-full" imageClass="w-full h-full object-cover" :pt="{ image: { loading: 'eager', decoding: 'async' } }" preview />
            </div>
            <span class="text-sm font-medium truncate">{{ item.title }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #grid="slotProps">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 p-3">
        <div v-for="item in slotProps.items" :key="item.itemImageSrc">
          <div class="aspect-square rounded overflow-hidden bg-surface-100 dark:bg-surface-800">
            <Image :src="item.thumbnailImageSrc" :alt="item.alt" class="block w-full h-full" imageClass="w-full h-full object-cover" :pt="{ image: { loading: 'eager', decoding: 'async' } }" preview />
          </div>
          <p class="text-xs text-surface-400 truncate mt-1 px-0.5">{{ item.title }}</p>
        </div>
      </div>
    </template>
  </DataView>
</template>
