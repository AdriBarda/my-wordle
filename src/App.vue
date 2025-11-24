<script setup lang="ts">
import { ref } from 'vue'
import WordleBoard from './components/WordleBoard.vue'

const msg = ref('TESTS')
</script>

<template>
  <h1>You did it!</h1>
  <WordleBoard :word-of-the-day="msg" />
</template>
