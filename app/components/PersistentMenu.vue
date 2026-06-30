<script setup lang="ts">
  import Button from 'primevue/button';

  const visible = defineModel<boolean>("visible");

</script>

<template>
  <Transition name="slide-fade">
    <div
      v-show="visible"
      class="fixed inset-0 z-50 flex flex-col bg-surface-0 dark:bg-surface-950 h-screen"
    >
      <div class="px-4 py-3 border-b border-surface-200 dark:border-surface-700 shrink-0">
        <div class='flex justify-between !w-100'>
          <slot name="header" />
          <Button icon="pi pi-times" severity="secondary" variant="text" rounded aria-label="Close" @click="visible = false" />
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-1rem);
  opacity: 0;
}
</style>
