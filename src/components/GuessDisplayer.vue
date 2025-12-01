<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import { getFeedbackAtPosition } from '@/utils/feedback'
import type { Feedback } from '@/utils/feedback'

defineProps<{
  guess?: string
  answer?: string
  feedbacks?: Feedback[]
}>()
</script>

<template>
  <ul class="flex flex-nowrap gap-1" data-test="guess-row">
    <li
      v-for="(char, index) in guess?.padEnd(WORD_SIZE, ' ') || new Array(5)"
      :key="index"
      class="w-12 h-12 sm:w-16 sm:h-16 perspective-midrange"
    >
      <div
        class="inner w-full h-full relative transform-3d"
        :class="[
          (feedbacks || answer) && 'animate-flip-vertical animate-duration-400',
          (feedbacks || answer) &&
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
        <div
          :data-letter="char"
          :data-letter-feedback="
            feedbacks ? feedbacks[index] : getFeedbackAtPosition(index, guess, answer)
          "
          :class="[
            'face face-back text-white',
            'data-[letter-feedback=correct]:bg-green-500',
            'data-[letter-feedback=almost]:bg-yellow-500',
            'data-[letter-feedback=incorrect]:bg-gray-500',
          ]"
        >
          {{ char }}
        </div>
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
