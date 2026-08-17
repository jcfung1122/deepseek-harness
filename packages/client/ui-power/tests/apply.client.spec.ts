// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index.ts'

const okResult = (): { ok: true; value: { ok: true } } => ({ ok: true, value: { ok: true } })

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  const power = {
    shutdown: vi.fn(async () => okResult()),
    restart: vi.fn(async () => okResult()),
  }
  ctx.provide('remote', { power } as never)
  ctx.provide('remote.power', power as never)
  const slots = ctx.get('slots') as SlotRegistry
  slots.register(
    { name: 'root', children: { 'sidebar.power': { kind: 'single', scope: 'root' } } } as never,
    () => null,
  )
  return { ctx, slots, power }
}

afterEach(() => { vi.clearAllMocks() })

describe('ui-power apply', () => {
  it('declares its services', () => {
    expect(inject).toEqual(['slots', 'locale', 'remote', 'remote.power'])
  })

  it('registers the power button into sidebar.power with the remote face', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.slots.entries('sidebar.power')).toHaveLength(1)
    const entry = b.slots.entries('sidebar.power')[0]!
    expect(entry.locale).toBe('power')

    const face = (entry.inject as () => { shutdown: () => Promise<void>; restart: () => Promise<void> })()
    await face.shutdown()
    expect(b.power.shutdown).toHaveBeenCalledExactlyOnceWith()
    await face.restart()
    expect(b.power.restart).toHaveBeenCalledExactlyOnceWith()
  })

  it('surfaces a Remote failure as a rejection', async () => {
    const b = await bench()
    b.power.shutdown.mockResolvedValueOnce({ ok: false, error: { code: 'x', message: 'boom' } } as never)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const entry = b.slots.entries('sidebar.power')[0]!
    const face = (entry.inject as () => { shutdown: () => Promise<void> })()
    await expect(face.shutdown()).rejects.toThrow('boom')
  })

  it('surfaces a restart Remote failure as a rejection', async () => {
    const b = await bench()
    b.power.restart.mockResolvedValueOnce({ ok: false, error: { code: 'x', message: 'restart failed' } } as never)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const entry = b.slots.entries('sidebar.power')[0]!
    const face = (entry.inject as () => { restart: () => Promise<void> })()
    await expect(face.restart()).rejects.toThrow('restart failed')
  })
})
