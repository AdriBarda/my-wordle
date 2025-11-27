<script setup lang="ts">
import { getKeyFeedback } from '@/utils/feedback'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  guesses: string[]
  answer: string
}>()

const alphabetCharacters = 'qwertyuiop|asdfghjkl|zxcvbnm'
const revealedGuessCount = ref(0)

const visibleGuesses = computed(() => props.guesses.slice(0, revealedGuessCount.value))

const keyboardRows = alphabetCharacters
  .toUpperCase()
  .split('|')
  .map((row) => row.split(''))

watch(
  () => props.guesses.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      setTimeout(() => {
        revealedGuessCount.value = newLength
      }, 750)
    }
  },
)
</script>
<template>
  <div class="inline-flex flex-col gap-2 rounded-xl p-4">
    <div v-for="(row, rowIndex) in keyboardRows" :key="rowIndex" class="flex gap-1 justify-center">
      <div
        v-for="char in row"
        :key="char"
        keyboard-test="keyboard-key"
        :data-letter="char"
        :data-letter-feedback="
          visibleGuesses.length ? getKeyFeedback(char, visibleGuesses, answer) : null
        "
        :class="[
          'key bg-gray-300',
          'data-[letter-feedback=correct]:bg-green-500',
          'data-[letter-feedback=almost]:bg-yellow-500',
          'data-[letter-feedback=incorrect]:bg-gray-500',
        ]"
      >
        {{ char }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'tailwindcss';

.key {
  @apply flex justify-center items-center w-14 h-16  text-white font-semibold text-2xl rounded;
}
</style>
