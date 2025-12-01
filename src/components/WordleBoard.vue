<script setup lang="ts">
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE, WORD_SIZE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import GuessInput from './GuessInput.vue'
import GuessDisplayer from './GuessDisplayer.vue'
import CharaterHistory from './CharacterHistory.vue'
import { throwConfetti } from '@/utils/throwConfetti'
import { type Origin } from 'canvas-confetti'
import { getGuessFeedback, getKeyFeedback } from '@/utils/feedback'
import type { Feedback, GuessFeedbackEntry, KeyboardKey } from '@/types'
import { isLetter } from '@/utils/validations'

const props = defineProps({
  wordOfTheDay: {
    type: String,
    required: true,
    validator: (wordGiven: string) => englishWords.includes(wordGiven),
  },
})

const guessesSubmitted = ref<GuessFeedbackEntry[]>([])
const guessInProgress = ref('')
const invalidGuess = ref(false)

const manualClose = ref(false)

const flashTimeoutId = ref<number | null>(null)

const isVictory = computed(() =>
  guessesSubmitted.value.some((entry) => entry.guess === props.wordOfTheDay),
)

const isDefeat = computed(
  () => !isVictory.value && guessesSubmitted.value.length === MAX_GUESSES_COUNT,
)

const isGameOver = computed(() => isVictory.value || isDefeat.value)

const throwRealisticConfetti = (origin: Origin = { y: 0.7 }) => {
  throwConfetti(
    200,
    {
      origin: origin,
    },
    0.25,
    {
      spread: 26,
      startVelocity: 55,
    },
  )

  throwConfetti(
    200,
    {
      origin: origin,
    },
    0.2,
    {
      spread: 60,
    },
  )
  throwConfetti(
    200,
    {
      origin: origin,
    },
    0.35,
    {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    },
  )
  throwConfetti(
    200,
    {
      origin: origin,
    },
    0.1,
    {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    },
  )
  throwConfetti(
    200,
    {
      origin: origin,
    },
    0.25,
    {
      spread: 120,
      startVelocity: 45,
    },
  )
}

watch(isVictory, () => throwRealisticConfetti({ y: 0.9 }))

const emptyGuessesCount = computed(() => {
  const remainingGuesses = MAX_GUESSES_COUNT - guessesSubmitted.value.length

  return isGameOver.value ? remainingGuesses : remainingGuesses - 1
})

const submittedGuesses = computed(() => guessesSubmitted.value.map(({ guess }) => guess))

const keyFeedbacks = computed<Record<string, Feedback>>(() => {
  const feedbacks: Record<string, Feedback> = {}
  const usedLetters = new Set<string>()

  guessesSubmitted.value.forEach(({ guess }) => {
    guess.split('').forEach((char) => {
      if (char) usedLetters.add(char.toUpperCase())
    })
  })

  usedLetters.forEach((char) => {
    feedbacks[char] = getKeyFeedback(char, guessesSubmitted.value)
  })

  return feedbacks
})

const flashInvalid = () => {
  if (flashTimeoutId.value !== null) clearTimeout(flashTimeoutId.value)

  invalidGuess.value = true
  flashTimeoutId.value = setTimeout(() => {
    invalidGuess.value = false
    flashTimeoutId.value = null
  }, 500)
}

onBeforeUnmount(() => {
  if (flashTimeoutId.value !== null) clearTimeout(flashTimeoutId.value)
})

const submitGuess = () => {
  if (isGameOver.value) return

  const candidate = guessInProgress.value
  if (candidate.length !== WORD_SIZE || !englishWords.includes(candidate)) {
    flashInvalid()
    return
  }

  guessesSubmitted.value.push({
    guess: candidate,
    feedback: getGuessFeedback(candidate, props.wordOfTheDay),
  })

  guessInProgress.value = ''
}

const handleKeyboardAction = (event: KeyboardKey) => {
  if (isGameOver.value) return
  if (isLetter(event.char) && guessInProgress.value.length < WORD_SIZE) {
    guessInProgress.value = guessInProgress.value.concat(event.char)
  } else {
    if (event.action === 'delete' && guessInProgress.value.length > 0) {
      guessInProgress.value = guessInProgress.value.slice(0, -1)
    }
    if (event.action === 'submit') submitGuess()
  }
}
</script>

<template>
  <section class="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto px-4 pb-10 pt-2">
    <h1 class="text-3xl sm:text-5xl py-3 font-semibold font-mono">My Wordle Version</h1>
    <ul class="m-0 p-0 flex flex-col items-center gap-1 w-full">
      <li v-for="(guess, index) in guessesSubmitted" :key="`${index}-${guess.guess}`">
        <GuessDisplayer :guess="guess.guess" :feedbacks="guess.feedback" />
      </li>
      <li class="w-full flex justify-center">
        <GuessInput
          v-model="guessInProgress"
          :disabled="isGameOver"
          :invalid="invalidGuess"
          @submit="submitGuess"
        />
      </li>
      <li v-for="i in emptyGuessesCount" :key="`remaining-guess${i}`">
        <GuessDisplayer />
      </li>
    </ul>
    <CharaterHistory
      :guesses="submittedGuesses"
      :key-feedbacks="keyFeedbacks"
      :disabled="isGameOver"
      @char-submitted="handleKeyboardAction"
    />
  </section>
  <div
    v-if="isGameOver && !manualClose"
    class="fixed flex flex-col items-center justify-center text-3xl sm:text-4xl leading-snug text-center bg-white/90 border rounded-3xl shadow-2xl w-[min(90vw,32rem)] min-h-64 px-6 py-10 top-1/2 left-1/2 -translate-1/2 z-10 animate-tada animate-duration-400"
  >
    <p data-test="eog-message" v-text="isVictory ? VICTORY_MESSAGE : DEFEAT_MESSAGE" />
    <div v-if="isDefeat" class="text-lg" data-test="word-of-the-day">
      The word of the day was
      <span class="font-bold">
        {{ isDefeat ? wordOfTheDay : '' }}
      </span>
    </div>
    <button class="cursor-pointer text-sm" @click="() => (manualClose = true)">Review board</button>
  </div>
</template>
