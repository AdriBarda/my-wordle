<script setup lang="ts">
import { ref } from 'vue'
import WordleBoard from './components/WordleBoard.vue'

import englishWords from '@/englishWordsWith5Letters.json'

const getRandomWord = (): void => {
  const index = Math.floor(Math.random() * englishWords.length)
  wordOfTheDay.value = englishWords[index]!
}
const wordOfTheDay = ref('')
getRandomWord()
</script>

<template>
  <main
    id="#main"
    class="relative flex flex-col justify-center items-center min-h-screen w-full px-4 py-6 sm:py-10"
  >
    <WordleBoard :word-of-the-day="wordOfTheDay" @play-again="getRandomWord" />
  </main>
</template>
