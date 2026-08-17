# dsh-power

English | [中文](README.zh.md)

Power controls for the DeepSeek Harness Web GUI — shut down or restart DSH from
the browser sidebar.

A self-contained DSH plugin bundle. It inserts the `dsh-host-power` host
gateway and the `dsh-client-ui-power` browser button, which adds a power icon
above **Settings** in the sidebar. Hover it to choose:

- **Shut down DSH** — closes only the DSH page and stops the service gracefully.
- **Restart Web UI** — relaunches the service and reopens the page.

## Features

- 🚫 **Never touches other browser windows** — the page closes itself via
  `window.close()`; the host never kills Chrome.
- 🧭 **Environment-adaptive** — no hardcoded paths or ports. The restart command
  is rebuilt from the running process, and the reopen URL follows the actual
  listen port.
- 🌍 **Cross-platform** — Windows (windowless `wscript` helper), macOS (`open`),
  and Linux (`xdg-open`).

## Install

```sh
dsh plugin --profile web add @deepseek-ai/dsh-power
```

Restart `dsh web`, then hover the power icon above **Settings**.

## Configuration

| Key | Default | Description |
| --- | --- | --- |
| `restartWaitMs` | `7000` | Wait before relaunching, so the old process frees its port. |
| `restartCommand` | *(auto)* | Optional full relaunch command for supervisor-managed setups. |
| `reopenUrl` | *(auto)* | Optional reopen URL; defaults to `http://127.0.0.1:<port>`. |

## How it works

The host gateway rebuilds the launch command from `process.argv`, waits
`restartWaitMs` for the old process to release its port, relaunches it, and
reopens the browser at the detected port. The helper is detached from the parent
process so it survives the graceful shutdown.

## Model Experience

Indirectly, through the inserted rows: this bundle selects the host power gateway and the browser power button, and contributes no model-visible text of its own.

#### KV Cache effect

None directly; each inserted row's package owns its effect.

## Known Limitations and Deferred Work

- **Depends on the Web profile's `remote.power` mount** — the browser button
  consumes the Remote namespace mounted by `api-remotes` in the shipped web-app
  bundle, so this bundle is a Web-surface addition rather than a standalone
  transport.
