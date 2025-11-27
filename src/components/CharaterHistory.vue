<script setup lang="ts">
const alphabetCharacters = 'qwertyuiop|asdfghjkl|zxcvbnm'

const keyboardRows = alphabetCharacters
  .toUpperCase()
  .split('|')
  .map((row) => row.split(''))
</script>
<template>
  <div class="inline-flex flex-col gap-2 rounded-xl p-4">
    <div v-for="(row, rowIndex) in keyboardRows" :key="rowIndex" class="flex gap-1 justify-center">
      <div v-for="char in row" :key="char" keyboard-test="keyboard-key" class="key">
        {{ char }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'tailwindcss';

.key {
  @apply flex justify-center items-center w-14 h-16 bg-gray-300 text-white font-semibold text-2xl rounded;
}
</style>
