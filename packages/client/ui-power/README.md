# @deepseek-ai/dsh-client-ui-power

English | [中文](README.zh.md)

Web power button beside Settings in the sidebar foot: hovering it opens a two-item menu (shut down / restart), each gated by an inline confirm before invoking the Host `power` Remote (`dsh-host-power`). On acknowledgement the page closes itself via `window.close()`, so only this DSH page closes — other Chrome windows are never touched.

The browser half registers the button into `sidebar.power` (declared by `ui-sidebar`) and reads the generated `remote.power` Remote through the `api-remotes` assembly. The host half is empty on purpose — the shutdown/restart process action lives in the Host gateway.

## Model Experience

None. The button only issues process-lifecycle calls; it contributes no tool, prompt, or model-visible data.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **`window.close()` may be blocked** — a manually opened tab (not the Chrome app window) can refuse script-close; the page then just shows "connection lost" and the user closes it by hand. Other windows are never closed.
- **No undo** — shutdown and restart are destructive; the inline confirm is the only guard, and a confirmed action cannot be cancelled once the Remote acknowledges.
