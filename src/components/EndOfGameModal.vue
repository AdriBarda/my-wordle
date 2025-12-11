<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const open = () => (isOpen.value = true)
const close = () => (isOpen.value = false)

defineExpose({
  open,
  close,
})
</script>
<template>
  <div
    v-if="isOpen"
    class="fixed flex flex-col items-center justify-center text-3xl sm:text-4xl leading-snug text-center bg-white/90 border rounded-3xl shadow-2xl w-[min(90vw,32rem)] min-h-64 px-6 py-10 top-1/2 left-1/2 -translate-1/2 z-10 animate-tada animate-duration-400"
  >
    <slot />
    <button class="cursor-pointer text-sm" @click="close">Review board</button>
  </div>
</template>
