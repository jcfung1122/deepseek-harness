import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { PowerGateway } from '../src/index.ts'

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({ unref: vi.fn() })),
}))
vi.mock('node:fs', () => ({ writeFileSync: vi.fn() }))
vi.mock('node:os', () => ({ tmpdir: vi.fn(() => 'C:\\Temp') }))

const mockedSpawn = vi.mocked(spawn)
const mockedWriteFile = vi.mocked(writeFileSync)

/** The last helper .vbs body written by the gateway. */
function helperScript(): string {
  return mockedWriteFile.mock.calls.at(-1)![1] as string
}

/** Build a context with the launcher services the gateway reads. */
function bench(exit?: (code: number) => void): { ctx: Context; gateway: PowerGateway } {
  const ctx = new Context()
  if (exit !== undefined) ctx.provide('appExit', exit)
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

  it('restart writes and breaks away a windowless relaunch helper then exits', () => {
    const exit = vi.fn()
    const { gateway } = bench(exit)
    expect(gateway.restart()).toEqual({ ok: true })

    expect(mockedSpawn).toHaveBeenCalledTimes(1)
    const [cmd, args, opts] = mockedSpawn.mock.calls[0]!
    expect(cmd).toBe('cmd.exe')
    expect(args.slice(0, 3)).toEqual(['/c', 'start', ''])
    expect(args[3]).toBe('wscript.exe')
    expect(opts?.detached).toBe(true)
    expect(opts?.stdio).toBe('ignore')

    const script = helperScript()
    expect(script).toContain('WScript.Sleep 7000')
    expect(script).toContain('wscript.exe')
    expect(script).toContain('start-dsh-web.vbs')

    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
  })
})
