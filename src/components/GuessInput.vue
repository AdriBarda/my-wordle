<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { ref, watch } from 'vue'

const guessInProgress = ref('')

const emit = defineEmits<{
  'guess-submitted': [guess: string]
}>()

const sanitise = (value: string) => {
  return value
    .slice(0, WORD_SIZE)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
}
watch(guessInProgress, (raw) => {
  const clean = sanitise(raw)
  if (clean !== raw) {
    guessInProgress.value = clean
  }
})

const onSubmit = () => {
  if (!englishWords.includes(guessInProgress.value)) return

  emit('guess-submitted', guessInProgress.value)
  guessInProgress.value = ''
}
</script>
<template>
  <section>
    <ul class="flex flex-nowrap gap-2">
      <li
        v-for="(char, index) in guessInProgress.padEnd(WORD_SIZE, ' ')"
        :key="index"
        class="flex justify-center items-center w-20 h-20 font-semibold text-3xl border border-gray-500"
      >
        {{ char }}
      </li>
    </ul>
    <input
      type="text"
      v-model="guessInProgress"
      class="opacity-0"
      :maxlength="WORD_SIZE"
      autofocus
      @blur="({ target }) => (target as HTMLInputElement).focus()"
      @keydown.enter="onSubmit"
    />
  </section>
</template>
