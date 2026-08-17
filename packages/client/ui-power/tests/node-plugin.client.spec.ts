import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'

describe('ui-power node plugin', () => {
  it('mounts as a no-op host half', async () => {
    const ctx = new Context()
    await ctx.plugin({ apply }).await()
    expect(ctx).toBeDefined()
  })
})
