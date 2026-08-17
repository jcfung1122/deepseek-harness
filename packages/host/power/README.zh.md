# @deepseek-ai/dsh-host-power

[English](README.md) | 中文

宿主电源控制：一个 `power` Remote，对外提供 Web GUI 进程的干净关闭与重启，由 `dsh-client-ui-power` 浏览器按钮消费。

`shutdown` 先短暂延迟、待 Remote 确认已发回浏览器后，再请求启动器提供的 `appExit`（优雅释放并退出）。`restart` 从当前进程重建启动命令（`process.execPath` + 原始参数），detach 一个按平台适配的辅助进程：等待端口释放后重新拉起，再在实际监听端口重新打开浏览器；随后请求同样的优雅退出。浏览器在收到确认后通过 `window.close()` 自行关闭本页，因此只关闭 DSH 这一页——绝不触碰其他浏览器窗口。

## 配置

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `restartWaitMs` | `7000` | 重新拉起前等待旧进程释放端口的时长。 |
| `restartCommand` | *(自动)* | 可选的重启命令覆盖，用于 supervisor 管理的部署；默认重建当前调用。 |
| `reopenUrl` | *(自动)* | 可选的重开地址；默认 `http://127.0.0.1:<webServer.port>`。 |

## Model Experience

无。该 Remote 只做进程生命周期操作，不贡献任何工具、提示词或模型可见数据。

#### KV Cache effect

无。

## Known Limitations and Deferred Work

- **跨平台重启** —— Windows 通过无窗口 `wscript` VBS 经 `cmd /c start` 脱离父进程 job 重新拉起；macOS 与 Linux 用 detach 的 `sh` 脚本 + `open` / `xdg-open`。
- **延迟退出** —— `appExit` 在 Remote 返回后延迟固定 `EXIT_DEFER_MS` 触发；极慢的客户端链路理论上仍可能在退出前收不到确认，不过优雅释放会冲刷已排队的响应。
