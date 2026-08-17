# Agent Note: 电源按钮独立为可安装 bundle

Status: implemented

[English](2026-08-17-power-button-installable-bundle.md) | 中文

## Problem

Web GUI 电源按钮（关闭 / 重启）原本直接内建在 web-app bundle 里：`power` 宿主行与 `ui-power` 客户端行写进 `dsh-web-app` 的 `cordis.patch.yml`，按钮注册进 fork 专属的 `sidebar.power` 槽，重启辅助进程还硬编码了本机的启动器（`start-dsh-web.vbs`、node 路径与 Chrome 应用快捷方式）。这些都不具可移植性：其他 DSH 用户无法安装，它依赖上游没有的 fork 专属槽与图标，重启逻辑只在本 checkout 上可用。

## Decision

电源功能以自包含、可安装的 bundle `@deepseek-ai/dsh-power` 发布到 npm，用户用 `dsh plugin --profile web add @deepseek-ai/dsh-power` 安装。

### 宿主网关自行重建启动命令

`dsh-host-power` 不再引用任何启动器文件。`restart` 从 `process.execPath` + `process.execArgv` + `process.argv.slice(1)` 重建启动命令（入口脚本相对 `process.cwd()` 解析为绝对路径），从 `webServer.port`（实际绑定端口，任意 `--port` 或 OS 分配端口都成立）读取重开地址，并按平台 detach 辅助进程：Windows（无窗口 `wscript` VBS 经 `cmd /c start` 脱离父进程 job）、macOS（`open`）、Linux（`xdg-open`）。`restartWaitMs`（默认 7000）、`restartCommand`、`reopenUrl` 是面向 supervisor 部署的校验 Config 字段。

### 客户端按钮用上游槽、图标内联

`dsh-client-ui-power` 注册进 `sidebar.footer.action`（上游 list 槽），而非 fork 专属的 `sidebar.power`，并内联电源图元，不再依赖 fork 专属的 `ui-primitives` 图标。

### Remote 仍由中心装配挂载

`ctx.remote.power` 仍由 `api-remotes` 挂载——它是仓库唯一的拆分包，也是唯一允许导入 `/remote` 产物的包。`ui-power` 不自挂，因为那需要仓库禁止新包仿照的 Host/Client 拆分 tsconfig 结构。

### bundle 载体

`@deepseek-ai/dsh-power` 是 `dsh.bundle.patch` 载体（类似 `dsh-base`）：其 `cordis.patch.yml` 插入 `power` 与 `ui-power` 两行，`package.json` 声明这两个包为依赖。

## Alternatives considered

- **保留 web-app 内的行、只发布两个包。** 否决：按钮仍会内建进默认 Web UI，第三方仍需要 fork 专属的 `sidebar.power` 槽与图标。
- **在 `ui-power` 里自挂 `powerRemote`。** 否决：客户端业务包导入 `/remote` 需要 Host/Client 拆分 tsconfig 结构，而 `docs/development.md` 将该结构保留给 `api-remotes`，并禁止新包仿照。
- **由客户端传入重开地址。** 否决：`webServer.port` 已经给出本机浏览器总能访问的回环地址，`window.location.href` 显得多余。

## Consequences

- 电源按钮不再随默认 web-app bundle 内建；用户用 `dsh plugin add` 安装，同时验证了安装链路。
- 重启路径自包含且跨平台，无硬编码的宿主路径、端口或浏览器窗口。
- fork 专属的 `sidebar.power` 槽与 `IconPowerOutline*` 图标被移除。
- `api-remotes` 继续挂载 `remote.power`，因此每个 web profile 里该 namespace 始终存在；在安装 bundle 前，其调用会一直失败，直到 `power` 宿主行出现。
