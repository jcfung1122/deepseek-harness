/**
 * Host power controls: a Remote exposing clean shutdown and restart of the
 * Web GUI process. `shutdown` exits the tree gracefully; `restart` detaches a
 * re-launcher that waits for the listen port to free and then runs the
 * one-click launcher before the current process exits. The browser half is
 * responsible for closing its own window via `window.close()` after the ack —
 * the Host never touches other Chrome windows.
 * @module @deepseek-ai/dsh-host-power
 */

import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { AppExit } from '@deepseek-ai/dsh-cmdline'
import type {} from '@deepseek-ai/dsh-cmdline'

/** Repository root; both `src/` and built `lib/` sit four levels under it. */
const SOURCE_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))

/** One-click launcher beside this checkout: hidden node start + Chrome reopen. */
const RESTART_LAUNCHER = `${SOURCE_ROOT}\\start-dsh-web.vbs`

/**
 * How long the restart helper waits before re-running the launcher. The
 * graceful shutdown is bounded (see the launcher's shutdown controller), so a
 * fixed wait comfortably outlives the port release without polling.
 */
const RESTART_WAIT_MS = 7000

/** How long the exit is deferred so the Remote ack flushes to the browser first. */
const EXIT_DEFER_MS = 100

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

/**
 * Detach a restart helper that waits for the graceful shutdown to release the
 * port, then runs the one-click launcher (which starts the new node hidden and
 * reopens Chrome). The helper is a VBS run by `wscript`, so it is windowless;
 * a bare `detached` spawn stays in this process's Windows job and is killed
 * when the graceful exit completes, so the helper is launched through
 * `cmd /c start` to break it away from that job.
 */
function spawnRestartHelper(): void {
  const helperPath = join(tmpdir(), `dsh-restart-${process.pid}.vbs`)
  writeFileSync(helperPath, [
    'Set shell = CreateObject("WScript.Shell")',
    `WScript.Sleep ${RESTART_WAIT_MS}`,
    `shell.Run """C:\\Windows\\System32\\wscript.exe"" ""${RESTART_LAUNCHER}"""`,
    '',
  ].join('\r\n'))
  const child = spawn('cmd.exe', ['/c', 'start', '', 'wscript.exe', helperPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
}

/** Remote-only service exposing process shutdown and restart. */
export class PowerGateway extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'power')
  }

  /**
   * Shut the Web GUI process down cleanly. The browser closes its own window
   * after receiving the ack.
   * @returns an acknowledgement.
   */
  @Remote('shutdown')
  shutdown(): { ok: true } {
    deferExit(this.ctx)
    return { ok: true }
  }

  /**
   * Restart the Web GUI: detach a re-launcher, then exit. The browser closes
   * its own window after the ack; the launcher reopens it once the port frees.
   * @returns an acknowledgement.
   */
  @Remote('restart')
  restart(): { ok: true } {
    spawnRestartHelper()
    deferExit(this.ctx)
    return { ok: true }
  }
}

export default PowerGateway
