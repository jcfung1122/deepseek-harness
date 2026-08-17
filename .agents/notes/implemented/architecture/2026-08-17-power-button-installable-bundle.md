# Agent Note: Power button as a self-contained installable bundle

Status: implemented

English | [中文](2026-08-17-power-button-installable-bundle.zh.md)

## Problem

The Web GUI power button (shut down / restart) was built directly into the web-app bundle: its `power` host row and `ui-power` client row lived in `dsh-web-app`'s `cordis.patch.yml`, the button registered into a fork-only `sidebar.power` slot, and the restart helper hardcoded this machine's launcher (`start-dsh-web.vbs`, the node path, and the Chrome app shortcut). None of that is portable: other DSH users cannot install it, it depends on fork-only slot and icon additions absent from upstream, and the restart logic only works on this checkout.

## Decision

The power feature ships as a self-contained installable bundle `@deepseek-ai/dsh-power`, published to npm and installed with `dsh plugin --profile web add @deepseek-ai/dsh-power`.

### Host gateway rebuilds its own relaunch command

`dsh-host-power` no longer references any launcher file. `restart` rebuilds the launch command from `process.execPath` + `process.execArgv` + `process.argv.slice(1)` (the entry script resolved absolute against `process.cwd()`), reads the reopen URL from `webServer.port` (the actual bound port, so any `--port` or OS-assigned port is honoured), and detaches a platform-appropriate helper: Windows (a windowless `wscript` VBS broken away from the parent job via `cmd /c start`), macOS (`open`), or Linux (`xdg-open`). `restartWaitMs` (default 7000), `restartCommand`, and `reopenUrl` are validated Config fields for supervisor-managed deployments.

### Client button uses the upstream slot, icon inlined

`dsh-client-ui-power` registers into `sidebar.footer.action` (an upstream list slot) instead of the fork-only `sidebar.power`, and inlines the power glyph so it no longer depends on fork-only `ui-primitives` icons.

### Remote stays in the central assembly

`ctx.remote.power` is still mounted by `api-remotes`, the repository's single split package and the only one allowed to import `/remote` artifacts. `ui-power` does not self-mount, which would require the split Host/Client tsconfig pattern the repository forbids for new packages.

### Bundle carrier

`@deepseek-ai/dsh-power` is a `dsh.bundle.patch` carrier (like `dsh-base`): its `cordis.patch.yml` inserts the `power` and `ui-power` rows, and its `package.json` declares both packages as dependencies.

## Alternatives considered

- **Keep the rows in web-app and publish the two packages.** Rejected: the button would still be wired into the default web UI, and the fork-only `sidebar.power` slot and icons would still be required for third parties.
- **Self-mount `powerRemote` in `ui-power`.** Rejected: importing `/remote` in a client business package requires the split Host/Client tsconfig structure, which `docs/development.md` reserves for `api-remotes` and forbids new packages from copying.
- **Pass the reopen URL from the client.** Rejected: `webServer.port` already yields the loopback URL the local browser always reaches, so `window.location.href` would be redundant.

## Consequences

- The power button no longer ships in the default web-app bundle; users install it with `dsh plugin add`, which also exercises the install path.
- The restart path is self-contained and cross-platform, with no hardcoded host path, port, or browser window.
- The fork-only `sidebar.power` slot and `IconPowerOutline*` icons are removed.
- `api-remotes` keeps mounting `remote.power`, so the namespace exists in every web profile even before the bundle is installed; its calls fail until the `power` host row is present.
