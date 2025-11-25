<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { ref, watch } from 'vue'
import GuessDisplayer from './GuessDisplayer.vue'

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
    <GuessDisplayer :guess="guessInProgress" />
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
