# @deepseek-ai/dsh-client-ui-color-accents

English | [中文](README.zh.md)

Web color-accents plugin: adds VSCode-style semantic coloring to the git tags in the third-party git panels (`dsh-better-sidebar`'s source-control tab and `@linxin666/dsh-client-ui-git-graph`'s branch chip and graph) and stacks a brand-blue token layer over the whole UI.

The browser half does two things. A read-only decorator (a subtree `MutationObserver`) tags git elements with a `data-dsh-git-kind` attribute by classifying their text: status letters (`M`/`A`/`D`/`R`/`C`/`U`/`T`/`?`) and ref labels (`HEAD`/branch/`origin/` remote/`tag: ` tag). The accent stylesheet then colors those kinds through the `--dsw-*` palette (`color-mix` tints over state tokens), so dark and light themes adapt automatically. It targets git-graph through its stable `data-gitgraph-*` attributes and better-sidebar through its CSS-module class suffixes (`[class*="gitBadge"]`, `[class*="gitLogRef"]`, `[class*="gitBranchSelect"]`, `[class*="gitLogHash"]`), which survive hash-prefix changes.

The brand accent layer re-points `--dsw-alias-brand-primary` at the business blue and re-pins `--dsw-alias-button-primary-fill` to the original neutral, so focus rings, input borders, and selected states gain the brand blue while primary buttons keep their inverted-label contrast in both palettes. The host half is empty on purpose — every side effect is browser presentation.

## Model Experience

None. The plugin injects a stylesheet and a token layer and writes read-only `data-*` attributes; it contributes no tool, prompt, or model-visible data.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **Selector coupling to the third-party plugins** — better-sidebar is addressed by its hashed class suffixes and git-graph by its `data-*` attributes. A future major version that renames the local class names (`gitBadge`/`gitLogRef`/`gitBranchSelect`/`gitLogHash`) or drops the `data-gitgraph-*` attributes needs matching selector updates here.
- **Ref classification is text-based** — better-sidebar strips the `tag: ` and `HEAD -> ` prefixes before rendering, so its tags and the current branch classify as `branch`; git-graph's raw refs keep the full prefixes and get the fuller `tag`/`head` distinction.
- **Brand accent is deliberately partial** — the primary button fill stays monochrome so its inverted-label contrast is untouched; recolor the whole button set separately if a blue primary button is wanted.
