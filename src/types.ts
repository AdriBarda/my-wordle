import type { Feedback, GuessFeedbackEntry } from '@/utils/feedback'

export type { Feedback, GuessFeedbackEntry }

export type KeyboardAction = 'submit' | 'delete' | null

export interface KeyboardKey {
  char: string
  action: KeyboardAction
  feedback: Feedback
  animate: boolean
}
