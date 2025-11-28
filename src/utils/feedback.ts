export type Feedback = 'correct' | 'incorrect' | 'almost' | null
export type GuessFeedbackEntry = { guess: string; feedback: Feedback[] }

const buildTracker = (answer: string): Record<string, number> => {
  const tracker: Record<string, number> = {}

  for (const ch of answer) {
    tracker[ch] = (tracker[ch] ?? 0) + 1
  }

  return tracker
}

export const getFeedbackAtPosition = (
  charPosition: number,
  guess: string | undefined,
  answer: string | undefined,
): Feedback => {
  if (!guess || !answer) return null
  return getGuessFeedback(guess, answer)[charPosition] ?? null
}

type NonNullFeedback = Exclude<Feedback, null>

const feedbackRank: Record<NonNullFeedback, number> = {
  incorrect: 1,
  almost: 2,
  correct: 3,
}

export const getKeyFeedback = (char: string, guesses: GuessFeedbackEntry[]): Feedback => {
  let best: Feedback = null
  const target = char.toUpperCase()

  for (const { guess, feedback } of guesses) {
    for (let i = 0; i < guess.length; i++) {
      if (guess[i]?.toUpperCase() !== target) continue

      const fb = feedback[i]
      if (!fb) continue

      if (!best || feedbackRank[fb] > feedbackRank[best]) {
        best = fb
      }
    }
  }

  return best
}

export const getGuessFeedback = (guess: string, answer: string): Feedback[] => {
  const tracker = buildTracker(answer)

  const feedbacks: Feedback[] = Array(guess.length).fill(null)

  // CORRECT
  guess.split('').forEach((char, i) => {
    if (!char) return

    if (char === answer[i]) {
      feedbacks[i] = 'correct'
      tracker[char] = (tracker[char] ?? 0) - 1
    }
  })

  // ALMOST / INCORRECT
  guess.split('').forEach((char, i) => {
    if (!char) return
    if (feedbacks[i]) return

    const remaining = tracker[char] ?? 0

    if (remaining > 0) {
      feedbacks[i] = 'almost'
      tracker[char] = remaining - 1
    } else {
      feedbacks[i] = 'incorrect'
    }
  })

  return feedbacks
}
