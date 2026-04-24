<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Admin — Count Gouda' })

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="h-dvh flex flex-col bg-ink-950">
    <header class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-ink-800">
      <span class="font-display text-xs tracking-[0.25em] uppercase text-ink-400">Admin</span>
      <button
        class="font-display text-xs tracking-[0.2em] uppercase text-ink-500 hover:text-ink-200 transition-colors"
        @click="logout"
      >
        Log out
      </button>
    </header>

    <main class="flex-1 flex items-center justify-center text-ink-600">
      <p class="font-body italic">Editor coming soon.</p>
    </main>
  </div>
</template>
