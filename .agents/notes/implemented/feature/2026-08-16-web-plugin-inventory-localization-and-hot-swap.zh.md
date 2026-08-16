# Agent Note: Web 插件清单本地化与运行时热插拔

Status: implemented

[English](2026-08-16-web-plugin-inventory-localization-and-hot-swap.md) | 中文

## Problem

Web 的「插件」设置页原本只暴露一个只读的 Loader 条目清单，每一行只显示由机器派生的英文短名和一个简单的「已启用 / 已停用」标签。它没有面向人类的描述，没有中文名称，也无法改变插件的运行时状态。另外，「/」快捷菜单里每条内置命令的描述都是硬编码英文，中文产品界面因此中英混杂。

需要在不改动组合模型的前提下新增两样东西：每个条目的运行时启停开关，以及插件行与快捷命令描述的本地化展示文案。

## Decision

### 插件清单本地化目录

`packages/client/ui-settings-plugin-inventory/src/client/catalog.ts` 存放 `PLUGIN_CATALOG`，一个 `Record<moduleName, { name: { zh, en }, summary: { zh, en } }>`，覆盖随附的 `dsh-base` 与 `dsh-web-app` bundle patch 里每一个 `name:`。标签页通过注入的 `describe(moduleName)` 回调解析每个条目，在渲染时读取当前语言；未收录的模块回落到现有的 `moduleShortName` 短名，且不显示概括。名称与概括是插件 UI 旁的普通数据，而非每个包的运行时元数据，因此目录只在一处随包发布，不需要改 Loader 或 manifest。

### 运行时热插拔

`PluginInventoryGateway`（宿主）新增了生成的 `pluginInventory/setEnabled(entryId, enabled)` Remote。它按嵌套 id 解析条目，并调用 Loader 自带的 `Entry.update({ disabled: !enabled })`——与 HMR、配置热重载同一条热更新路径。停用会销毁根 Fiber；启用会重新初始化；Cordis 的 inject 等待让依赖它的插件保持 pending，直到该条目恢复。开关是会话级的：Web profile 的根 `cordis.yml` 每次启动都被重写为空，因此切换不会写入用户持久的 patch 层。

清单标签页为每个非 group 行渲染一个 `<button role="switch">`。点选会调用该 Remote，请求进行中禁用开关，成功后刷新快照，失败则显示错误横幅。group 无法被切换，`setEnabled` 会拒绝。

### 快捷命令描述覆盖层

`packages/client/ui-commands/src/client/catalog.ts` 存放 `COMMAND_CATALOG`，一个 `Record<name, zh 描述>`，覆盖随附的 Host 命令（`compact`、`goal`、`feedback`、`permission`、`plan`、`export`）。`CommandUiRuntime` 接受一个 `describe(name)` 配置；候选合成在候选时解析描述，zh 语言返回中文覆盖层，其余语言回落使用 Host 自带的英文描述。命令名与参数提示保持英文，因为它们是 Host 解析的字面语法。

## Alternatives considered

- **把热插拔持久化到用户的 `cordis.patch.yml`** —— 否决，因为 Web profile 根刻意在每次启动时重写为空，持久化写入会重复组合行。会话级的 `Entry.update` 是 Loader 原生的运行时路径，符合「热插拔」语义。
- **每个包自带运行时名称/概括元数据** —— 否决，因为要改动每个插件 manifest、Loader 与快照；单一客户端目录改动面更小，且无需改组合。
- **在 Host 侧翻译命令描述** —— 否决，因为 Host 注册表是 TUI 与模型相关界面共享的英文源文本；客户端覆盖层只本地化发现文案，保持 Host 契约不变。
- **同时本地化命令提示** —— 否决，因为 `clear` / `edit` / `pause` / `resume` 等提示 token 是 Host 解析的字面子命令，翻译会破坏菜单与可用语法之间的映射。

## Consequences

- 插件列表为每个随附行展示中文名、一句话概括与可用的启停开关；未知的 preset 行仍以派生短名显示。
- 停用核心插件（connection、webserver、session、locale 等）可能使当前会话不稳定；这是热插拔的固有代价，不做特殊处理。开关仍显示在每个非 group 行上。
- 英文语言行为逐字节不变：未收录的插件名保持短名，英文命令描述回落使用 Host 文本。
- settings-chrome e2e 的导航定位器现在对本地化卡片名（模型设置、大模型能力等）与导航单元格共享子串之处固定使用 `exact: true`。
- Web bundle 以 `root: []`（仅配置重载）启用其 `hmr` 行，因此清单显示一个已启用的「热更新」行，`apps/cli` 跳过其运行时 watch-only 回退；共享的模块重载 HMR（`root: ['.']`）保持关闭。
