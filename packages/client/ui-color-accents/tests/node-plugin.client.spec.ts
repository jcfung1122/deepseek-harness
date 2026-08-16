import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'

describe('ui-color-accents node plugin', () => {
  it('mounts as a no-op host half', async () => {
    const ctx = new Context()
    await ctx.plugin({ apply }).await()
    // The whole feature is browser presentation; the host half owns nothing.
    expect(ctx).toBeDefined()
  })
})
