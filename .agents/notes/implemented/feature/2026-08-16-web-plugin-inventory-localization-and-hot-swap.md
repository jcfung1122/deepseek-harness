# Agent Note: Web plugin inventory localization and runtime hot-swap

Status: implemented

English | [中文](2026-08-16-web-plugin-inventory-localization-and-hot-swap.zh.md)

## Problem

The Web Plugins settings page exposed a read-only inventory of Loader entries, but each row showed only a machine-derived English short name and a plain "Enabled / Disabled" tag. It had no human-facing description, no Chinese name, and no way to change a plugin's runtime state. Separately, the "/" slash menu rendered every built-in command's description in hardcoded English, so the Chinese product surface mixed languages.

Two things had to be added without changing the composition model: a per-entry runtime enable/disable switch, and localized display copy for plugin rows and slash-command descriptions.

## Decision

### Plugin inventory localization catalog

`packages/client/ui-settings-plugin-inventory/src/client/catalog.ts` holds `PLUGIN_CATALOG`, a `Record<moduleName, { name: { zh, en }, summary: { zh, en } }>` covering every `name:` in the shipped `dsh-base` and `dsh-web-app` bundle patches. The tab resolves each entry through a `describe(moduleName)` injected callback that reads the active locale at render time; an unmapped module falls back to the existing `moduleShortName` short name with no summary. Names and summaries are plain data beside the plugin UI, not per-package runtime metadata, so the catalog ships in one place and needs no Loader or manifest change.

### Runtime hot-swap

`PluginInventoryGateway` (host) gained a generated `pluginInventory/setEnabled(entryId, enabled)` Remote. It resolves the entry by nested id and calls the Loader's own `Entry.update({ disabled: !enabled })` — the same hot-reload path HMR and config reload use. Disabling disposes the root Fiber; enabling re-inits it; Cordis inject-waiting keeps dependent plugins pending until the entry returns. The switch is session-scoped: the Web profile's root `cordis.yml` is rewritten empty on every boot, so a toggle never bakes into a user's durable patch layer.

The inventory tab renders one `<button role="switch">` per non-group row. A pick calls the Remote, disables the switch while pending, refreshes the snapshot on success, and surfaces a failure banner otherwise. Groups cannot be toggled and are rejected by `setEnabled`.

### Slash-command description overlay

`packages/client/ui-commands/src/client/catalog.ts` holds `COMMAND_CATALOG`, a `Record<name, zh description>` for the shipped Host commands (`compact`, `goal`, `feedback`, `permission`, `plan`, `export`). `CommandUiRuntime` accepts a `describe(name)` config; candidate synthesis resolves the description at candidate time, returning the Chinese overlay for the zh locale and falling through to the Host's own English description otherwise. Command names and argument hints stay English because they are the literal grammar the Host parses.

## Alternatives considered

- **Persist hot-swap to the user's `cordis.patch.yml`** — rejected because the Web profile root is deliberately rewritten empty each boot, and a durable write would duplicate composed rows. Session-scoped `Entry.update` is the Loader's native runtime path and matches "hot-swap".
- **Per-package runtime name/summary metadata** — rejected because it touches every plugin manifest plus the Loader and snapshot; a single client-side catalog is a smaller surface and needs no composition change.
- **Translate command descriptions on the Host** — rejected because the Host registry is English source text shared with the TUI and model-adjacent surfaces; the client overlay localizes only the discovery copy and keeps the Host contract unchanged.
- **Also localize command hints** — rejected because `clear` / `edit` / `pause` / `resume` and other hint tokens are literal subcommands the Host parses; translating them would break the mapping between the menu and the working grammar.

## Consequences

- The plugin list shows a Chinese name, a one-line summary, and a working enable/disable switch for every shipped row; unknown preset rows still render with the derived short name.
- Disabling a core plugin (connection, webserver, session, locale, …) can destabilize the running session; this is accepted as inherent to hot-swap and is not special-cased. The switch remains visible on every non-group row.
- English locale behavior is byte-for-byte unchanged: unmapped plugin names keep the short name, and English command descriptions fall through to the Host text.
- The settings-chrome e2e nav locators now pin `exact: true` where a localized card name (模型设置, 大模型能力, …) shares a substring with a nav cell.
- The Web bundle enables its `hmr` row with `root: []` (config-only reload), so the inventory shows one enabled 热更新 row and `apps/cli` skips its runtime watch-only fallback; the shared module-reload HMR (`root: ['.']`) stays off.
