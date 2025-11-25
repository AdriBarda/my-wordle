<script setup lang="ts">
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { computed, ref } from 'vue'
import GuessInput from './GuessInput.vue'
import GuessDisplayer from './GuessDisplayer.vue'

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
</script>

<template>
  <div
    :class="[guessesSubmitted ? 'block' : 'hidden', 'absolute w-screen h-screen bg-black/10']"
  ></div>
  <ul class="m-0 p-0">
    <li v-for="(guess, index) in guessesSubmitted" :key="`${index}-${guess}`">
      <GuessDisplayer :guess="guess" />
    </li>
  </ul>
  <p
    v-if="isGameOver"
    v-text="guessesSubmitted.includes(wordOfTheDay) ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
    class="absolute flex items-center justify-center text-4xl text-pretty text-center text-white bg-black rounded-3xl shadow-lg w-[750px] h-96 top-1/2 left-1/2 -translate-1/2 z-10"
  />
  <GuessInput @guess-submitted="(guess) => guessesSubmitted.push(guess)" />
</template>
