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
}
</script>

<template>
  <input type="text" v-model="guessInProgress" :maxlength="WORD_SIZE" @keydown.enter="onSubmit" />
</template>
