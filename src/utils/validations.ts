export const IS_LETTER_REGEX = /^[A-Z]$/
export const isLetter = (char: string): boolean => IS_LETTER_REGEX.test(char)
