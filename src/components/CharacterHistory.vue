<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Feedback } from '@/utils/feedback'

const props = defineProps<{
  guesses: string[]
  keyFeedbacks: Record<string, Feedback>
}>()

const alphabetCharacters = 'qwertyuiop|asdfghjkl|zxcvbnm'
const revealedGuessCount = ref(0)

const visibleGuesses = computed(() => props.guesses.slice(0, revealedGuessCount.value))

const keyboardRows = alphabetCharacters
  .toUpperCase()
  .split('|')
  .map((row) => row.split(''))

const keyboardData = computed(() =>
  keyboardRows.map((row) =>
    row.map((char) => {
      const feedback: Feedback = visibleGuesses.value.length
        ? props.keyFeedbacks[char] || null
        : null

      return {
        char,
        feedback,
        animate: feedback === 'correct' || feedback === 'almost',
      }
    }),
  ),
)

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
  <div class="w-full flex px-2 sm:px-4">
    <div class="w-full max-w-4xl flex flex-col items-center gap-1">
      <div
        v-for="(row, rowIndex) in keyboardData"
        :key="rowIndex"
        class="flex justify-center gap-1 sm:gap-1 w-full"
      >
        <div
          v-for="{ char, feedback, animate } in row"
          :key="char"
          keyboard-test="keyboard-key"
          :data-letter="char"
          :data-letter-feedback="feedback"
          :class="[
            { 'animate-jelly animate-duration-400': animate },
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
  </div>
</template>

<style scoped>
@import 'tailwindcss';

.key {
  @apply flex justify-center items-center rounded select-none text-white font-semibold min-w-8 min-h-11 text-base sm:min-w-12 sm:min-h-16 sm:text-xl;
}
</style>
