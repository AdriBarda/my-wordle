<script setup lang="ts">
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { computed, ref } from 'vue'
import GuessInput from './GuessInput.vue'
import GuessDisplayer from './GuessDisplayer.vue'
import CharaterHistory from './CharacterHistory.vue'

const props = defineProps({
  wordOfTheDay: {
    type: String,
    required: true,
    validator: (wordGiven: string) => englishWords.includes(wordGiven),
  },
})

const guessesSubmitted = ref<string[]>([])

const isGameOver = computed(
  () =>
    guessesSubmitted.value.length === MAX_GUESSES_COUNT ||
    guessesSubmitted.value.includes(props.wordOfTheDay),
)

const emptyGuessesCount = computed(() => {
  const remainingGuesses = MAX_GUESSES_COUNT - guessesSubmitted.value.length

  return isGameOver.value ? remainingGuesses : remainingGuesses - 1
})
</script>

<template>
  <div
    :class="[
      guessesSubmitted ? 'block' : 'hidden',
      'fixed inset-0 bg-black/10 pointer-events-none',
    ]"
  ></div>
  <section class="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto px-4 pb-10 pt-2">
    <h1 class="text-3xl sm:text-5xl py-3 font-semibold font-mono">My Wordle Version</h1>
    <ul class="m-0 p-0 flex flex-col items-center gap-1 w-full">
      <li v-for="(guess, index) in guessesSubmitted" :key="`${index}-${guess}`">
        <GuessDisplayer :guess="guess" :answer="wordOfTheDay" />
      </li>
      <li class="w-full flex justify-center">
        <GuessInput
          :disabled="isGameOver"
          @guess-submitted="(guess) => guessesSubmitted.push(guess)"
        />
      </li>
      <li v-for="i in emptyGuessesCount" :key="`remaining-guess${i}`">
        <GuessDisplayer />
      </li>
    </ul>
    <CharaterHistory :guesses="guessesSubmitted" :answer="wordOfTheDay" />
  </section>
  <p
    v-if="isGameOver"
    v-text="guessesSubmitted.includes(wordOfTheDay) ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
    class="fixed flex items-center justify-center text-3xl sm:text-4xl leading-snug text-center text-white bg-black rounded-3xl shadow-lg w-[min(90vw,32rem)] min-h-[16rem] px-6 py-10 top-1/2 left-1/2 -translate-1/2 z-10 animate-tada animate-duration-400"
  />
</template>
