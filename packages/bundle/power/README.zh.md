# dsh-power

[English](README.md) | 中文

给 DeepSeek Harness Web 界面加上电源按钮：在浏览器侧边栏里关闭或重启 DSH。

一个自包含的 DSH 插件 bundle。它插入 `dsh-host-power` 宿主网关与
`dsh-client-ui-power` 浏览器按钮，在侧边栏「设置」上方添加一个电源图标。
悬停后可选择：

- **关闭 DSH** —— 只关闭 DSH 这一页，并优雅停止服务。
- **重启 Web UI** —— 重新拉起服务并自动重新打开页面。

## 特性

- 🚫 **绝不误关其他浏览器窗口** —— 页面通过 `window.close()` 自行关闭，宿主进程从不杀 Chrome。
- 🧭 **环境自适应** —— 无硬编码路径或端口；重启命令由当前进程重建，重开地址跟随实际监听端口。
- 🌍 **跨平台** —— Windows（无窗口 `wscript` 辅助进程）、macOS（`open`）、Linux（`xdg-open`）。

## 安装

```sh
dsh plugin --profile web add @deepseek-ai/dsh-power
```

重启 `dsh web` 后，悬停「设置」上方的电源图标即可。

## 配置

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `restartWaitMs` | `7000` | 重新拉起前等待旧进程释放端口的时长。 |
| `restartCommand` | *(自动)* | 可选的重启命令覆盖，用于 supervisor 管理的部署。 |
| `reopenUrl` | *(自动)* | 可选的重开地址；默认 `http://127.0.0.1:<端口>`。 |

## 工作原理

宿主网关从 `process.argv` 重建启动命令，等待 `restartWaitMs` 让旧进程释放端口后重新拉起，并在检测到的端口重新打开浏览器。辅助进程与父进程分离，能在优雅关闭后继续存活。

## Model Experience

通过插入的行间接作用：本 bundle 只选择宿主电源网关与浏览器电源按钮，自身不贡献任何模型可见文本。

#### KV Cache effect

无直接影响；每个插入行的包各自负责其效果。

## Known Limitations and Deferred Work

- **依赖 Web profile 的 `remote.power` 挂载** —— 浏览器按钮消费由内置 web-app bundle 里 `api-remotes` 挂载的 Remote namespace，因此本 bundle 是 Web 界面的增量，而非独立传输层。
