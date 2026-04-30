<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const visible = defineModel<boolean>('visible', { default: false })

const features = [
  {
    icon: 'pi pi-folder-open',
    title: 'Open a Local Folder',
    body: 'Click "Open Folder" to load reference images directly from your computer. The images stay local — nothing is uploaded. Works in Chrome and Edge only.',
  },
  {
    icon: 'pi pi-wifi',
    title: 'Connect to an Image Server',
    body: 'Connect to any HTTP image library that exposes a directory and image listing API. Enter the server URL and optional API key — once connected the folder tree on the left populates automatically.',
  },
  {
    icon: 'pi pi-folder',
    title: 'Folder Tree',
    body: 'Browse your loaded folders in the left sidebar. Click a folder to load its images into the tile view. Click an individual image to open it in the fullscreen gallery.',
  },
  {
    icon: 'pi pi-stopwatch',
    title: 'Gesture Timer',
    body: 'The timer in the header counts down for each pose. Adjust the duration using the controls next to it. When it hits zero during a session the gallery automatically advances to the next image.',
  },
  {
    icon: 'pi pi-sun',
    title: 'Warm-up Mode',
    body: 'Click the Warm-up button and select folders to pull from. The app picks a random set of images and runs through them with the timer — just like a real life drawing warm-up.',
  },
  {
    icon: 'pi pi-ticket',
    title: 'Quick Warm-up',
    body: 'The "Quick Warm-up" button in the tile view header grabs 5 random images from whatever is currently loaded and starts the timer immediately.',
  },
  {
    icon: 'pi pi-bookmark',
    title: 'Collections',
    body: 'Hover over any image tile and click the bookmark icon to save it to a collection. Give it a name or add it to an existing one. Your collections are saved in the browser and appear in the left sidebar under "Collections".',
  },
  {
    icon: 'pi pi-images',
    title: 'Fullscreen Gallery',
    body: 'When a session is running, images display fullscreen one at a time. Click anywhere to advance manually or let the timer do it automatically.',
  },
]
</script>

<template>
  <Dialog v-model:visible="visible" modal header="How to use Gesture Timer" style="width: min(95vw, 560px); max-height: 85vh">
    <div class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700">
      <div v-for="feature in features" :key="feature.title" class="flex gap-4 py-4 first:pt-2">
        <div class="shrink-0 w-8 flex items-start justify-center pt-0.5">
          <i :class="feature.icon" class="text-primary-400 text-base" />
        </div>
        <div>
          <p class="font-semibold text-sm mb-0.5">{{ feature.title }}</p>
          <p class="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{{ feature.body }}</p>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Got it" @click="visible = false" />
    </template>
  </Dialog>
</template>
