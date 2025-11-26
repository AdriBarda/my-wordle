<script setup lang="ts">
import { WORD_SIZE } from '@/settings'

const props = defineProps<{
  guess?: string
  answer?: string
}>()

const getFeedback = (letterPosition: number) => {
  if (!props.answer) return null

  return props.guess && props.answer[letterPosition] === props.guess[letterPosition]
    ? 'correct'
    : 'incorrect'
}
</script>

<template>
  <ul class="flex flex-nowrap gap-2 mb-2" data-test="guess-row">
    <li
      v-for="(char, index) in guess?.padEnd(WORD_SIZE, ' ') || new Array(5)"
      :key="index"
      class="w-20 h-20 perspective-midrange"
      :data-letter="char"
      :data-letter-feedback="getFeedback(index)"
    >
      <div
        class="inner w-full h-full relative transform-3d"
        :class="[
          answer && 'animate-flip-vertical animate-duration-400',
          answer &&
            [
              'animate-delay-0',
              'animate-delay-100',
              'animate-delay-200',
              'animate-delay-300',
              'animate-delay-400',
            ][index],
        ]"
      >
        <div class="face face-front">{{ char }}</div>
        <div class="face face-back bg-gray-400 text-white">{{ char }}</div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
@import 'tailwindcss';

.face {
  @apply flex items-center justify-center w-full h-full font-semibold text-3xl absolute inset-0;
  backface-visibility: hidden;
}

.face-front {
  @apply border border-gray-500 rotate-x-0;
}

.face-back {
  @apply border-none rotate-x-180;
}
</style>
