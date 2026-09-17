<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import {
  type ImageNode,
  type GalleryImage,
  type SessionRound,
} from '~/utils/gestureTimerUtils'

const props = defineProps<{
  images: ImageNode[]
  localFolderSupported: boolean
}>()

const emit = defineEmits<{ onSessionStart: [rounds: SessionRound[]] }>()

const visible = ref(false)
const rounds = ref<SessionRound[]>([])

const durationPresets = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '20m', value: 1200 },
] as const

// ── Draft (add-round) state ─────────────────────────────────────────────────
const draftSourceType = ref<'remote' | 'local' | null>(null)
const draftRemoteNode = ref<ImageNode | null>(null)
const draftLocalName = ref<string | null>(null)
const draftLocalImages = ref<GalleryImage[] | null>(null)
const draftImageCount = ref(5)
const draftDurationSeconds = ref(30)
const localFolderLoadingDraft = ref(false)

const openDialog = () => { visible.value = true }

const onRemoteNodeSelect = (node: ImageNode) => {
  if (!node.children) return
  draftRemoteNode.value = node
}

const pickLocalFolderForRound = async () => {
  localFolderLoadingDraft.value = true
  try {
    const { name, images } = await useOpenLocalFolder()
    draftLocalName.value = name
    draftLocalImages.value = images
  } finally {
    localFolderLoadingDraft.value = false
  }
}

const canAddRound = computed(() =>
  draftImageCount.value >= 1 &&
  draftDurationSeconds.value >= 30 &&
  ((draftSourceType.value === 'remote' && !!draftRemoteNode.value) ||
    (draftSourceType.value === 'local' && !!draftLocalImages.value)))

const resetDraft = (keepSourceType = false) => {
  if (!keepSourceType) draftSourceType.value = null
  draftRemoteNode.value = null
  draftLocalName.value = null
  draftLocalImages.value = null
  draftImageCount.value = 5
  draftDurationSeconds.value = 30
}

const addRound = () => {
  if (!canAddRound.value) return
  const id = `round-${Date.now()}-${Math.random().toString(36).slice(2)}`
  if (draftSourceType.value === 'remote' && draftRemoteNode.value) {
    rounds.value.push({
      id,
      sourceType: 'remote',
      sourceLabel: draftRemoteNode.value.label,
      remoteNode: draftRemoteNode.value,
      imageCount: draftImageCount.value,
      durationSeconds: draftDurationSeconds.value,
    })
  } else if (draftSourceType.value === 'local' && draftLocalImages.value) {
    rounds.value.push({
      id,
      sourceType: 'local',
      sourceLabel: draftLocalName.value ?? 'Local folder',
      localImages: draftLocalImages.value,
      imageCount: draftImageCount.value,
      durationSeconds: draftDurationSeconds.value,
    })
  }
  resetDraft(true)
}

const revokeRoundBlobs = (round: SessionRound) => {
  round.localImages?.forEach((img) => {
    if (img.itemImageSrc.startsWith('blob:')) URL.revokeObjectURL(img.itemImageSrc)
  })
}

const removeRound = (id: string) => {
  const idx = rounds.value.findIndex(r => r.id === id)
  if (idx === -1) return
  revokeRoundBlobs(rounds.value[idx]!)
  rounds.value.splice(idx, 1)
}

const cancelDialog = () => {
  rounds.value.forEach(revokeRoundBlobs)
  rounds.value = []
  resetDraft()
  visible.value = false
}

const startSession = () => {
  visible.value = false
  emit('onSessionStart', rounds.value)
  rounds.value = []
  resetDraft()
}

const formatDuration = (seconds: number): string =>
  seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60 ? ` ${seconds % 60}s` : ''}`

defineExpose({ openDialog })
</script>

<template>
  <div>
    <Button label="Start a Session" icon="pi pi-play" size="small" @click="openDialog" />

    <Dialog v-model:visible="visible" modal style="width: min(95vw, 680px)">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-play-circle text-primary-400" />
          <span class="font-bold">Build a Session</span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <!-- Add-round form -->
        <div class="flex flex-col gap-3 p-3 border border-surface-200 dark:border-surface-700 rounded">
          <p class="text-sm font-medium">Add a round</p>

          <div class="flex flex-col sm:flex-row gap-2">
            <Button
              label="Remote Folder"
              icon="pi pi-wifi"
              size="small"
              class="w-full sm:w-auto"
              :outlined="draftSourceType !== 'remote'"
              :disabled="props.images.length === 0"
              @click="draftSourceType = 'remote'"
            />
            <Button
              label="Local Folder"
              icon="pi pi-folder-open"
              size="small"
              class="w-full sm:w-auto"
              :outlined="draftSourceType !== 'local'"
              :disabled="!props.localFolderSupported"
              @click="draftSourceType = 'local'"
            />
          </div>

          <div v-if="draftSourceType === 'remote'" class="flex flex-col gap-2">
            <div class="border border-surface-200 dark:border-surface-700 rounded overflow-y-auto" style="max-height: 30vh">
              <FolderTree :file-data="props.images" @node-select="onRemoteNodeSelect" />
            </div>
            <p v-if="draftRemoteNode" class="text-sm text-primary-600 dark:text-primary-400">
              <i class="pi pi-check-circle" /> {{ draftRemoteNode.label }}
            </p>
          </div>

          <div v-else-if="draftSourceType === 'local'" class="flex flex-wrap items-center gap-2">
            <Button
              label="Choose folder..."
              icon="pi pi-folder-open"
              size="small"
              severity="secondary"
              :loading="localFolderLoadingDraft"
              @click="pickLocalFolderForRound"
            />
            <p v-if="draftLocalName" class="text-sm text-primary-600 dark:text-primary-400 min-w-0 truncate">
              <i class="pi pi-check-circle" /> {{ draftLocalName }}
            </p>
          </div>

          <div v-if="draftSourceType" class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Number of images</label>
              <InputNumber v-model="draftImageCount" :min="1" :max="100" showButtons size="small" inputClass="w-16 text-center" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Duration per image</label>
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  v-for="preset in durationPresets"
                  :key="preset.value"
                  :label="preset.label"
                  size="small"
                  :outlined="draftDurationSeconds !== preset.value"
                  @click="draftDurationSeconds = preset.value"
                />
                <InputNumber v-model="draftDurationSeconds" :min="30" :step="5" suffix=" sec" size="small" inputClass="w-20" />
              </div>
              <p v-if="draftDurationSeconds < 30" class="text-xs text-red-500">Minimum duration is 30 seconds.</p>
            </div>
          </div>

          <Button
            label="Add Round"
            icon="pi pi-plus"
            size="small"
            :disabled="!canAddRound"
            class="self-start"
            @click="addRound"
          />
        </div>

        <!-- Rounds list -->
        <div>
          <p class="text-sm text-surface-400 mb-2">
            <span v-if="rounds.length > 0">Rounds ({{ rounds.length }}):</span>
            <span v-else class="italic">No rounds added yet</span>
          </p>
          <div class="flex flex-col gap-2">
            <div
              v-for="(round, idx) in rounds"
              :key="round.id"
              class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 border border-surface-200 dark:border-surface-700 rounded"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="font-mono text-xs text-surface-400 w-5 text-center shrink-0">{{ idx + 1 }}</span>
                <i :class="round.sourceType === 'local' ? 'pi pi-desktop' : 'pi pi-folder'" class="text-primary-400 shrink-0" />
                <span class="min-w-0 flex-1 truncate text-sm">{{ round.sourceLabel }}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0 pl-7 sm:pl-0">
                <span class="text-xs text-surface-400">{{ round.imageCount }} img</span>
                <span class="text-xs text-surface-400 font-mono">{{ formatDuration(round.durationSeconds) }}</span>
                <Button icon="pi pi-times" text rounded size="small" severity="secondary" aria-label="Remove round" @click="removeRound(round.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text severity="secondary" @click="cancelDialog" />
        <Button
          :disabled="rounds.length === 0"
          label="Start Session"
          icon="pi pi-play"
          @click="startSession"
        />
      </template>
    </Dialog>
  </div>
</template>
