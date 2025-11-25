<script setup lang="ts">
import { WORD_SIZE } from '@/settings'

defineProps<{
  guess: string
}>()
</script>
<template>
  <ul class="flex flex-nowrap gap-2 mb-2">
    <li
      v-for="(char, index) in guess.padEnd(WORD_SIZE, ' ')"
      :key="index"
      class="flex justify-center items-center w-20 h-20 font-semibold text-3xl border border-gray-500"
    >
      {{ char }}
    </li>
  </ul>
</template>
