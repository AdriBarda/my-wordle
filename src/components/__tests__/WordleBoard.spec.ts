import { mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE, WORD_SIZE } from '@/settings'

describe('WordleBoard', () => {
  const wordOfTheDay = 'TESTS'
  let wrapper: ReturnType<typeof mount>
  beforeEach(() => {
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
      await playerTypesAndSubmitsGuess(wordOfTheDay)
      // Assert
      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })

    describe.each([
      { numberOfGuesses: 0, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 1, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 2, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 3, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 4, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 5, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 6, shouldSeeDefeatMessage: false },
    ])(
      `a defeat message should show f a player makes ${MAX_GUESSES_COUNT} incorrect guesses in a row`,
      async ({ numberOfGuesses, shouldSeeDefeatMessage }) => {
        test(`therefore for ${numberOfGuesses} guess(es), a defeat message should ${shouldSeeDefeatMessage ? '' : 'not'} appear`, async () => {
          for (let i = 0; i > numberOfGuesses; i++) {
            await playerTypesAndSubmitsGuess('STARS')
          }

          if (shouldSeeDefeatMessage) {
            expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
          } else {
            expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
          }
        })
      },
    )

    test('no ent-of-game message appears if the user has not yet made a guess', async () => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
  })

  describe('Rule sfor defining the word of the day', () => {
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
      reason: "W is the first character of both 'WORLD' and 'WRONG'",
    },
    {
      position: 1,
      expectedFeedback: 'almost',
      reason: "R exists in both words but it's in position '2' of 'WORLD'",
    },
    {
      position: 2,
      expectedFeedback: 'almost',
      reason: "O exists in both words but it's in position '1' of 'WORLD'",
    },
    {
      position: 3,
      expectedFeedback: 'incorrect',
      reason: "N does not exist in 'WORLD'",
    },
    {
      position: 4,
      expectedFeedback: 'incorrect',
      reason: "G does not exist in 'WORLD'",
    },
  ])(
    "If the word of the day is 'WORLD' and the player types 'WRONG'",
    async ({ position, expectedFeedback, reason }) => {
      const wordOfTheDay = 'WORLD'
      const guess = 'WRONG'

      test.skipIf(expectedFeedback !== 'correct')(
        `the feedback for '${guess[position]}' (index: ${position}) should be '${expectedFeedback}' because '${reason}'`,
        async () => {
          wrapper = mount(WordleBoard, { props: { wordOfTheDay } })

          await playerTypesAndSubmitsGuess(guess)

          const currentFeedback = wrapper
            .findAll('[data-letter]')
            .at(position)
            ?.attributes('data-letter-feedback')

          expect(currentFeedback).toEqual(expectedFeedback)
        },
      )
    },
  )
})
