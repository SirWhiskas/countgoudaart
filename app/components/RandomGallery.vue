<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Image from 'primevue/image'
import DataView from 'primevue/dataview'
import SelectButton from 'primevue/selectbutton'
import { useToast } from 'primevue/usetoast'
import { useServerConfig } from '~/composables/useServerConfig'
import type { GalleryImage } from '~/utils/gestureTimerUtils'

defineProps<{ showLabel?: boolean }>()

const toast = useToast()
const { serverUrl } = useServerConfig()
const isServerConnected = ref(false)

onMounted(() => {
  isServerConnected.value = !!serverUrl.value
})

watch(serverUrl, (value) => {
  isServerConnected.value = !!value
})

const amount = ref(5)
const randomImages = ref<GalleryImage[]>([])
const dialogVisible = ref(false)
const loading = ref(false)
const layout = ref<'list' | 'grid'>('grid')
const options = ref(['list', 'grid'])

const openDialog = () => {
  dialogVisible.value = true
}

const fetchRandomGallery = async () => {
  loading.value = true
  try {
    const paths = await useGetRandomGallery(amount.value)
    randomImages.value = paths.images.map((path) => ({
      itemImageSrc: useGetImagePath(`/${path}`),
      thumbnailImageSrc: useGetImagePath(`/${path}`),
      alt: path,
      title: path.split('/').pop() ?? path,
    }))
  } catch (err: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Could not load random gallery',
      detail: err instanceof Error ? err.message : String(err),
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Button
    icon="pi pi-images"
    text
    rounded
    :label="showLabel ? 'Random Gallery' : ''"
    size="small"
    :fluid="showLabel"
    title="Fetch a random gallery from the server"
    aria-label="Random server gallery"
    :disabled="!isServerConnected"
    @click="openDialog"
  />

  <Dialog v-model:visible="dialogVisible" modal style="width: min(92vw, 1100px)">
    <template #header>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="font-bold">Random Gallery</span>
        <InputNumber v-model="amount" :min="1" :max="200" showButtons size="small" inputClass="w-20 text-center" />
        <Button
          severity="secondary"
          size="small"
          :label="randomImages.length > 0 ? 'Roll again' : 'Get Images'"
          icon="pi pi-refresh"
          :loading="loading"
          @click="fetchRandomGallery()"
        />
      </div>
    </template>

    <div v-if="randomImages.length === 0 && !loading" class="flex flex-col items-center justify-center gap-3 py-12 text-surface-400">
      <i class="pi pi-images" style="font-size: 2.5rem" />
      <p class="text-sm">Choose how many images you'd like, then click "Get Images".</p>
    </div>

    <DataView v-else :value="randomImages" :layout="layout" paginator :rows="20">
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
