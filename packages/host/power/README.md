# @deepseek-ai/dsh-host-power

English | [中文](README.zh.md)

Host power controls: a Remote (`power`) exposing clean shutdown and restart of the Web GUI process, consumed by the `dsh-client-ui-power` browser button.

`shutdown` requests the launcher-provided `appExit` (the graceful tree-dispose + exit path) after a short defer so the Remote acknowledgement flushes to the browser first. `restart` rebuilds the launch command from the running process (`process.execPath` + the original arguments), detaches a platform-appropriate helper that waits for the port to free and relaunches, then reopens the browser at the actual listen port; it then requests the same graceful exit. The browser closes its own window via `window.close()` after the ack, so only the DSH page closes — other browser windows are never touched.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `restartWaitMs` | `7000` | How long the restart helper waits before relaunching, so the old process frees its port. |
| `restartCommand` | *(auto)* | Optional full relaunch command for a supervisor-managed deployment; defaults to rebuilding the current invocation. |
| `reopenUrl` | *(auto)* | Optional reopen URL; defaults to `http://127.0.0.1:<webServer.port>`. |

## Model Experience

None, as the Remote only performs host process-lifecycle actions and registers no tool, prompt, or model-visible data.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **Cross-platform restart** — Windows relaunches through a windowless `wscript` VBS broken away from the parent job via `cmd /c start`; macOS and Linux use a detached `sh` script with `open` / `xdg-open`.
- **Deferred exit** — `appExit` is deferred by a fixed `EXIT_DEFER_MS` after the Remote returns; a very slow client link could still miss the ack before exit, though the graceful disposal flushes queued responses.
