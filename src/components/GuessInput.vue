<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import { computed, watch, ref } from 'vue'
import GuessDisplayer from './GuessDisplayer.vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const guessIsInvalid = ref(false)

const sanitise = (value: string) =>
  value
    .slice(0, WORD_SIZE)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')

const guess = computed(() => props.modelValue ?? '')

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const clean = sanitise(target.value)
  if (clean !== target.value) {
    target.value = clean
  }
  emit('update:modelValue', clean)
}

watch(
  () => props.invalid,
  (flag) => {
    if (flag) {
      guessIsInvalid.value = true
      setTimeout(() => (guessIsInvalid.value = false), 500)
    }
  },
)

const onSubmit = () => emit('submit')
</script>
<template>
  <section>
    <GuessDisplayer
      v-if="!disabled"
      :guess="guess"
      :class="{ 'animate-shake animate-duration-250': guessIsInvalid }"
    />
    <input
      type="text"
      :value="guess"
      class="opacity-0 absolute -z-10"
      :maxlength="WORD_SIZE"
      autofocus
      :disabled="disabled"
      @input="onInput"
      @blur="({ target }) => (target as HTMLInputElement).focus()"
      @keydown.enter.prevent="onSubmit"
    />
  </section>
</template>
