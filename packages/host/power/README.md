# @deepseek-ai/dsh-host-power

English | [中文](README.zh.md)

Host power controls: a Remote (`power`) exposing clean shutdown and restart of the Web GUI process, consumed by the `dsh-client-ui-power` browser button.

`shutdown` requests the launcher-provided `appExit` (the graceful tree-dispose + exit path) after a short defer so the Remote acknowledgement flushes to the browser first. `restart` detaches a PowerShell helper that polls the listen port free and then runs the one-click launcher (`start-dsh-web.vbs` beside this checkout), which starts the new node hidden and reopens the Chrome window; it then requests the same graceful exit. The browser closes its own window via `window.close()` after the ack, so only the DSH page closes — other Chrome windows are never touched.

## Model Experience

None. The Remote performs process lifecycle actions; it contributes no tool, prompt, or model-visible data.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **Restart reuses the one-click launcher** — the detached helper relaunches through `start-dsh-web.vbs` beside this checkout. A deployment that starts DSH differently (manual `node ...`, a supervisor) should point `restartCommand` at its own launcher; the current form has no per-deployment restart command config.
- **Windows-only** — the detached helper is a PowerShell one-liner and `start-dsh-web.vbs`; shutdown alone (no restart) is platform-neutral, but restart is Windows-specific.
- **Deferred exit** — `appExit` is deferred by a fixed `EXIT_DEFER_MS` after the Remote returns; a very slow client link could still miss the ack before exit, though the graceful disposal flushes queued responses.
