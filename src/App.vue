<script setup lang="ts">
import { ref } from 'vue'
import WordleBoard from './components/WordleBoard.vue'

const msg = ref('TESTS')
</script>

<template>
  <main
    id="#main"
    class="relative flex flex-col justify-center items-center min-h-screen w-full px-4 py-10"
  >
    <WordleBoard :word-of-the-day="msg" />
  </main>
</template>
