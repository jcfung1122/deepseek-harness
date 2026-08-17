import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import { PowerGateway } from '../src/index.ts'

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({ unref: vi.fn() })),
}))

const mockedSpawn = vi.mocked(spawn)

/** Build a context with the launcher services the gateway reads. */
function bench(exit?: (code: number) => void): { ctx: Context; gateway: PowerGateway } {
  const ctx = new Context()
  if (exit !== undefined) ctx.provide('appExit', exit)
  ctx.provide('webServer', { port: 3080 } as never)
  return { ctx, gateway: new PowerGateway(ctx) }
}

describe('PowerGateway', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('shutdown defers a graceful exit and acknowledges', () => {
    const exit = vi.fn()
    const { gateway } = bench(exit)
    expect(gateway.shutdown()).toEqual({ ok: true })
    expect(exit).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('shutdown falls back to process.exit when appExit is absent', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const { gateway } = bench()
    gateway.shutdown()
    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
    exit.mockRestore()
  })

  it('restart detaches a relaunch helper then exits', () => {
    const exit = vi.fn()
    const { gateway } = bench(exit)
    expect(gateway.restart()).toEqual({ ok: true })

    expect(mockedSpawn).toHaveBeenCalledTimes(1)
    const [cmd, args, opts] = mockedSpawn.mock.calls[0]!
    expect(cmd).toBe('powershell.exe')
    expect(args.join(' ')).toContain('wscript.exe')
    expect(args.join(' ')).toContain('start-dsh-web.vbs')
    expect(opts?.detached).toBe(true)
    expect(opts?.stdio).toBe('ignore')

    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('uses the bound webserver port in the relaunch wait loop', () => {
    const exit = vi.fn()
    const ctx = new Context()
    ctx.provide('appExit', exit)
    ctx.provide('webServer', { port: 8123 } as never)
    const gateway = new PowerGateway(ctx)
    gateway.restart()
    expect(mockedSpawn.mock.calls[0]![1].join(' ')).toContain('8123')
  })

  it('falls back to the default port when webserver is absent', () => {
    const exit = vi.fn()
    const ctx = new Context()
    ctx.provide('appExit', exit)
    const gateway = new PowerGateway(ctx)
    gateway.restart()
    expect(mockedSpawn.mock.calls[0]![1].join(' ')).toContain('3080')
  })
})
