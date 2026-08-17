# @deepseek-ai/dsh-client-ui-power

[English](README.md) | 中文

侧边栏底部「设置」旁边的电源按钮：悬浮弹出二级菜单（关闭 DSH / 重启 Web UI），每项都先内联确认，再调用宿主 `power` Remote（`dsh-host-power`）。收到确认后本页通过 `window.close()` 自行关闭，因此只关闭 DSH 这一页——绝不触碰其他 Chrome 窗口。

浏览器侧把按钮注册进 `sidebar.power`（由 `ui-sidebar` 声明），并经 `api-remotes` 装配读取生成的 `remote.power` Remote。宿主侧刻意留空——关闭/重启的进程动作都在宿主网关里。

## Model Experience

无。按钮只发起进程生命周期调用，不贡献任何工具、提示词或模型可见数据。

#### KV Cache effect

无。

## Known Limitations and Deferred Work

- **`window.close()` 可能被拦截** —— 手动打开的普通标签页（而非 Chrome 应用窗口）可能拒绝脚本关闭；此时页面只显示「连接已断开」，由用户手动关闭。其他窗口始终不受影响。
- **不可撤销** —— 关闭与重启都是破坏性操作；内联确认是唯一护栏，一旦 Remote 确认就无法取消。
