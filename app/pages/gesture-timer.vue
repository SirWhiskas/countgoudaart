<script setup lang="ts">
import { ref, watch, onMounted, useTemplateRef } from 'vue'
import Drawer from 'primevue/drawer'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

definePageMeta({ layout: false })
useHead({ title: 'Gesture Timer — Count Gouda' })

interface ImageNode {
  key: string
  label: string
  data?: string
  path: string
  children?: ImageNode[]
}

interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title: string
}

const toast = useToast()

const images = ref<ImageNode[]>([])
const imageGallery = ref<GalleryImage[]>([])
const imagesForTiles = ref<GalleryImage[]>([])
const timerValue = ref(120)
const hasCompletedWarmUp = ref(false)
const sidebarVisible = ref(false)
const actionDrawerVisible = ref(false)
const selectedFolderName = ref('')
const localFolderSupported = isLocalFolderSupported()
const localFolderLoading = ref(false)

const openLocalFolder = async () => {
  localFolderLoading.value = true
  try {
    const { name, images: localImages } = await useOpenLocalFolder()
    imagesForTiles.value = localImages
    selectedFolderName.value = name
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== 'AbortError') {
      toast.add({ severity: 'error', summary: 'Could not open folder', detail: String(err), life: 4000 })
    }
  } finally {
    localFolderLoading.value = false
  }
}

const galleryComponent = useTemplateRef<{ showGallery: () => void; hideGallery: () => void; goToNextImage: () => void }>('image-gallery')
const gestureTimerComponent = useTemplateRef<{ startTimer: () => void; stopTimer: () => void }>('gesture-timer')

const shuffleArray = <T>(array: T[]): T[] =>
  array.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

const imageByKey = (imageArray: ImageNode[], key: string): ImageNode[] => {
  return imageArray.flatMap((obj) => {
    if (obj.key === key) return { ...obj, children: obj.children ?? [] }
    return obj.children ? imageByKey(obj.children, key) : []
  })
}

const getRandomImagesFromNode = (node: ImageNode): GalleryImage[] => {
  const imagesForGallery: GalleryImage[] = []
  node.children?.forEach((child) => {
    if (!child.children) {
      imagesForGallery.push({
        itemImageSrc: useGetImagePath(child.path.replace(/\\/g, '/')),
        thumbnailImageSrc: useGetImagePath(child.path.replace(/\\/g, '/')),
        alt: child.data ?? '',
        title: child.label,
      })
    } else {
      imagesForGallery.push(...getRandomImagesFromNode(child))
    }
  })
  return shuffleArray(imagesForGallery)
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.ico']

const handleFileSelect = (node: ImageNode) => {
  selectedFolderName.value = node.label
  sidebarVisible.value = false

  if (node.children) {
    if (node.children.some((c) => imageExtensions.some((ext) => c.path.toLowerCase().endsWith(ext)))) {
      imagesForTiles.value = node.children.map((c) => ({
        itemImageSrc: useGetImagePath(c.path.replace(/\\/g, '/')),
        thumbnailImageSrc: useGetImagePath(c.path.replace(/\\/g, '/')),
        alt: c.data ?? '',
        title: c.label,
      }))
    }
  } else {
    const formattedPath = node.path.replace(/\\/g, '/')
    imageGallery.value = [{
      itemImageSrc: useGetImagePath(formattedPath),
      thumbnailImageSrc: useGetImagePath(formattedPath),
      alt: node.data ?? '',
      title: node.label,
    }]
    galleryComponent.value?.showGallery()
  }
}

const handleWarmUpStart = (folderNodes: ImageNode[]) => {
  hasCompletedWarmUp.value = false
  let galleryImages: GalleryImage[] = []

  folderNodes.forEach((node) => {
    const originalNodeData = imageByKey(images.value, node.key)
    if (originalNodeData.length > 0) {
      galleryImages = [...galleryImages, ...getRandomImagesFromNode(originalNodeData[0])]
    }
  })

  const topImagesFromTheDeck = shuffleArray(galleryImages).slice(0, 5)

  setTimeout(() => {
    imageGallery.value = topImagesFromTheDeck
    galleryComponent.value?.showGallery()
    gestureTimerComponent.value?.startTimer()
  }, 3000)
}

const handleWarmUpEnd = () => {
  toast.add({ severity: 'success', summary: 'Warm-up ended!', detail: 'Congrats! You did it!', life: 3000 })
  galleryComponent.value?.hideGallery()
  gestureTimerComponent.value?.stopTimer()
}

const handleGalleryEnd = () => {
  hasCompletedWarmUp.value = true
}

const handleTimerEnd = () => {
  if (!hasCompletedWarmUp.value) {
    toast.add({ severity: 'warn', summary: 'Times up!', detail: 'About to switch to the next image!', group: 'timer', life: 3000 })
  } else {
    handleWarmUpEnd()
  }
}

const handleQuickWarmUp = () => {
  if (imagesForTiles.value.length === 0) return
  hasCompletedWarmUp.value = false

  const topImages = shuffleArray(imagesForTiles.value).slice(0, 5)
  setTimeout(() => {
    imageGallery.value = topImages
    galleryComponent.value?.showGallery()
    gestureTimerComponent.value?.startTimer()
  }, 3000)
}

const handleTimerToastEnd = () => {
  if (!hasCompletedWarmUp.value) {
    galleryComponent.value?.goToNextImage()
    gestureTimerComponent.value?.startTimer()
  }
}

// ── RefServer connection ─────────────────────────────────────────────────────
const { serverUrl, setServerUrl, testConnection } = useServerConfig()
const connectDialogVisible = ref(false)
const pendingUrl = ref('')
const connectionTesting = ref(false)
const connectionResult = ref<'ok' | 'fail' | null>(null)

const openConnectDialog = () => {
  pendingUrl.value = serverUrl.value ?? ''
  connectionResult.value = null
  connectDialogVisible.value = true
}

const handleConnect = async () => {
  connectionTesting.value = true
  connectionResult.value = null
  const ok = await testConnection(pendingUrl.value)
  connectionResult.value = ok ? 'ok' : 'fail'
  connectionTesting.value = false
  if (ok) {
    setServerUrl(pendingUrl.value)
    connectDialogVisible.value = false
    images.value = await useGetImageData()
  }
}

const handleDisconnect = () => {
  setServerUrl(null)
  images.value = []
  connectDialogVisible.value = false
}

// Reload sidebar tree if app loads with a saved server URL
onMounted(async () => {
  images.value = await useGetImageData()
})
</script>

<template>
  <div class="flex flex-col h-dvh overflow-hidden bg-surface-50 dark:bg-surface-900">
    <Toast group="timer" @life-end="handleTimerToastEnd" />
    <Toast />

    <Dialog v-model:visible="connectDialogVisible" modal style="width: min(95vw, 440px)">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-wifi text-primary-400" />
          <span class="font-bold">Connect to RefServer</span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <p class="text-sm text-surface-500 dark:text-surface-400">
          Enter your PC's local IP and the port RefServer is running on.
          Make sure you're on the same network.
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Server URL</label>
          <InputText
            v-model="pendingUrl"
            placeholder="http://xxx.xxx.x.xxx:3001"
            class="w-full"
            @keyup.enter="handleConnect"
          />
        </div>
        <div v-if="connectionResult" class="flex items-center gap-2 text-sm">
          <i :class="connectionResult === 'ok' ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'" />
          <span :class="connectionResult === 'ok' ? 'text-green-600' : 'text-red-500'">
            {{ connectionResult === 'ok' ? 'Connected!' : 'Could not reach server. Check the URL and try again.' }}
          </span>
        </div>
      </div>

      <template #footer>
        <Button v-if="serverUrl" label="Disconnect" text severity="danger" @click="handleDisconnect" />
        <Button label="Cancel" text severity="secondary" @click="connectDialogVisible = false" />
        <Button
          label="Test & Connect"
          icon="pi pi-wifi"
          :loading="connectionTesting"
          :disabled="!pendingUrl"
          @click="handleConnect"
        />
      </template>
    </Dialog>
    <RefImageGallery ref="image-gallery" :image-gallery="imageGallery" @on-gallery-end="handleGalleryEnd" />

    <!-- App header -->
    <header class="flex items-center gap-2 px-3 py-2 bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700 shrink-0 z-10 shadow-sm">
      <div class="lg:hidden shrink-0">
        <Button icon="pi pi-bars" text rounded size="small" class="-ml-1" aria-label="Toggle folder sidebar" @click="sidebarVisible = true" />
      </div>
      <div class="flex items-center gap-2 min-w-0 mr-auto">
        <i class="pi pi-images text-primary-400 text-lg shrink-0 hidden sm:block" />
        <span class="font-semibold text-base truncate">Gesture Timer</span>
        <span v-if="selectedFolderName" class="text-surface-400 dark:text-surface-500 text-sm truncate hidden sm:inline">
          / {{ selectedFolderName }}
        </span>
      </div>
      <GestureTimer ref="gesture-timer" :time="timerValue" @on-times-up="handleTimerEnd" />
      <div class="flex items-center gap-1 shrink-0">
        <WarmUp @on-warm-up-start="handleWarmUpStart" />
        <!-- Secondary actions: inline on md+, drawer trigger on mobile -->
        <div class="hidden md:flex items-center gap-1">
          <Button
            v-if="localFolderSupported"
            icon="pi pi-folder-open"
            label="Open Folder"
            size="small"
            severity="secondary"
            :loading="localFolderLoading"
            @click="openLocalFolder"
          />
          <Button
            icon="pi pi-wifi"
            size="small"
            text
            rounded
            :severity="serverUrl ? 'success' : 'secondary'"
            aria-label="Connect to RefServer"
            @click="openConnectDialog"
          />
          <LotteryTiles :images="imagesForTiles" />
          <Button icon="pi pi-arrow-left" label="Back to main site" size="small" text severity="secondary" @click="navigateTo('/')" />
        </div>
        <Button icon="pi pi-ellipsis-v" text rounded size="small" class="md:!hidden" aria-label="More actions" @click="actionDrawerVisible = true" />
      </div>
    </header>

    <!-- Right action drawer (mobile only) -->
    <Drawer v-model:visible="actionDrawerVisible" position="right" style="width: 16rem">
      <template #header>
        <span class="font-semibold">Actions</span>
      </template>
      <div class="flex flex-col gap-2 p-2">
        <Button
          v-if="localFolderSupported"
          icon="pi pi-folder-open"
          label="Open Folder"
          severity="secondary"
          fluid
          :loading="localFolderLoading"
          @click="() => { actionDrawerVisible = false; openLocalFolder() }"
        />
        <Button
          :icon="serverUrl ? 'pi pi-wifi' : 'pi pi-wifi'"
          :label="serverUrl ? 'RefServer: Connected' : 'Connect RefServer'"
          :severity="serverUrl ? 'success' : 'secondary'"
          fluid
          @click="() => { actionDrawerVisible = false; openConnectDialog() }"
        />
        <LotteryTiles :images="imagesForTiles" :show-label="true" />
      </div>
      <template #footer>
        <Button icon="pi pi-arrow-left" label="Back to main site" text severity="secondary" fluid @click="navigateTo('/')" />
      </template>
    </Drawer>

    <!-- Main layout: sidebar + content -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Desktop sidebar -->
      <nav class="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-surface-200 dark:border-surface-700 overflow-y-auto bg-surface-0 dark:bg-surface-950">
        <div class="flex items-center gap-2 px-3 py-3 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-surface-0 dark:bg-surface-950 z-10">
          <i class="pi pi-folder text-primary-400" />
          <span class="font-medium text-sm text-surface-600 dark:text-surface-400 uppercase tracking-wide">Folders</span>
        </div>
        <FolderTree :file-data="images" @node-select="handleFileSelect" />
      </nav>

      <!-- Mobile drawer -->
      <Drawer v-model:visible="sidebarVisible" position="left" style="width: 18rem">
        <template #header>
          <div class="flex items-center gap-2">
            <i class="pi pi-images text-primary-400" />
            <span class="font-semibold">Gesture Timer</span>
          </div>
        </template>
        <FolderTree :file-data="images" @node-select="handleFileSelect" />
      </Drawer>

      <!-- Image content area -->
      <main class="flex-1 overflow-y-auto">
        <div
          v-if="imagesForTiles.length === 0"
          class="flex flex-col items-center justify-center h-full gap-4 select-none"
        >
          <i class="pi pi-folder-open text-surface-300 dark:text-surface-600" style="font-size: 4rem" />
          <p class="text-base font-medium text-surface-400 dark:text-surface-500">No images loaded</p>
          <Button
            v-if="localFolderSupported"
            icon="pi pi-folder-open"
            label="Open a folder from your computer"
            :loading="localFolderLoading"
            @click="openLocalFolder"
          />
          <p v-else class="text-sm text-surface-400 dark:text-surface-600 max-w-xs text-center">
            Your browser doesn't support folder access. Try Chrome or Edge.
          </p>
        </div>
        <RefImageTiles v-else :images="imagesForTiles" @quick-warm-up="handleQuickWarmUp" />
      </main>

    </div>
  </div>
</template>
