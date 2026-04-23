<script setup lang="ts">
import { ref } from 'vue'
import Tree from 'primevue/tree'

interface TreeNode {
  key: string
  label: string
  data?: string
  path: string
  children?: TreeNode[]
}

defineProps<{
  fileData: TreeNode[]
  selectionMode?: string
}>()

const emit = defineEmits(['nodeSelect', 'nodeUnselect'])

const selectedKey = ref(null)

const onNodeSelect = (node: TreeNode) => emit('nodeSelect', node)
const onNodeUnselect = (node: TreeNode) => emit('nodeUnselect', node)
</script>

<template>
  <Tree
    v-model:selectionKeys="selectedKey"
    :value="fileData"
    :selectionMode="selectionMode ?? 'single'"
    @nodeSelect="onNodeSelect"
    @nodeUnselect="onNodeUnselect"
  />
</template>
