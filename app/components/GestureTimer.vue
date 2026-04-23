<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{ time?: number }>()
const emit = defineEmits(['onTimesUp'])

const clock = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

const formattedTime = computed(() => {
  const minutes = Math.floor(clock.value / 60)
  const seconds = clock.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startTimer = () => {
  clearInterval(timerInterval.value!)
  clock.value = props.time ?? 120

  timerInterval.value = setInterval(() => {
    if (clock.value > 0) {
      clock.value--
    } else {
      clearInterval(timerInterval.value!)
      emit('onTimesUp')
    }
  }, 1000)
}

const stopTimer = () => {
  clearInterval(timerInterval.value!)
  clock.value = 0
}

onUnmounted(() => clearInterval(timerInterval.value!))

defineExpose({ startTimer, stopTimer })
</script>

<template>
  <div class="text-sm font-mono tabular-nums px-2 text-surface-600 dark:text-surface-300 shrink-0">
    {{ formattedTime }}
  </div>
</template>
