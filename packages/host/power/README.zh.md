# @deepseek-ai/dsh-host-power

[English](README.md) | 中文

宿主电源控制：一个 `power` Remote，对外提供 Web GUI 进程的干净关闭与重启，由 `dsh-client-ui-power` 浏览器按钮消费。

`shutdown` 先短暂延迟、待 Remote 确认已发回浏览器后，再请求启动器提供的 `appExit`（优雅释放并退出）。`restart` 先 detach 一个 PowerShell 辅助进程：轮询监听端口释放后运行一键启动器（仓库旁的 `start-dsh-web.vbs`，隐藏启动新 node 并重新打开 Chrome 窗口），随后请求同样的优雅退出。浏览器在收到确认后通过 `window.close()` 自行关闭本页，因此只关闭 DSH 这一页——绝不触碰其他 Chrome 窗口。

## Model Experience

无。该 Remote 只做进程生命周期操作，不贡献任何工具、提示词或模型可见数据。

#### KV Cache effect

无。

## Known Limitations and Deferred Work

- **重启复用一键启动器** —— 辅助进程通过仓库旁的 `start-dsh-web.vbs` 重新拉起。以其他方式启动 DSH（手动 `node ...`、supervisor）的部署应把 `restartCommand` 指向自己的启动器；当前版本没有按部署配置重启命令。
- **仅 Windows** —— 辅助进程是 PowerShell 单行命令 + `start-dsh-web.vbs`；单「关闭」跨平台，但「重启」是 Windows 专属。
- **延迟退出** —— `appExit` 在 Remote 返回后延迟固定 `EXIT_DEFER_MS` 触发；极慢的客户端链路理论上仍可能在退出前收不到确认，不过优雅释放会冲刷已排队的响应。
