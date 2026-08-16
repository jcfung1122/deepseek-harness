import { describe, expect, it } from 'vitest'
import { classifyRef, classifyStatusLetter } from '../src/client/classify.ts'

describe('classifyStatusLetter', () => {
  it('maps every status letter to its semantic kind', () => {
    expect(classifyStatusLetter('A')).toBe('added')
    expect(classifyStatusLetter('D')).toBe('deleted')
    expect(classifyStatusLetter('M')).toBe('modified')
    expect(classifyStatusLetter('R')).toBe('renamed')
    expect(classifyStatusLetter('C')).toBe('copied')
    expect(classifyStatusLetter('U')).toBe('unmerged')
    expect(classifyStatusLetter('T')).toBe('typechange')
    expect(classifyStatusLetter('?')).toBe('untracked')
  })

  it('returns null for letters that carry no status', () => {
    expect(classifyStatusLetter('')).toBeNull()
    expect(classifyStatusLetter(' ')).toBeNull()
    expect(classifyStatusLetter('X')).toBeNull()
  })
})

describe('classifyRef', () => {
  it('classifies tag, head, remote, and branch labels', () => {
    expect(classifyRef('tag: v1.0.0')).toBe('tag')
    expect(classifyRef('HEAD -> main')).toBe('head')
    expect(classifyRef('HEAD')).toBe('head')
    expect(classifyRef('origin/main')).toBe('remote')
    expect(classifyRef('upstream/main')).toBe('remote')
    expect(classifyRef('main')).toBe('branch')
    expect(classifyRef('feature/x')).toBe('branch')
  })

  it('trims surrounding whitespace and falls back to branch', () => {
    expect(classifyRef('  origin/main  ')).toBe('remote')
    expect(classifyRef('')).toBe('branch')
  })
})
