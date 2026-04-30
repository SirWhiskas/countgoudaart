<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCollections } from '~/composables/useCollections'

const props = defineProps<{ imageSrc: string | null }>()
const visible = defineModel<boolean>('visible', { default: false })

const { collectionNames, addToCollection } = useCollections()

const selectedCollection = ref<string | null>(null)
const newName = ref('')

watch(visible, (v) => {
  if (v) {
    selectedCollection.value = null
    newName.value = ''
  }
})

// Typing a new name clears the dropdown selection and vice versa
watch(newName, (v) => { if (v) selectedCollection.value = null })
watch(selectedCollection, (v) => { if (v) newName.value = '' })

const effectiveName = computed(() => newName.value.trim() || selectedCollection.value || '')
const canSave = computed(() => effectiveName.value.length > 0 && !!props.imageSrc)

const save = () => {
  if (!canSave.value) return
  addToCollection(effectiveName.value, props.imageSrc!)
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Save to Collection" style="width: min(95vw, 380px)">
    <div class="flex flex-col gap-4 pt-2">
      <div v-if="collectionNames.length > 0" class="flex flex-col gap-1">
        <label class="text-sm font-medium">Add to existing</label>
        <Select
          v-model="selectedCollection"
          :options="collectionNames"
          placeholder="Select a collection…"
          show-clear
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">
          {{ collectionNames.length > 0 ? 'Or create new' : 'Collection name' }}
        </label>
        <InputText
          v-model="newName"
          placeholder="e.g. Portraits"
          class="w-full"
          @keyup.enter="save"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="visible = false" />
      <Button label="Save" icon="pi pi-bookmark" :disabled="!canSave" @click="save" />
    </template>
  </Dialog>
</template>
