/**
 * Host power controls: a Remote exposing clean shutdown and restart of the
 * Web GUI process. The restart path is self-contained and platform-adaptive:
 * it rebuilds the launch command from the running process (`process.execPath`
 * + the original arguments), reopens the browser at the actual listen port
 * read from the `webServer` service, and detaches a platform-appropriate
 * helper that survives the graceful exit — a windowless `wscript` VBS broken
 * away from the parent's Windows job, or a `sh` script using `open` (macOS) /
 * `xdg-open` (Linux). No host path, launcher, port, or Chrome window is
 * hardcoded. The browser half closes its own window via `window.close()` after
 * the acknowledgement, so the Host never touches other browser windows.
 * @module @deepseek-ai/dsh-host-power
 */

import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { AppExit } from '@deepseek-ai/dsh-cmdline'
import type {} from '@deepseek-ai/dsh-cmdline'
import type {} from '@deepseek-ai/dsh-host-webserver'

/** How long the exit is deferred so the Remote acknowledgement flushes to the browser first. */
const EXIT_DEFER_MS = 100

/**
 * Default relaunch wait. The graceful shutdown is bounded by the launcher's
 * shutdown controller (five seconds), so this comfortably outlives the port
 * release before the new process binds.
 */
const DEFAULT_RESTART_WAIT_MS = 7000

/** Gateway config: process-restart tunables, overridable per deployment. */
export interface Config {
  /**
   * How long the restart helper waits before relaunching, so the old process
   * has released its listen port.
   */
  restartWaitMs?: number
  /**
   * Optional full relaunch command for a supervisor-managed deployment whose
   * start command the process cannot rebuild; defaults to rebuilding the
   * current invocation.
   */
  restartCommand?: string
  /** Optional reopen URL; defaults to `http://127.0.0.1:<webServer.port>`. */
  reopenUrl?: string
}

/** The launch command rebuilt from the running process, plus its working directory. */
interface Relaunch {
  execPath: string
  args: string[]
  cwd: string
}

/**
 * Rebuild the launch command from the running process, so a restart reproduces
 * the invocation regardless of install location or flags. The entry script is
 * resolved to an absolute path so a relocated helper still finds it.
 * @returns the exec path, merged arguments (`execArgv` first), and cwd.
 */
function relaunchInvocation(): Relaunch {
  const argv = [...process.argv.slice(1)]
  const script = argv[0]
  if (script !== undefined && !isAbsolute(script)) {
    argv[0] = resolve(process.cwd(), script)
  }
  return {
    execPath: process.execPath,
    args: [...process.execArgv, ...argv],
    cwd: process.cwd(),
  }
}

/**
 * Resolve the browser reopen URL: the config override, else the loopback URL
 * of the active Web server. `undefined` when there is no `webServer` (a
 * non-Web composition), in which case restart skips reopening the browser.
 * @param ctx - owning context.
 * @param override - explicit reopen URL, when configured.
 * @returns the reopen URL, or `undefined` to skip reopening.
 */
function resolveReopenUrl(ctx: Context, override: string | undefined): string | undefined {
  if (override !== undefined) return override
  const port = ctx.get('webServer')?.port
  return port === undefined ? undefined : `http://127.0.0.1:${String(port)}`
}

/**
 * Resolve the bounded process-exit request, falling back to a direct exit when
 * the launcher did not provide `appExit` (a hand-built tree).
 * @param ctx - owning context.
 * @returns the exit function.
 */
function exitRequest(ctx: Context): AppExit {
  const appExit = ctx.get('appExit')
  return appExit ?? ((code: number): void => { process.exit(code) })
}

/** Request graceful exit after the current Remote response has been flushed. */
function deferExit(ctx: Context): void {
  const exit = exitRequest(ctx)
  setTimeout(() => { exit(0) }, EXIT_DEFER_MS)
}

/** Wrap a Windows command-line argument in quotes, doubling embedded quotes. */
function quoteWinArg(argument: string): string {
  return `"${argument.replace(/"/g, '""')}"`
}

/** Wrap a value as a VBS string literal, doubling embedded quotes. */
function vbsString(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

/** Quote a value for a POSIX shell single-quoted word. */
function shQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

/**
 * Build the relaunch command line for Windows: the override verbatim, else the
 * quoted exec path and arguments.
 * @param relaunch - rebuilt invocation.
 * @param override - optional supervisor command override.
 * @returns the command line handed to `shell.Run`.
 */
function winCmdline(relaunch: Relaunch, override: string | undefined): string {
  return override ?? [relaunch.execPath, ...relaunch.args].map(quoteWinArg).join(' ')
}

/**
 * Build the relaunch command line for a POSIX shell: the override run through
 * `sh -c`, else the quoted exec path and arguments.
 * @param relaunch - rebuilt invocation.
 * @param override - optional supervisor command override.
 * @returns the command line written into the helper script.
 */
function posixCmdline(relaunch: Relaunch, override: string | undefined): string {
  if (override !== undefined) return `sh -c ${shQuote(override)}`
  return [relaunch.execPath, ...relaunch.args].map(shQuote).join(' ')
}

/**
 * Build the windowless Windows helper VBS source: set the working directory,
 * sleep out the port release, relaunch hidden, then reopen the browser.
 * @param cmdline - resolved relaunch command line.
 * @param cwd - the relaunch working directory.
 * @param reopenUrl - the reopen URL, or `undefined` to skip reopening.
 * @param waitMs - the relaunch wait in milliseconds.
 * @returns the VBS script text.
 */
function buildWindowsHelper(cmdline: string, cwd: string, reopenUrl: string | undefined, waitMs: number): string {
  const lines = [
    'Set shell = CreateObject("WScript.Shell")',
    `shell.CurrentDirectory = ${vbsString(cwd)}`,
    `WScript.Sleep ${waitMs}`,
    `shell.Run ${vbsString(cmdline)}, 0, False`,
  ]
  if (reopenUrl !== undefined) lines.push(`shell.Run ${vbsString(reopenUrl)}`)
  lines.push('')
  return lines.join('\r\n')
}

/**
 * Build the detached POSIX helper shell script: sleep out the port release,
 * change directory, relaunch in the background, then reopen the browser.
 * @param cmdline - resolved relaunch command line.
 * @param cwd - the relaunch working directory.
 * @param reopenUrl - the reopen URL, or `undefined` to skip reopening.
 * @param waitSec - the relaunch wait in whole seconds.
 * @param openCmd - the platform URL opener (`open` or `xdg-open`).
 * @returns the shell script text.
 */
function buildPosixHelper(
  cmdline: string,
  cwd: string,
  reopenUrl: string | undefined,
  waitSec: number,
  openCmd: string,
): string {
  const lines = [
    '#!/bin/sh',
    `sleep ${waitSec}`,
    `cd ${shQuote(cwd)}`,
    `nohup ${cmdline} >/dev/null 2>&1 &`,
  ]
  if (reopenUrl !== undefined) lines.push(`${openCmd} ${shQuote(reopenUrl)}`)
  return `${lines.join('\n')}\n`
}

/**
 * Write and detach the Windows helper. A bare `detached` spawn stays in this
 * process's Windows job and is killed by the graceful exit, so the helper is
 * launched through `cmd /c start` to break it away; `wscript` keeps it
 * windowless.
 * @param relaunch - rebuilt invocation.
 * @param reopenUrl - the reopen URL, or `undefined`.
 * @param waitMs - the relaunch wait in milliseconds.
 * @param override - optional supervisor command override.
 */
function spawnWindowsHelper(
  relaunch: Relaunch,
  reopenUrl: string | undefined,
  waitMs: number,
  override: string | undefined,
): void {
  const helperPath = join(tmpdir(), `dsh-restart-${process.pid}.vbs`)
  writeFileSync(helperPath, buildWindowsHelper(winCmdline(relaunch, override), relaunch.cwd, reopenUrl, waitMs))
  const child = spawn('cmd.exe', ['/c', 'start', '', 'wscript.exe', helperPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
}

/**
 * Write and detach the POSIX helper. `detached` starts it in a new session, so
 * it survives the graceful exit and relaunches in the background.
 * @param relaunch - rebuilt invocation.
 * @param reopenUrl - the reopen URL, or `undefined`.
 * @param waitMs - the relaunch wait in milliseconds.
 * @param override - optional supervisor command override.
 * @param openCmd - the platform URL opener (`open` or `xdg-open`).
 */
function spawnPosixHelper(
  relaunch: Relaunch,
  reopenUrl: string | undefined,
  waitMs: number,
  override: string | undefined,
  openCmd: string,
): void {
  const helperPath = join(tmpdir(), `dsh-restart-${process.pid}.sh`)
  const waitSec = Math.max(1, Math.ceil(waitMs / 1000))
  writeFileSync(helperPath, buildPosixHelper(posixCmdline(relaunch, override), relaunch.cwd, reopenUrl, waitSec, openCmd))
  const child = spawn('/bin/sh', [helperPath], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
}

/** Remote-only service exposing process shutdown and restart. */
export class PowerGateway extends TypertRemoteService {
  static Config: z<Config> = z.object({
    restartWaitMs: z.natural().default(DEFAULT_RESTART_WAIT_MS),
    restartCommand: z.string(),
    reopenUrl: z.string(),
  })

  private readonly config: Config

  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'power')
    this.config = config
  }

  /**
   * Shut the Web GUI process down cleanly. The browser closes its own window
   * after receiving the acknowledgement.
   * @returns an acknowledgement.
   */
  @Remote('shutdown')
  shutdown(): { ok: true } {
    deferExit(this.ctx)
    return { ok: true }
  }

  /**
   * Restart the Web GUI: detach a re-launcher, then exit. The browser closes
   * its own window after the acknowledgement; the helper relaunches the
   * process and reopens the browser once the port frees.
   * @returns an acknowledgement.
   */
  @Remote('restart')
  restart(): { ok: true } {
    this.detachRestartHelper()
    deferExit(this.ctx)
    return { ok: true }
  }

  /** Detach the platform-appropriate restart helper before the graceful exit. */
  private detachRestartHelper(): void {
    const relaunch = relaunchInvocation()
    const reopenUrl = resolveReopenUrl(this.ctx, this.config.reopenUrl)
    const waitMs = this.config.restartWaitMs ?? DEFAULT_RESTART_WAIT_MS
    if (process.platform === 'win32') {
      spawnWindowsHelper(relaunch, reopenUrl, waitMs, this.config.restartCommand)
    } else {
      spawnPosixHelper(
        relaunch,
        reopenUrl,
        waitMs,
        this.config.restartCommand,
        process.platform === 'darwin' ? 'open' : 'xdg-open',
      )
    }
  }
}

export default PowerGateway
