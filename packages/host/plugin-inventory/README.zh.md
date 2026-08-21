# @deepseek-ai/dsh-host-plugin-inventory

[English](README.md) | 中文

当前 Cordis Loader 树的 Host 投影。`PluginInventoryGateway` 注册 `pluginInventory` 服务，并发布两个由 Typert 生成的直接 Remote：`pluginInventory/list` 与 `pluginInventory/setEnabled`。每次 `list` 调用都直接读取 `ctx.loader.entries()`，跳过结构性的 group 行，再按 Loader 顺序返回其余条目，并且只包含 Loader 条目 id、模块标识、有效启用状态与当前根 Fiber 阶段。`setEnabled` 在运行时热插拔一个非 group 条目：按嵌套 id 解析条目，并通过 Loader 自身的 `Entry.update` 路径应用 `disabled` 标志。

阶段为 `pending`、`loading`、`active`、`failed` 或 `unloading`；条目没有存活的根 Fiber 时则为 `null`。该快照刻意只表示调用当下：Loader 仍是唯一的生命周期权威，本包不拥有缓存、历史或来源模型；其唯一的修改是每个条目的启用/停用开关，运行时效果走 Loader 的 inject 等待（被停用条目的依赖方保持 pending，直到它恢复）。该修改是会话级的：Web profile 的根 `cordis.yml` 每次启动都被重写为空，因此开关不会写入用户持久化的 patch 层。公开 payload 类型位于 `./types`，Typert 生成由 `./typert` 与 `./remote` 导出的 Host 和 Client Remote 产物。

该服务仅供 Remote 使用，刻意不声明同进程 Cordis `Context` merge。Client 包通过显式的 [`api-remotes`](../../api/remotes/README.zh.md) 组合消费它，而不导入 Host 实现。

## 模型体验

无，因为这个仅限 Host 的清单投影不注册提示词、工具、消息或提供方请求。

#### KV Cache 影响

无；本包从不组装模型输入。

## 已知限制与暂缓事项

- **仅表示调用当下** —— 结果不包含持久的失败历史或订阅；只要不存在存活的根 Fiber，就会报告 `null`，而不区分其原因。
- **无来源识别** —— 服务不识别条目由哪个 bundle、profile 或 override 引入。
- **热插拔为会话级** —— `setEnabled` 只改运行中的树；它不会持久化到用户的 `cordis.patch.yml`（Web 根配置每次启动都被重写为空），因此被切换的插件会在重启后回到其组合默认值。
