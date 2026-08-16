// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('ui-color-accents apply', () => {
  it('declares the theme service as its dependency', () => {
    expect(inject).toEqual(['theme'])
  })

  it('stacks the brand-blue token layer and installs the git decorator', async () => {
    const disposeOverride = vi.fn()
    const overrideTokens = vi.fn((_source: string, _tokens: unknown) => disposeOverride)
    const ctx = new Context()
    ctx.provide('theme', { overrideTokens } as never)

    const fiber = ctx.plugin({ inject: ['theme'], apply })
    await fiber.await()

    expect(overrideTokens).toHaveBeenCalledTimes(1)
    const [source, tokens] = overrideTokens.mock.calls[0]!
    expect(source).toBe('ui-color-accents')
    expect(tokens).toEqual({
      '--dsw-alias-brand-primary': {
        light: 'var(--dsw-alias-state-business-primary)',
        dark: 'var(--dsw-alias-state-business-primary)',
      },
      '--dsw-alias-button-primary-fill': {
        light: 'var(--dsw-static-neutral-bluish-1000)',
        dark: 'var(--dsw-static-neutral-bluish-50)',
      },
    })

    // The decorator is live: a badge inserted after apply is decorated.
    const added = document.createElement('span')
    added.className = 'W-zNGW_gitBadge'
    added.textContent = 'A'
    document.body.append(added)
    await vi.waitFor(() => {
      expect(added.getAttribute('data-dsh-git-kind')).toBe('added')
    })

    await fiber.dispose()
    expect(disposeOverride).toHaveBeenCalledTimes(1)
  })
})
