<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
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

const treeComponentRef = useTemplateRef('tree-component');

const selectedKey = ref(null)

const onNodeSelect = (node: TreeNode) => {
  // Save current state for mobile users as drawer component unmounts this
  console.log(treeComponentRef.value);
  emit('nodeSelect', node)
}
const onNodeUnselect = (node: TreeNode) => emit('nodeUnselect', node)
</script>

<template>
  <Tree
    ref="tree-component"
    v-model:selectionKeys="selectedKey"
    :value="fileData"
    :selectionMode="selectionMode ?? 'single'"
    @nodeSelect="onNodeSelect"
    @nodeUnselect="onNodeUnselect"
  />
</template>
