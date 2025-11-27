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
  <div class="w-full inline-flex">
    <div class="w-full max-w-4xl flex flex-col items-center gap-1.5">
      <div
        v-for="(row, rowIndex) in keyboardRows"
        :key="rowIndex"
        class="flex justify-center gap-1.5 w-full"
      >
        <div
          v-for="char in row"
          :key="char"
          keyboard-test="keyboard-key"
          :data-letter="char"
          :data-letter-feedback="
            visibleGuesses.length ? getKeyFeedback(char, visibleGuesses, answer) : null
          "
          :class="[
            {
              'animate-jelly animate-duration-400':
                getKeyFeedback(char, visibleGuesses, answer) === 'correct' ||
                getKeyFeedback(char, visibleGuesses, answer) === 'almost',
            },
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
  @apply flex justify-center items-center rounded select-none text-white font-semibold min-w-8 min-h-11 text-lg sm:w-12 sm:h-16 sm:text-xl;
}
</style>
