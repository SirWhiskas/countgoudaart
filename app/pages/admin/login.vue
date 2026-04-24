<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Admin Login — Count Gouda' })

const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch {
    error.value = 'Incorrect password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-dvh flex items-center justify-center bg-ink-950">
    <form
      class="flex flex-col gap-4 w-full max-w-sm px-8"
      @submit.prevent="submit"
    >
      <h1 class="font-display text-xs tracking-[0.35em] uppercase text-ink-400 mb-4">Admin</h1>

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        autocomplete="current-password"
        class="bg-ink-900 border border-ink-700 text-ink-100 font-body px-4 py-3 text-sm focus:outline-none focus:border-ink-400 placeholder:text-ink-600"
      />

      <p v-if="error" class="font-body text-sm text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="font-display text-xs tracking-[0.3em] uppercase border border-ink-400 text-ink-200 px-6 py-3 hover:border-white hover:text-white transition-colors duration-300 disabled:opacity-40"
      >
        {{ loading ? 'Checking…' : 'Enter' }}
      </button>
    </form>
  </div>
</template>
