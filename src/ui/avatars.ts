/**
 * Hand-drawn-looking characters, built from parameters rather than image files.
 * A child who cannot read picks their profile by the face, so the variants are
 * separated by things a five year old spots instantly: hair shape and colour.
 */
export interface Look {
  /** Background disc. */
  bg: string
  skin: string
  hair: string
  shirt: string
  style: 'short' | 'bob' | 'curly' | 'ponytail' | 'buzz' | 'long'
}

export const LOOKS: Look[] = [
  { bg: '#ffd9a8', skin: '#f2c49b', hair: '#5b3a29', shirt: '#e2685f', style: 'short' },
  { bg: '#c8e6f5', skin: '#f7d7bb', hair: '#e8a33d', shirt: '#3f8fbf', style: 'bob' },
  { bg: '#d8e8bd', skin: '#c98d63', hair: '#2f2119', shirt: '#5aa469', style: 'curly' },
  { bg: '#f6cfe0', skin: '#f6dcc4', hair: '#8a4b2a', shirt: '#c86aa0', style: 'ponytail' },
  { bg: '#cfd6f2', skin: '#8d5a3b', hair: '#1c1410', shirt: '#6a6fc4', style: 'buzz' },
  { bg: '#ffe1b0', skin: '#f4cfae', hair: '#c9743a', shirt: '#e8a33d', style: 'long' },
  { bg: '#bfe6dd', skin: '#e8c4a0', hair: '#4a4a52', shirt: '#2f9c8b', style: 'short' },
  { bg: '#eddcf7', skin: '#d9a878', hair: '#6b3f8f', shirt: '#9b6ec4', style: 'bob' },
]

export const AVATAR_COUNT = LOOKS.length
