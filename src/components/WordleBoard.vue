<script setup lang="ts">
import { DEFEAT_MESSAGE, VICTORY_MESSAGE } from '@/settings'
import englishWords from '@/englishWordsWith5Letters.json'
import { ref } from 'vue'
import GuessInput from './GuessInput.vue'

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => englishWords.includes(wordGiven),
  },
})

const guessSubmitted = ref('')
</script>

<template>
  <div
    :class="[guessSubmitted ? 'block' : 'hidden', 'absolute w-screen h-screen bg-black/10']"
  ></div>
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
    class="absolute flex items-center justify-center text-4xl text-pretty text-center text-white bg-black rounded-3xl shadow-lg w-[750px] h-96 top-1/2 left-1/2 -translate-1/2 z-10"
  />
  <GuessInput @guess-submitted="(guess) => (guessSubmitted = guess)" />
</template>
