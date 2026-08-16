# @deepseek-ai/dsh-host-plugin-inventory

English | [中文](README.zh.md)

Host projection of the current Cordis Loader tree. `PluginInventoryGateway` registers the `pluginInventory` service and publishes two generated direct Remotes: `pluginInventory/list` and `pluginInventory/setEnabled`. Every `list` call reads `ctx.loader.entries()` directly, skips structural group rows, and returns the remaining entries in Loader order with only their Loader entry id, module specifier, effective enablement, and current root Fiber phase. `setEnabled` hot-swaps one non-group entry at runtime by resolving its nested id and applying the `disabled` flag through the Loader's own `Entry.update` path.

The phase is `pending`, `loading`, `active`, `failed`, or `unloading`; it is `null` when the entry has no live root Fiber. The snapshot is intentionally point-in-time: Loader remains the sole lifecycle authority, while this package owns no cache, history, or provenance model; its only mutation is the per-entry enable/disable switch, whose runtime effect rides the Loader's inject-waiting (a disabled entry's dependents stay pending until it returns). The mutation is session-scoped: the Web profile's root `cordis.yml` is rewritten empty on every boot, so a toggle never bakes into a user's durable patch layer. Its public payload types live under `./types`, and Typert generates the Host and Client Remote artifacts exposed by `./typert` and `./remote`.

The service is Remote-only and deliberately declares no same-process Cordis `Context` merge. Client packages consume it through the explicit [`api-remotes`](../../api/remotes/README.md) assembly rather than importing the Host implementation.

## Model Experience

None, as this Host-only inventory projection registers no prompt, tool, message, or provider request.

#### KV Cache effect

None; this package never assembles model input.

## Known Limitations and Deferred Work

- **Point-in-time state only** — the result contains no durable failure history or subscription; a missing root Fiber is reported as `null`, regardless of why no live root exists.
- **No provenance** — the service does not identify which bundle, profile, or override introduced an entry.
- **Hot-swap is session-scoped** — `setEnabled` changes the running tree only; it does not persist to the user's `cordis.patch.yml` (the Web root config is rewritten empty on each boot), so a toggled plugin returns to its composed default after a restart.
