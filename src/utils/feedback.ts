export type Feedback = null | 'correct' | 'incorrect' | 'almost'

export const getFeedbackAtPosition = (
  charPosition: number,
  guess: string | undefined,
  answer: string | undefined,
): Feedback => {
  if (!guess || !answer) return null

  const letterGuessed = guess[charPosition]
  const letterExpected = answer[charPosition]

  if (!letterGuessed) return null

  if (!answer.includes(letterGuessed)) return 'incorrect'

  return letterExpected === letterGuessed ? 'correct' : 'almost'
}

const feedbackRank: Record<Exclude<Feedback, null>, number> = {
  incorrect: 1,
  almost: 2,
  correct: 3,
}

export const getKeyFeedback = (char: string, guesses: string[], answer: string): Feedback => {
  let best: Feedback = null
  guesses.forEach((guess) => {
    for (let i = 0; i < guess.length; i++) {
      if (guess[i]?.toUpperCase() !== char.toUpperCase()) continue

      const feedback = getFeedbackAtPosition(i, guess, answer)

      if (feedback && (!best || feedbackRank[feedback] > feedbackRank[best])) best = feedback
    }
  })
  return best
}
