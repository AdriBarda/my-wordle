<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import { computed, watch, ref, nextTick } from 'vue'
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
const inputRef = ref<HTMLInputElement | null>(null)

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

// Waiting for DOM update to focus input
watch(
  () => props.disabled,
  (isDisabled) => {
    if (!isDisabled) {
      nextTick(() => inputRef.value?.focus())
    }
  },
  { immediate: true },
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
      ref="inputRef"
      type="text"
      :value="guess"
      class="absolute inset-0 w-px h-px opacity-0 pointer-events-none caret-transparent text-transparent bg-transparent border-0 outline-none"
      :maxlength="WORD_SIZE"
      :disabled="disabled"
      inputmode="none"
      aria-hidden="true"
      tabindex="-1"
      autofocus
      @input="onInput"
      @keydown.enter.prevent="onSubmit"
    />
  </section>
</template>
