<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { ref, watch } from 'vue'
import GuessDisplayer from './GuessDisplayer.vue'

const { disabled = false } = defineProps<{ disabled?: boolean }>()

const guessInProgress = ref('')
const guessIsInvalid = ref(false)

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
  if (!englishWords.includes(guessInProgress.value)) {
    if (guessInProgress.value) guessIsInvalid.value = true
    setTimeout(() => {
      guessIsInvalid.value = false
    }, 500)
    return
  }

  emit('guess-submitted', guessInProgress.value)
  guessInProgress.value = ''
}
</script>
<template>
  <section>
    <GuessDisplayer
      v-if="!disabled"
      :guess="guessInProgress"
      :class="{ 'animate-shake animate-duration-250': guessIsInvalid }"
    />
    <input
      type="text"
      v-model="guessInProgress"
      class="opacity-0 absolute"
      :maxlength="WORD_SIZE"
      autofocus
      :disabled="disabled"
      @blur="({ target }) => (target as HTMLInputElement).focus()"
      @keydown.enter="onSubmit"
    />
  </section>
</template>
