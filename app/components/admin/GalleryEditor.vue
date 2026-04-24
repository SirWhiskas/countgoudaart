<script setup lang="ts">
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Editor from 'primevue/editor'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

interface ArtPiece {
  imgTitle: string
  imgSrc: string
  artTitle: string
  artDimensions: { height: number | null; width: number | null }
  artMedium: string
  artDescription: string
}

const toast = useToast()
const pieces = ref<ArtPiece[]>([])
const selectedIdx = ref<number | null>(null)
const scanning = ref(false)
const saving = ref(false)

const form = reactive<ArtPiece>({
  imgTitle: '',
  imgSrc: '',
  artTitle: '',
  artDimensions: { height: null, width: null },
  artMedium: '',
  artDescription: '',
})

const dropdownOptions = computed(() =>
  pieces.value.map((p, i) => ({
    label: p.imgTitle || p.imgSrc.split('/').pop() || `Image ${i + 1}`,
    value: i,
  }))
)

watch(selectedIdx, (idx) => {
  if (idx === null) return
  const piece = pieces.value[idx]
  if (!piece) return
  form.imgTitle = piece.imgTitle
  form.imgSrc = piece.imgSrc
  form.artTitle = piece.artTitle
  form.artDimensions = { ...piece.artDimensions }
  form.artMedium = piece.artMedium
  form.artDescription = piece.artDescription
})

const loadData = async () => {
  try {
    pieces.value = await $fetch<ArtPiece[]>('/api/admin/gallery/data')
  } catch {
    pieces.value = []
  }
}

const scanImages = async () => {
  scanning.value = true
  try {
    const paths = await $fetch<string[]>('/api/admin/gallery/scan')
    const existing = new Map(pieces.value.map(p => [p.imgSrc, p]))
    pieces.value = paths.map(src => existing.get(src) ?? {
      imgTitle: src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '',
      imgSrc: src,
      artTitle: '',
      artDimensions: { height: null, width: null },
      artMedium: '',
      artDescription: '',
    })
    toast.add({ severity: 'success', summary: 'Scan complete', detail: `Found ${paths.length} images`, life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Scan failed', detail: 'Could not read gallery directory', life: 4000 })
  } finally {
    scanning.value = false
  }
}

const saveEntry = async () => {
  if (selectedIdx.value === null) return
  pieces.value[selectedIdx.value] = {
    imgTitle: form.imgTitle,
    imgSrc: form.imgSrc,
    artTitle: form.artTitle,
    artDimensions: { ...form.artDimensions },
    artMedium: form.artMedium,
    artDescription: form.artDescription,
  }
  saving.value = true
  try {
    await $fetch('/api/admin/gallery/save', { method: 'POST', body: pieces.value })
    toast.add({ severity: 'success', summary: 'Saved', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Save failed', life: 4000 })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="flex flex-col gap-6">
    <Toast />

    <!-- Section header -->
    <div class="flex items-center justify-between">
      <h2 class="font-display text-xs tracking-[0.35em] uppercase text-ink-400">Gallery</h2>
      <Button
        icon="pi pi-refresh"
        label="Scan Images"
        size="small"
        severity="secondary"
        :loading="scanning"
        @click="scanImages"
      />
    </div>

    <!-- Empty state -->
    <div v-if="pieces.length === 0" class="flex flex-col items-center justify-center py-24 text-ink-600">
      <i class="pi pi-images mb-4" style="font-size: 3rem" />
      <p class="font-body italic text-lg mb-2">No images yet.</p>
      <p class="font-body text-sm">Click "Scan Images" to load from /public/art/gallery/.</p>
    </div>

    <div v-else class="flex flex-col gap-6">

      <!-- Image selector -->
      <div>
        <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-2">Select Image</label>
        <Select
          v-model="selectedIdx"
          :options="dropdownOptions"
          option-label="label"
          option-value="value"
          placeholder="Choose an image to edit…"
          class="w-full"
        />
      </div>

      <!-- Editor + preview -->
      <div v-if="selectedIdx !== null" class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Form -->
        <div class="flex flex-col gap-5">

          <div>
            <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Image Title</label>
            <InputText v-model="form.imgTitle" class="w-full" placeholder="Alt text and dropdown label" />
          </div>

          <div>
            <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Art Title</label>
            <InputText v-model="form.artTitle" class="w-full" placeholder="Displayed on the gallery page" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Width (in)</label>
              <InputNumber v-model="form.artDimensions.width" :min="0" :max-fraction-digits="1" class="w-full" placeholder="0" fluid />
            </div>
            <div>
              <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Height (in)</label>
              <InputNumber v-model="form.artDimensions.height" :min="0" :max-fraction-digits="1" class="w-full" placeholder="0" fluid />
            </div>
          </div>

          <div>
            <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-1">Medium</label>
            <Textarea v-model="form.artMedium" class="w-full" :rows="2" auto-resize placeholder="e.g. Charcoal on newsprint" />
          </div>

          <div>
            <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500 mb-2">Description</label>
            <Editor v-model="form.artDescription" editor-style="height: 180px;" />
          </div>

          <Button
            label="Save"
            icon="pi pi-save"
            :loading="saving"
            class="self-start mt-1"
            @click="saveEntry"
          />
        </div>

        <!-- Image preview -->
        <div class="flex flex-col gap-2">
          <label class="block font-display text-xs tracking-[0.2em] uppercase text-ink-500">Preview</label>
          <div class="rounded overflow-hidden bg-ink-900 border border-ink-800 flex items-center justify-center">
            <img
              :src="form.imgSrc"
              :alt="form.imgTitle"
              class="w-full object-contain max-h-[520px]"
            />
          </div>
          <p class="font-body text-xs text-ink-700 break-all">{{ form.imgSrc }}</p>
        </div>

      </div>
    </div>
  </div>
</template>
