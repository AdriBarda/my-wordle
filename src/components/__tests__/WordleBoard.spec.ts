import { vi } from 'vitest'
vi.mock('@/utils/throwConfetti', () => ({ throwConfetti: vi.fn() }))

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WordleBoard from '../WordleBoard.vue'
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE, WORD_SIZE } from '@/settings'
import * as confettiModule from '@/utils/throwConfetti'

describe('WordleBoard', () => {
  const wordOfTheDay = 'TESTS'
  let wrapper: ReturnType<typeof mount>
  beforeEach(() => {
    vi.clearAllMocks()
    // Arrange
    wrapper = mount(WordleBoard, { props: { wordOfTheDay } })
  })

  async function playerTypesGuess(guess: string) {
    await wrapper.find('input[type=text]').setValue(guess)
  }
  async function playerPressesEnter() {
    await wrapper.find('input[type=text]').trigger('keydown.enter')
  }

  async function playerTypesAndSubmitsGuess(guess: string) {
    await playerTypesGuess(guess)
    await playerPressesEnter()
  }
  describe('End of the game messages', () => {
    test('a victory message appears when the user makes a guess that matches the word of the day', async () => {
      const confettiSpy = vi.spyOn(confettiModule, 'throwConfetti')
      await playerTypesAndSubmitsGuess(wordOfTheDay)
      await nextTick()
      // Assert
      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
      expect(confettiSpy).toHaveBeenCalled()
    })

    describe.each([
      { numberOfGuesses: 0, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 1, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 2, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 3, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 4, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 5, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 6, shouldSeeDefeatMessage: true },
    ])(
      `a defeat message should show f a player makes ${MAX_GUESSES_COUNT} incorrect guesses in a row`,
      async ({ numberOfGuesses, shouldSeeDefeatMessage }) => {
        test(`therefore for ${numberOfGuesses} guess(es), a defeat message should ${shouldSeeDefeatMessage ? '' : 'not'} appear`, async () => {
          const confettiSpy = vi.spyOn(confettiModule, 'throwConfetti')
          for (let i = 0; i < numberOfGuesses; i++) {
            await playerTypesAndSubmitsGuess('STARS')
          }

          const msg = wrapper.find('[data-test="eog-message"]')
          const word = wrapper.find('[data-test="word-of-the-day"]')

          if (shouldSeeDefeatMessage) {
            expect(msg.exists()).toBe(true)
            expect(msg.text()).toContain(DEFEAT_MESSAGE)

            expect(word.exists()).toBe(true)
            expect(word.text()).toContain(wordOfTheDay)
          } else {
            expect(msg.exists()).toBe(false)
            expect(word.exists()).toBe(false)
          }

          expect(confettiSpy).not.toHaveBeenCalled()
        })
      },
    )

    test('no end-of-game message appears if the user has not yet made a guess', async () => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
  })

  describe('Rules for defining the word of the day', () => {
    beforeEach(() => {
      console.warn = vi.fn()
    })

    test.each([
      { wordOfTheDay: 'FLY', reason: `word-of-the-day must have ${WORD_SIZE} characters` },
      { wordOfTheDay: 'zesty', reason: 'word-of-the-day must be uppercase' },
      { wordOfTheDay: 'QWERT', reason: 'word-of-the-day must be a valid English word' },
    ])(
      'Because of $reason, $wordOfTheDay is invalid, therefore a warning must be emitted',
      async ({ wordOfTheDay }) => {
        mount(WordleBoard, { props: { wordOfTheDay } })
        expect(console.warn).toHaveBeenCalled()
      },
    )

    test(`No warning is emitted if the word of the day is a real, uppercase, ${WORD_SIZE} charactesrs English word`, async () => {
      mount(WordleBoard, { props: { wordOfTheDay: 'TESTS' } })
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('Player input', () => {
    test('player input remains in focus all the time', async () => {
      document.body.innerHTML = `<div id="app"></div>`
      wrapper = mount(WordleBoard, {
        props: { wordOfTheDay },
        attachTo: '#app',
      })

      expect(wrapper.find('input[type=text]').attributes('autofocus')).not.toBeUndefined()
      await wrapper.find('input[type=text]').trigger('blur')
      expect(document.activeElement).toBe(wrapper.find('input[type=text]').element)
    })

    test('input is cleared after submitting', async () => {
      await playerTypesAndSubmitsGuess('STARS')

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual('')
    })

    test(`player guesses are limited to ${WORD_SIZE} letters`, async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay + 'EXTRA')

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })
    test('player guesses can only be submitted if they are real words', async () => {
      await playerTypesAndSubmitsGuess('QWERT')

      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
    test('player guesses are not case-sensitive', async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay.toLowerCase())

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })
    test('player guesses can only contain letters', async () => {
      await playerTypesGuess('H3!RT')

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual('HRT')
    })
    test('non-letter characters do not render on the screen while being typed', async () => {
      await playerTypesGuess('333')

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual('')
    })

    test(`player can't add any more guesses after max amount of guesses has been reached`, async () => {
      const guesses = ['WRONG', 'GUESS', 'HELLO', 'WORLD', 'HAPPY', 'CODER']

      for (const guess of guesses) {
        await playerTypesAndSubmitsGuess(guess)
      }

      expect(
        wrapper.find<HTMLInputElement>('input[type=text]').attributes('disabled'),
      ).not.toBeUndefined()
    })

    test(`player can't keep adding after making a correct guess`, async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)

      expect(
        wrapper.find<HTMLInputElement>('input[type=text]').attributes('disabled'),
      ).not.toBeUndefined()
    })
  })

  test('all previous player guesses are visible in the page', async () => {
    const guesses = ['WRONG', 'GUESS', 'HELLO', 'WORLD', 'HAPPY', 'CODER']

    for (const guess of guesses) {
      await playerTypesAndSubmitsGuess(guess)
    }

    const rows = wrapper.findAll('[data-test="guess-row"]')
    expect(rows).toHaveLength(guesses.length)

    rows.forEach((rowWrapper, i) => {
      const fronts = rowWrapper.findAll('.face-front')
      const word = fronts.map((f) => f.text()).join('')
      expect(word).toBe(guesses[i])
    })
  })

  describe('Displaying feedback to the player', () => {
    test('feedback not displayed until player submits guess', async () => {
      expect(
        wrapper.find('[data-letter-feedback]').exists(),
        'Feedback was being rendered before the player started typing his/her guess',
      ).toBe(false)

      await playerTypesGuess(wordOfTheDay)
      expect(
        wrapper.find('[data-letter-feedback]').exists(),
        'Feedback was being rendered while the player was typing his/her guess',
      ).toBe(false)

      await playerPressesEnter()
      expect(
        wrapper.find('[data-letter-feedback]').exists(),
        'Feedback was not rendered after the player submitted his/her guess',
      ).toBe(true)
    })
  })
  describe.each([
    {
      position: 0,
      expectedFeedback: 'correct',
      reason: "P is the first character of both 'PLANT' and 'PAPER'",
    },
    {
      position: 1,
      expectedFeedback: 'almost',
      reason: "A exists in both words but it's in position '2' of 'PLANT'",
    },
    {
      position: 2,
      expectedFeedback: 'incorrect',
      reason:
        "P exists in both words, exists only once in 'PLANT' and it's already marked as correct in position '0' of 'PLANT'",
    },
    {
      position: 3,
      expectedFeedback: 'incorrect',
      reason: "E does not exist in 'PLANT'",
    },
    {
      position: 4,
      expectedFeedback: 'incorrect',
      reason: "R does not exist in 'PLANT'",
    },
  ])(
    "If the word of the day is 'PLANT' and the player types 'PAPER'",
    async ({ position, expectedFeedback, reason }) => {
      const wordOfTheDay = 'PLANT'
      const guess = 'PAPER'

      test(`the feedback for '${guess[position]}' (index: ${position}) should be '${expectedFeedback}' because '${reason}'`, async () => {
        wrapper = mount(WordleBoard, { props: { wordOfTheDay } })

        await playerTypesAndSubmitsGuess(guess)

        const currentFeedback = wrapper
          .findAll('[data-letter]')
          .at(position)
          ?.attributes('data-letter-feedback')

        expect(currentFeedback).toEqual(expectedFeedback)
      })
    },
  )
  describe('on-screen keyboard', () => {
    test('A keyboard with all english alphabet characters renders on screen', async () => {
      const keyboardChars = 'qwertyuiopasdfghjkl⏎zxcvbnm⌫'

      const keyboardCharsList = keyboardChars.toUpperCase().split('')

      const keyboardKeys = wrapper.findAll('[keyboard-test="keyboard-key"]')

      expect(keyboardKeys).toHaveLength(keyboardCharsList.length)

      keyboardKeys.forEach((keyWrapper, i) => {
        const renderedKey = keyWrapper.text()
        expect(renderedKey).toBe(keyboardCharsList[i])
      })
    })

    test('all keys in on-screen keyboard are clickable', async () => {
      const keyboardKeys = wrapper.findAll('[keyboard-test="keyboard-key"]')

      expect(keyboardKeys.length).toBeGreaterThan(0)

      const firstRowLetters = keyboardKeys.slice(0, WORD_SIZE)

      for (const keyWrapper of firstRowLetters) {
        const keyChar = keyWrapper.text()

        await keyWrapper.trigger('click')
        await nextTick()
        const inputValue = wrapper.find<HTMLInputElement>('input[type=text]').element.value
        expect(inputValue.endsWith(keyChar)).toBe(true)
      }
    })

    test('backspace removes the last character typed from on-screen keyboard', async () => {
      const inputSelector = 'input[type=text]'
      const keys = wrapper.findAll('[keyboard-test="keyboard-key"]')
      const getKey = (char: string) => keys.find((key) => key.text() === char)!

      await getKey('A')?.trigger('click')
      await getKey('B')?.trigger('click')
      await nextTick()
      expect(wrapper.find<HTMLInputElement>(inputSelector).element.value).toBe('AB')

      await getKey('⌫')?.trigger('click')
      await nextTick()
      expect(wrapper.find<HTMLInputElement>(inputSelector).element.value).toBe('A')
    })

    test('submit key sends a valid guess typed via on-screen keyboard', async () => {
      const inputSelector = 'input[type=text]'
      const keys = wrapper.findAll('[keyboard-test="keyboard-key"]')
      const getKey = (char: string) => keys.find((key) => key.text() === char)!

      for (const char of wordOfTheDay) {
        await getKey(char)?.trigger('click')
      }
      await getKey('⏎')?.trigger('click')
      await nextTick()

      const rows = wrapper.findAll('[data-test="guess-row"]')
      const submittedWords = rows
        .map((row) => row.findAll('.face-front').map((f) => f.text()).join(''))
        .filter((word) => word.trim().length)

      expect(submittedWords.at(-1)).toBe(wordOfTheDay)
      expect(wrapper.find<HTMLInputElement>(inputSelector).element.value).toBe('')
    })

    test('on-screen keyboard ignores extra letters beyond word size', async () => {
      const inputSelector = 'input[type=text]'
      const keys = wrapper.findAll('[keyboard-test="keyboard-key"]')

      const letterKeys = keys.filter((key) => /^[A-Z]$/.test(key.text()))
      for (let i = 0; i < WORD_SIZE + 2; i++) {
        await letterKeys[i % letterKeys.length]?.trigger('click')
      }
      await nextTick()

      expect(wrapper.find<HTMLInputElement>(inputSelector).element.value.length).toBe(WORD_SIZE)
    })

    test('on-screen keyboard does nothing when game is over', async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)
      await nextTick()

      const inputSelector = 'input[type=text]'
      const initialValue = wrapper.find<HTMLInputElement>(inputSelector).element.value

      const keyboardKeys = wrapper.findAll('[keyboard-test="keyboard-key"]')
      await keyboardKeys.find((key) => key.text() === 'A')?.trigger('click')
      await nextTick()

      expect(wrapper.find<HTMLInputElement>(inputSelector).element.value).toBe(initialValue)
    })
  })
})
