<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Feedback, KeyboardKey, KeyboardAction } from '@/types'

const props = defineProps<{
  guesses: string[]
  keyFeedbacks: Record<string, Feedback>
  disabled?: boolean
}>()

const emit = defineEmits<{
  'char-submitted': [event: KeyboardKey]
}>()

const alphabetCharacters = 'qwertyuiop|asdfghjkl|zxcvbnm'
const revealedGuessCount = ref(0)
const guessesRevealed = computed(() => revealedGuessCount.value === props.guesses.length)
const lastStableKeyFeedbacks = ref<Record<string, Feedback>>({})

const handleOnClick = (key: KeyboardKey) => emit('char-submitted', key)

const visibleGuesses = computed(() => props.guesses.slice(0, revealedGuessCount.value))
const shouldShowFeedback = computed(() => guessesRevealed.value && visibleGuesses.value.length > 0)

const keyboardRows = alphabetCharacters
  .toUpperCase()
  .split('|')
  .map((row) => row.split(''))

keyboardRows[2]?.unshift('⏎')
keyboardRows[2]?.push('⌫')

const isLetter = /^[A-Z]$/

const keyboardData = computed(() =>
  keyboardRows.map((row) =>
    row.map((char) => {
      if (!isLetter.test(char)) {
        return {
          char,
          action: (char === '⏎' ? 'submit' : 'delete') as KeyboardAction,
          feedback: null,
          animate: false,
        }
      }
      const stableFeedback = lastStableKeyFeedbacks.value[char] || null
      const feedback: Feedback = shouldShowFeedback.value
        ? props.keyFeedbacks[char] || stableFeedback
        : stableFeedback
      const canAnimate =
        feedback !== stableFeedback && (feedback === 'correct' || feedback === 'almost')

      return {
        char,
        action: null,
        feedback,
        animate: guessesRevealed.value && canAnimate,
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
        setTimeout(() => {
          lastStableKeyFeedbacks.value = { ...props.keyFeedbacks }
        }, 450)
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
        <button
          v-for="{ char, action, feedback, animate } in row"
          :key="char"
          keyboard-test="keyboard-key"
          :data-letter="char"
          :data-letter-feedback="feedback"
          :class="[
            {
              'animate-jelly animate-duration-400': animate,
            },
            { 'min-w-12! sm:min-w-16!': !isLetter.test(char) },
            'key bg-gray-300',
            'data-[letter-feedback=correct]:bg-green-500',
            'data-[letter-feedback=almost]:bg-yellow-500',
            'data-[letter-feedback=incorrect]:bg-gray-500',
          ]"
          :disabled="disabled"
          @click="handleOnClick({ char, action, feedback, animate })"
        >
          {{ char }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'tailwindcss';

.key {
  @apply flex justify-center items-center rounded select-none text-white font-semibold min-w-8 min-h-11 text-base sm:min-w-12 sm:min-h-16 sm:text-xl cursor-pointer;
}
</style>
