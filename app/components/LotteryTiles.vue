<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Image from 'primevue/image'
import DataView from 'primevue/dataview'
import SelectButton from 'primevue/selectbutton'

interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title?: string
}

const props = defineProps<{ images: GalleryImage[], showLabel?: Boolean }>()

const amount = ref(5)
const randomImages = ref<GalleryImage[]>([])
const dialogVisible = ref(false)
const layout = ref<'list' | 'grid'>('grid')
const options = ref(['list', 'grid'])

const getRandomImages = () => {
  const shuffled = props.images
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  randomImages.value = shuffled.slice(0, amount.value)
  dialogVisible.value = true
}
</script>

<template>
  <Button
    icon="pi pi-sparkles"
    text
    rounded
    :label="showLabel ? 'Get Random Images' : ''"
    size="small"
    title="Display random set of images"
    aria-label="Random image lottery"
    :disabled="images.length === 0"
    @click="getRandomImages()"
  />

  <Dialog v-model:visible="dialogVisible" modal style="width: min(92vw, 1100px)">
    <template #header>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="font-bold">Random Images</span>
        <InputNumber v-model="amount" :min="1" :max="100" showButtons size="small" inputClass="w-12 text-center" />
        <Button severity="secondary" size="small" label="Roll again" icon="pi pi-refresh" @click="getRandomImages()" />
      </div>
    </template>

    <DataView :value="randomImages" :layout="layout" paginator :rows="20">
      <template #header>
        <div class="flex justify-end">
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
        </div>
      </template>

      <template #list="slotProps">
        <div class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
          <div v-for="item in slotProps.items" :key="item.itemImageSrc">
            <div class="flex items-center gap-3 p-3">
              <div class="w-16 h-16 shrink-0 rounded overflow-hidden bg-surface-100 dark:bg-surface-800">
                <Image :src="item.thumbnailImageSrc" :alt="item.alt" class="block w-full h-full" imageClass="w-full h-full object-cover" :pt="{ image: { loading: 'lazy', decoding: 'async' } }" preview />
              </div>
              <span class="text-sm font-medium truncate">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3">
          <div v-for="item in slotProps.items" :key="item.itemImageSrc">
            <div class="aspect-square rounded overflow-hidden bg-surface-100 dark:bg-surface-800">
              <Image :src="item.thumbnailImageSrc" :alt="item.alt" class="block w-full h-full" imageClass="w-full h-full object-cover" preview />
            </div>
            <p class="text-xs text-surface-400 truncate mt-1 px-0.5">{{ item.title }}</p>
          </div>
        </div>
      </template>
    </DataView>

    <template #footer>
      <Button label="Close" text severity="secondary" @click="dialogVisible = false" />
    </template>
  </Dialog>
</template>
