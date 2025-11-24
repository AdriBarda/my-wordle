<script setup lang="ts">
import { DEFEAT_MESSAGE, VICTORY_MESSAGE, WORD_SIZE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { ref, watch } from 'vue'

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => englishWords.includes(wordGiven),
  },
})

const guessInProgress = ref('')
const guessSubmitted = ref('')

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

  guessSubmitted.value = guessInProgress.value
}
</script>

<template>
  <input type="text" v-model="guessInProgress" :maxlength="WORD_SIZE" @keydown.enter="onSubmit" />
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
  />
</template>
