import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { PowerGateway, type Config } from '../src/index.ts'

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({ unref: vi.fn() })),
}))
vi.mock('node:fs', () => ({ writeFileSync: vi.fn() }))
vi.mock('node:os', () => ({ tmpdir: vi.fn(() => '/tmp') }))

const mockedSpawn = vi.mocked(spawn)
const mockedWriteFile = vi.mocked(writeFileSync)

/** The last helper script body written by the gateway. */
function helperScript(): string {
  return mockedWriteFile.mock.calls.at(-1)![1] as string
}

/** Saved descriptors for stubbed process globals, restored in `afterEach`. */
const savedProcess = new Map<string, PropertyDescriptor | undefined>()

/** Stub process globals; the first stub of each key saves its original descriptor. */
function stubProcess(patch: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(patch)) {
    if (!savedProcess.has(key)) savedProcess.set(key, Object.getOwnPropertyDescriptor(process, key))
    Object.defineProperty(process, key, { value, configurable: true, writable: true })
  }
}

/** Build a context with the launcher services the gateway reads. */
function bench(config?: Config, exit?: (code: number) => void, port?: number): { ctx: Context; gateway: PowerGateway } {
  const ctx = new Context()
  if (exit !== undefined) ctx.provide('appExit', exit)
  if (port !== undefined) ctx.provide('webServer', { port } as unknown as WebServer)
  return { ctx, gateway: new PowerGateway(ctx, config ?? {}) }
}

describe('PowerGateway', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubProcess({
      platform: 'linux',
      execPath: '/usr/bin/node',
      execArgv: [],
      argv: ['node', '/app/bin.js', '--profile', 'web', '--port', '8080'],
      cwd: (): string => '/repo',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    for (const [key, descriptor] of savedProcess) {
      if (descriptor === undefined) Reflect.deleteProperty(process, key)
      else Object.defineProperty(process, key, descriptor)
    }
    savedProcess.clear()
  })

  it('shutdown defers a graceful exit and acknowledges', () => {
    const exit = vi.fn()
    const { gateway } = bench(undefined, exit)
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

  it('restart on Linux writes a detached sh helper that relaunches and reopens with xdg-open', () => {
    const exit = vi.fn()
    const { gateway } = bench(undefined, exit, 8080)
    expect(gateway.restart()).toEqual({ ok: true })

    expect(mockedSpawn).toHaveBeenCalledExactlyOnceWith(
      '/bin/sh',
      [expect.stringMatching(/dsh-restart-.*\.sh$/)],
      { detached: true, stdio: 'ignore' },
    )
    expect(helperScript()).toBe(
      "#!/bin/sh\nsleep 7\ncd '/repo'\nnohup '/usr/bin/node' '/app/bin.js' '--profile' 'web' '--port' '8080' >/dev/null 2>&1 &\nxdg-open 'http://127.0.0.1:8080'\n",
    )
    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('restart on macOS reopens with open instead of xdg-open', () => {
    stubProcess({ platform: 'darwin' })
    const { gateway } = bench(undefined, undefined, 8080)
    gateway.restart()

    expect(mockedSpawn).toHaveBeenCalledExactlyOnceWith(
      '/bin/sh',
      [expect.stringMatching(/dsh-restart-.*\.sh$/)],
      { detached: true, stdio: 'ignore' },
    )
    expect(helperScript()).toContain("open 'http://127.0.0.1:8080'")
    expect(helperScript()).not.toContain('xdg-open')
  })

  it('restart on Windows writes a windowless VBS helper and breaks away from the parent job', () => {
    stubProcess({ platform: 'win32' })
    const exit = vi.fn()
    const { gateway } = bench(undefined, exit, 8080)
    expect(gateway.restart()).toEqual({ ok: true })

    expect(mockedSpawn).toHaveBeenCalledExactlyOnceWith(
      'cmd.exe',
      ['/c', 'start', '', 'wscript.exe', expect.stringMatching(/dsh-restart-.*\.vbs$/)],
      { detached: true, stdio: 'ignore', windowsHide: true },
    )
    const script = helperScript()
    expect(script).toContain('WScript.Sleep 7000')
    expect(script).toContain('shell.CurrentDirectory = "/repo"')
    expect(script).toContain('shell.Run """/usr/bin/node"" ""/app/bin.js"" ""--profile"" ""web"" ""--port"" ""8080""", 0, False')
    expect(script).toContain('shell.Run "http://127.0.0.1:8080"')
    vi.advanceTimersByTime(200)
    expect(exit).toHaveBeenCalledExactlyOnceWith(0)
  })

  it('restart on Windows uses the restartCommand override verbatim', () => {
    stubProcess({ platform: 'win32' })
    const { gateway } = bench({ restartCommand: 'C:\\my-launcher.bat --flag' }, undefined, 8080)
    gateway.restart()

    expect(helperScript()).toContain('shell.Run "C:\\my-launcher.bat --flag", 0, False')
  })

  it('restart on macOS runs the restartCommand override through sh -c', () => {
    stubProcess({ platform: 'darwin' })
    const { gateway } = bench({ restartCommand: 'systemctl restart dsh' }, undefined, 8080)
    gateway.restart()

    expect(helperScript()).toContain("nohup sh -c 'systemctl restart dsh' >/dev/null 2>&1 &")
  })

  it('restart honours an explicit reopenUrl override', () => {
    const { gateway } = bench({ reopenUrl: 'http://custom.example:9999' }, undefined, 8080)
    gateway.restart()

    expect(helperScript()).toContain("xdg-open 'http://custom.example:9999'")
    expect(helperScript()).not.toContain('127.0.0.1')
  })

  it('restart on Windows without a web server skips reopening the browser', () => {
    stubProcess({ platform: 'win32' })
    const { gateway } = bench()
    gateway.restart()

    const script = helperScript()
    expect(script).toContain('shell.Run """/usr/bin/node"" ""/app/bin.js"" ""--profile"" ""web"" ""--port"" ""8080""", 0, False')
    expect(script).not.toContain('shell.Run "http://')
  })

  it('restart on Linux without a web server skips reopening the browser', () => {
    const { gateway } = bench()
    gateway.restart()

    const script = helperScript()
    expect(script).toContain("nohup '/usr/bin/node' '/app/bin.js' '--profile' 'web' '--port' '8080' >/dev/null 2>&1 &")
    expect(script).not.toContain('xdg-open')
  })

  it('restart resolves a relative entry script against the working directory', () => {
    stubProcess({ argv: ['node', 'bin.js'], cwd: (): string => '/repo' })
    const { gateway } = bench(undefined, undefined, 8080)
    gateway.restart()

    expect(helperScript()).toContain(`nohup '/usr/bin/node' '${resolve('/repo', 'bin.js')}'`)
  })

  it('restart tolerates an empty argument list', () => {
    stubProcess({ argv: ['node'] })
    const { gateway } = bench(undefined, undefined, 8080)
    gateway.restart()

    expect(helperScript()).toContain("nohup '/usr/bin/node' >/dev/null 2>&1 &")
  })
})
