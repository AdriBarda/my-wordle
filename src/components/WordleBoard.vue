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
import EndOfGameModal from './EndOfGameModal.vue'

const props = defineProps({
  wordOfTheDay: {
    type: String,
    required: true,
    validator: (wordGiven: string) => englishWords.includes(wordGiven),
  },
})

const emit = defineEmits<{
  'play-again': []
}>()

const guessesSubmitted = ref<GuessFeedbackEntry[]>([])
const guessInProgress = ref('')
const invalidGuess = ref(false)

const flashTimeoutId = ref<number | null>(null)

const playAgain = () => {
  guessesSubmitted.value = []
  guessInProgress.value = ''
  invalidGuess.value = false
  if (flashTimeoutId.value !== null) {
    clearTimeout(flashTimeoutId.value)
    flashTimeoutId.value = null
  }
  endOfGameModal.value?.close()
  emit('play-again')
}

const isVictory = computed(() =>
  guessesSubmitted.value.some((entry) => entry.guess === props.wordOfTheDay),
)

const isDefeat = computed(
  () => !isVictory.value && guessesSubmitted.value.length === MAX_GUESSES_COUNT,
)

const isGameOver = computed(() => isVictory.value || isDefeat.value)

watch(isGameOver, (newVal) => {
  if (newVal) {
    openEndOfGameModal()
  }
})

const endOfGameModal = ref<InstanceType<typeof EndOfGameModal> | null>(null)

const openEndOfGameModal = () => {
  endOfGameModal.value?.open()
}

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

watch(isVictory, (newVal) => {
  if (newVal) {
    throwRealisticConfetti({ y: 0.9 })
  }
})

const emptyGuessesCount = computed(() => {
  const remainingGuesses = MAX_GUESSES_COUNT - guessesSubmitted.value.length

  return Math.max(remainingGuesses - 1, 0)
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
    <div class="flex items-center gap-5">
      <button
        v-if="isGameOver"
        class="py-1 px-3 bg-black text-white rounded-lg hover:bg-gray-800 hover:scale-110 transition duration-100 ease-in-out cursor-pointer"
        @click="playAgain"
      >
        Play Again
      </button>
      <button
        v-if="isGameOver"
        class="py-1 px-3 bg-white text-gray-800 rounded-lg hover:bg-gray-200 hover:text-gray-500 hover:scale-110 transition duration-100 ease-in-out border border-black cursor-pointer"
        @click="openEndOfGameModal"
      >
        View Result
      </button>
    </div>
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
  <EndOfGameModal ref="endOfGameModal">
    <p data-test="eog-message" v-text="isVictory ? VICTORY_MESSAGE : DEFEAT_MESSAGE" />
    <div v-if="isDefeat" class="text-lg" data-test="word-of-the-day">
      The word of the day was
      <span class="font-bold">
        {{ wordOfTheDay }}
      </span>
    </div>
  </EndOfGameModal>
</template>
