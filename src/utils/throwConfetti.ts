import confetti, { type Options, type Origin } from 'canvas-confetti'

interface defaults {
  origin: Origin
}

export const throwConfetti = (
  count: number,
  defaults: defaults,
  particleRatio: number,
  opts: Options,
) => {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  })
}
