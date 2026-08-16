/**
 * Localized display catalog for the shipped Host plugin inventory: one entry
 * per module specifier, giving each plugin a human-facing name and a one-line
 * summary in both shipped locales. The key is the exact Loader `moduleName`
 * (the `name:` value in a bundle's cordis.patch.yml), so a preset row that
 * mounts the same package resolves the same entry while an unknown module
 * falls back to the derived short name with no summary.
 *
 * zh is the source of truth for the entry set; the en half is authored to
 * match so English users get a proper name instead of a bare package fragment.
 */

export interface PluginCatalogEntry {
  readonly name: { readonly zh: string; readonly en: string }
  readonly summary: { readonly zh: string; readonly en: string }
}

/** Catalog keyed by Loader module specifier. */
export const PLUGIN_CATALOG: Readonly<Record<string, PluginCatalogEntry>> = {
  // ── dsh-base core ──────────────────────────────────────────────────────────
  '@deepseek-ai/cordis-plugin-timer': {
    name: { zh: '定时器', en: 'Timer' },
    summary: { zh: '提供 Cordis 定时器服务。', en: 'Provides the Cordis timer service.' },
  },
  '@deepseek-ai/cordis-plugin-hmr': {
    name: { zh: '热更新', en: 'Hot reload' },
    summary: { zh: '模块热更新与配置热重载。', en: 'Module hot reload and config hot reload.' },
  },
  '@deepseek-ai/dsh-llm': {
    name: { zh: '大模型能力', en: 'LLM capability' },
    summary: { zh: '模型能力定义与适配器框架。', en: 'Model capability definition and adapter framework.' },
  },
  '@deepseek-ai/dsh-session': {
    name: { zh: '会话', en: 'Session' },
    summary: { zh: '会话数据、持久化与投影。', en: 'Session data, persistence, and projection.' },
  },
  '@deepseek-ai/dsh-typert-registry': {
    name: { zh: '类型注册表', en: 'Type registry' },
    summary: { zh: 'Typert 运行时类型注册表。', en: 'Typert runtime type registry.' },
  },
  '@deepseek-ai/dsh-typert-loader': {
    name: { zh: '类型加载器', en: 'Type loader' },
    summary: { zh: '加载生成的 Typert 契约产物。', en: 'Loads generated Typert contract artifacts.' },
  },
  '@deepseek-ai/dsh-api-gateway': {
    name: { zh: 'API 网关', en: 'API gateway' },
    summary: { zh: '传输无关的远程调用分发。', en: 'Transport-agnostic remote dispatch.' },
  },
  '@deepseek-ai/dsh-session-title': {
    name: { zh: '会话标题', en: 'Session title' },
    summary: { zh: '会话标题兜底生成。', en: 'Fallback session title generation.' },
  },
  '@deepseek-ai/dsh-session-title-first-prompt-llm': {
    name: { zh: 'LLM 会话标题', en: 'LLM session title' },
    summary: { zh: '用首条提示由模型生成会话标题。', en: 'Titles sessions from the first prompt via a model.' },
  },
  '@deepseek-ai/dsh-user-questions': {
    name: { zh: '用户提问', en: 'User questions' },
    summary: { zh: '向用户提问并等待回答。', en: 'Asks the user questions and waits for answers.' },
  },
  '@deepseek-ai/dsh-agent': {
    name: { zh: 'Agent', en: 'Agent' },
    summary: { zh: 'Agent 生命周期与循环调度。', en: 'Agent lifecycle and loop dispatch.' },
  },
  '@deepseek-ai/dsh-agent-default-model': {
    name: { zh: '默认模型', en: 'Default model' },
    summary: { zh: '新 Agent 的默认模型选择。', en: 'Default model for newly created agents.' },
  },
  '@deepseek-ai/dsh-jobs-local': {
    name: { zh: '后台任务', en: 'Background jobs' },
    summary: { zh: '本地后台任务注册与执行。', en: 'Local background job registry and execution.' },
  },
  '@deepseek-ai/dsh-llm-retry': {
    name: { zh: '模型重试', en: 'LLM retry' },
    summary: { zh: '模型请求重试策略。', en: 'Model request retry policy.' },
  },
  '@deepseek-ai/dsh-settings-file': {
    name: { zh: '设置', en: 'Settings' },
    summary: { zh: '用户设置文档与热重载。', en: 'User settings document and hot reload.' },
  },
  '@deepseek-ai/dsh-credentials-local': {
    name: { zh: '凭据', en: 'Credentials' },
    summary: { zh: '密钥与凭据引用来源。', en: 'Credential and API-key reference sources.' },
  },
  '@deepseek-ai/dsh-llm-pi-ai': {
    name: { zh: '多提供方模型', en: 'Multi-provider LLM' },
    summary: { zh: 'pi-ai 多提供方模型路由。', en: 'pi-ai multi-provider model routing.' },
  },
  '@deepseek-ai/dsh-session-persistence-jsonl': {
    name: { zh: '会话持久化', en: 'Session persistence' },
    summary: { zh: 'JSONL 会话日志持久化。', en: 'JSONL session-log persistence.' },
  },
  '@deepseek-ai/dsh-attachment-local': {
    name: { zh: '附件存储', en: 'Attachments' },
    summary: { zh: '本地图片等附件字节存储。', en: 'Local storage of attachment bytes such as images.' },
  },
  '@deepseek-ai/dsh-session-query-sqlite': {
    name: { zh: '会话检索', en: 'Session query' },
    summary: { zh: 'SQLite 全文会话检索。', en: 'SQLite full-text session search.' },
  },
  '@deepseek-ai/dsh-session-projection': {
    name: { zh: '会话投影', en: 'Session projection' },
    summary: { zh: '会话投影单元注册表。', en: 'Session projection unit registry.' },
  },
  '@deepseek-ai/dsh-session-telemetry-otel': {
    name: { zh: '会话遥测', en: 'Session telemetry' },
    summary: { zh: 'OTLP 会话遥测上报。', en: 'OTLP session telemetry export.' },
  },
  '@deepseek-ai/dsh-subprocess-local': {
    name: { zh: '子进程', en: 'Subprocess' },
    summary: { zh: '本地子进程能力。', en: 'Local subprocess capability.' },
  },
  '@deepseek-ai/dsh-sandbox-local': {
    name: { zh: '沙箱', en: 'Sandbox' },
    summary: { zh: '文件沙箱执行边界。', en: 'File sandbox execution boundary.' },
  },
  '@deepseek-ai/dsh-sandbox-policy': {
    name: { zh: '沙箱策略', en: 'Sandbox policy' },
    summary: { zh: '沙箱模式与工作区策略。', en: 'Sandbox mode and workspace policy.' },
  },
  '@deepseek-ai/dsh-bash-sandbox': {
    name: { zh: 'Bash 沙箱', en: 'Bash sandbox' },
    summary: { zh: 'Bash 命令沙箱执行。', en: 'Bash command sandbox execution.' },
  },
  '@deepseek-ai/dsh-pwsh-sandbox': {
    name: { zh: 'PowerShell 沙箱', en: 'PowerShell sandbox' },
    summary: { zh: 'PowerShell 命令沙箱执行。', en: 'PowerShell command sandbox execution.' },
  },
  '@deepseek-ai/dsh-user-approval': {
    name: { zh: '用户审批', en: 'User approval' },
    summary: { zh: '审批策略与交互确认。', en: 'Approval policy and interaction confirmation.' },
  },
  '@deepseek-ai/dsh-permission-presets': {
    name: { zh: '权限预设', en: 'Permission presets' },
    summary: { zh: '沙箱与审批的组合预设。', en: 'Combined sandbox and approval presets.' },
  },
  '@deepseek-ai/dsh-shell-env': {
    name: { zh: 'Shell 环境', en: 'Shell environment' },
    summary: { zh: '发布 Shell 环境变量。', en: 'Publishes shell environment variables.' },
  },
  '@deepseek-ai/dsh-tool-bash': {
    name: { zh: 'Bash 工具', en: 'Bash tool' },
    summary: { zh: '模型可调用的 Bash 命令工具。', en: 'Model-invocable Bash command tool.' },
  },
  '@deepseek-ai/dsh-tool-pwsh': {
    name: { zh: 'PowerShell 工具', en: 'PowerShell tool' },
    summary: { zh: '模型可调用的 PowerShell 命令工具。', en: 'Model-invocable PowerShell command tool.' },
  },
  '@deepseek-ai/dsh-tool-jobs': {
    name: { zh: '后台任务工具', en: 'Background job tool' },
    summary: { zh: '模型可调用的后台任务控制。', en: 'Model-invocable background job controls.' },
  },
  '@deepseek-ai/dsh-fs-observation-policy': {
    name: { zh: '文件观察策略', en: 'File observation policy' },
    summary: { zh: '文件系统观察策略。', en: 'Filesystem observation policy.' },
  },
  '@deepseek-ai/dsh-tool-fs': {
    name: { zh: '文件工具', en: 'File tools' },
    summary: { zh: '模型可调用的文件读写工具。', en: 'Model-invocable file read/write tools.' },
  },
  '@deepseek-ai/dsh-tool-fs-search': {
    name: { zh: '文件搜索工具', en: 'File search tool' },
    summary: { zh: '模型可调用的文件搜索。', en: 'Model-invocable file search.' },
  },
  '@deepseek-ai/dsh-agent-instructions': {
    name: { zh: 'Agent 指令', en: 'Agent instructions' },
    summary: { zh: '仓库级 Agent 工作指令。', en: 'Repository-level agent working instructions.' },
  },
  '@deepseek-ai/dsh-skill': {
    name: { zh: '技能', en: 'Skill' },
    summary: { zh: '技能注册表与加载。', en: 'Skill registry and loading.' },
  },
  '@deepseek-ai/dsh-skill-filesystem': {
    name: { zh: '技能文件系统', en: 'Skill filesystem' },
    summary: { zh: '从文件系统发现技能。', en: 'Discovers skills from the filesystem.' },
  },
  '@deepseek-ai/dsh-skill-badge': {
    name: { zh: '技能徽章', en: 'Skill badge' },
    summary: { zh: '会话中的技能徽章。', en: 'Skill badge in sessions.' },
  },
  '@deepseek-ai/dsh-tool-skill': {
    name: { zh: '技能工具', en: 'Skill tool' },
    summary: { zh: '模型可调用的技能加载工具。', en: 'Model-invocable skill loading tool.' },
  },
  '@deepseek-ai/dsh-commands': {
    name: { zh: '快捷命令', en: 'Commands' },
    summary: { zh: '人类快捷命令注册表。', en: 'Human shortcut-command registry.' },
  },
  '@deepseek-ai/dsh-command-feedback': {
    name: { zh: '反馈命令', en: 'Feedback command' },
    summary: { zh: '/feedback 会话反馈命令。', en: 'The /feedback session feedback command.' },
  },
  '@deepseek-ai/dsh-goal': {
    name: { zh: '目标', en: 'Goal' },
    summary: { zh: '持久化同会话目标领域。', en: 'Persisted same-session goal domain.' },
  },
  '@deepseek-ai/dsh-goal-round-driver': {
    name: { zh: '目标轮次驱动', en: 'Goal round driver' },
    summary: { zh: '目标自动延续轮次驱动。', en: 'Goal auto-continuation round driver.' },
  },
  '@deepseek-ai/dsh-command-goal': {
    name: { zh: '目标命令', en: 'Goal command' },
    summary: { zh: '/goal 目标管理命令。', en: 'The /goal management command.' },
  },
  '@deepseek-ai/dsh-plan-mode': {
    name: { zh: '计划模式', en: 'Plan mode' },
    summary: { zh: '计划模式状态与 /plan 命令。', en: 'Plan-mode state and the /plan command.' },
  },
  '@deepseek-ai/dsh-token-meter': {
    name: { zh: '令牌计量', en: 'Token meter' },
    summary: { zh: '上下文令牌计量与投影。', en: 'Context token metering and projection.' },
  },
  '@deepseek-ai/dsh-compaction-basic': {
    name: { zh: '会话压缩', en: 'Compaction' },
    summary: { zh: '会话历史压缩能力。', en: 'Session history compaction capability.' },
  },
  '@deepseek-ai/dsh-command-compact': {
    name: { zh: '压缩命令', en: 'Compact command' },
    summary: { zh: '/compact 手动压缩命令。', en: 'The /compact manual compaction command.' },
  },
  '@deepseek-ai/dsh-subagent': {
    name: { zh: '子代理', en: 'Subagent' },
    summary: { zh: '子代理注册表与委派。', en: 'Subagent registry and delegation.' },
  },
  '@deepseek-ai/dsh-subagent-spawn-in-process': {
    name: { zh: '子代理进程', en: 'Subagent spawn' },
    summary: { zh: '进程内派生子代理提供方。', en: 'In-process spawned subagent provider.' },
  },
  '@deepseek-ai/dsh-subagent-fork-in-process': {
    name: { zh: '子代理派生', en: 'Subagent fork' },
    summary: { zh: '进程内派生（fork）子代理提供方。', en: 'In-process fork subagent provider.' },
  },
  '@deepseek-ai/dsh-tool-subagent-control': {
    name: { zh: '子代理控制工具', en: 'Subagent control tool' },
    summary: { zh: '模型可调用的子代理控制。', en: 'Model-invocable subagent controls.' },
  },
  '@deepseek-ai/dsh-tool-subagent-control/list-agents': {
    name: { zh: '子代理列表工具', en: 'Subagent list tool' },
    summary: { zh: '模型可调用的子代理列表。', en: 'Model-invocable subagent listing.' },
  },
  '@deepseek-ai/dsh-tool-subagent': {
    name: { zh: '子代理委派工具', en: 'Subagent delegation tool' },
    summary: { zh: '模型可调用的子代理委派。', en: 'Model-invocable subagent delegation.' },
  },
  '@deepseek-ai/dsh-tool-subagent-report': {
    name: { zh: '子代理回报工具', en: 'Subagent report tool' },
    summary: { zh: '子代理向父代理回报通道。', en: 'Subagent-to-parent report channel.' },
  },
  '@deepseek-ai/dsh-workflow-worker-thread': {
    name: { zh: '工作流线程', en: 'Workflow worker' },
    summary: { zh: '工作流工作线程提供方。', en: 'Workflow worker-thread provider.' },
  },
  '@deepseek-ai/dsh-tool-workflow': {
    name: { zh: '工作流工具', en: 'Workflow tool' },
    summary: { zh: '模型可调用的工作流编排。', en: 'Model-invocable workflow orchestration.' },
  },
  '@deepseek-ai/dsh-tool-call-timeout-policy': {
    name: { zh: '工具超时策略', en: 'Tool timeout policy' },
    summary: { zh: '工具调用超时策略。', en: 'Tool-call timeout policy.' },
  },
  '@deepseek-ai/dsh-spill-local': {
    name: { zh: '溢写存储', en: 'Spill storage' },
    summary: { zh: '本地溢写存储提供方。', en: 'Local spill storage provider.' },
  },
  '@deepseek-ai/dsh-spill-policy': {
    name: { zh: '溢写策略', en: 'Spill policy' },
    summary: { zh: '超限内容溢写策略。', en: 'Oversized content spill policy.' },
  },
  '@deepseek-ai/dsh-session-checkpoint-policy': {
    name: { zh: '会话检查点', en: 'Session checkpoint' },
    summary: { zh: '会话持久化检查点策略。', en: 'Session durability checkpoint policy.' },
  },
  '@deepseek-ai/dsh-compaction-tool-result-pruner': {
    name: { zh: '结果裁剪', en: 'Result pruner' },
    summary: { zh: '工具结果超限裁剪。', en: 'Oversized tool-result pruning.' },
  },
  '@deepseek-ai/dsh-tool-todo': {
    name: { zh: '待办工具', en: 'Todo tool' },
    summary: { zh: '模型可调用的待办列表工具。', en: 'Model-invocable todo-list tool.' },
  },
  '@deepseek-ai/dsh-tool-goal': {
    name: { zh: '目标工具', en: 'Goal tool' },
    summary: { zh: '模型可调用的目标工具。', en: 'Model-invocable goal tool.' },
  },
  '@deepseek-ai/dsh-tool-ralph': {
    name: { zh: 'Ralph 工具', en: 'Ralph tool' },
    summary: { zh: '全新代理迭代 Ralph 工具。', en: 'Fresh-agent Ralph iteration tool.' },
  },
  '@deepseek-ai/dsh-tool-str-replace-editor': {
    name: { zh: '文本编辑工具', en: 'Text editor tool' },
    summary: { zh: '模型可调用的文本编辑工具。', en: 'Model-invocable text-editing tool.' },
  },
  '@deepseek-ai/dsh-repeat-tool-reminder': {
    name: { zh: '重复提醒', en: 'Repeat reminder' },
    summary: { zh: '连续重复工具调用提醒。', en: 'Consecutive-repeat tool-call reminders.' },
  },
  '@deepseek-ai/dsh-web': {
    name: { zh: '网页能力', en: 'Web capability' },
    summary: { zh: '网页搜索与抓取能力。', en: 'Web search and fetch capability.' },
  },
  '@deepseek-ai/dsh-web-search-deepseek': {
    name: { zh: 'DeepSeek 搜索', en: 'DeepSeek search' },
    summary: { zh: 'DeepSeek 搜索提供方。', en: 'DeepSeek search provider.' },
  },
  '@deepseek-ai/dsh-tool-web': {
    name: { zh: '网页搜索工具', en: 'Web search tool' },
    summary: { zh: '模型可调用的网页搜索工具。', en: 'Model-invocable web search tool.' },
  },
  '@deepseek-ai/dsh-tools': {
    name: { zh: '工具注册表', en: 'Tool registry' },
    summary: { zh: '模型工具注册表。', en: 'Model tool registry.' },
  },
  '@deepseek-ai/dsh-system-prompt': {
    name: { zh: '系统提示词', en: 'System prompt' },
    summary: { zh: '系统提示词组装与人设。', en: 'System prompt assembly and persona.' },
  },
  '@deepseek-ai/dsh-agent-loop': {
    name: { zh: 'Agent 循环', en: 'Agent loop' },
    summary: { zh: 'Agent 工具调用循环。', en: 'Agent tool-call loop.' },
  },
  '@deepseek-ai/dsh-fs-sandbox': {
    name: { zh: '文件系统沙箱', en: 'Filesystem sandbox' },
    summary: { zh: '沙箱化文件系统提供方。', en: 'Sandboxed filesystem provider.' },
  },
  '@deepseek-ai/dsh-llm-deepseek': {
    name: { zh: 'DeepSeek 模型', en: 'DeepSeek model' },
    summary: { zh: 'DeepSeek 原生模型适配器。', en: 'Native DeepSeek model adapter.' },
  },

  // ── dsh-web-app host plane ─────────────────────────────────────────────────
  '@deepseek-ai/dsh-code-runtime-worker-thread': {
    name: { zh: '代码运行时', en: 'Code runtime' },
    summary: { zh: '工作线程代码运行时。', en: 'Worker-thread code runtime.' },
  },
  '@deepseek-ai/dsh-storage': {
    name: { zh: '存储', en: 'Storage' },
    summary: { zh: '存储能力定义。', en: 'Storage capability definition.' },
  },
  '@deepseek-ai/dsh-storage-json': {
    name: { zh: 'JSON 存储', en: 'JSON storage' },
    summary: { zh: 'JSON 文件存储提供方。', en: 'JSON file storage provider.' },
  },
  '@deepseek-ai/dsh-storage-domain': {
    name: { zh: '领域存储', en: 'Domain storage' },
    summary: { zh: '领域键值存储。', en: 'Domain key-value storage.' },
  },
  '@deepseek-ai/dsh-message-feedback': {
    name: { zh: '消息反馈', en: 'Message feedback' },
    summary: { zh: '消息点赞/点踩与备注。', en: 'Message like/dislike and notes.' },
  },
  '@deepseek-ai/dsh-session-log-export': {
    name: { zh: '会话导出', en: 'Session export' },
    summary: { zh: '导出会话日志为 ZIP。', en: 'Exports the session log as a ZIP.' },
  },
  '@deepseek-ai/dsh-workspace': {
    name: { zh: '工作区', en: 'Workspace' },
    summary: { zh: '工作区路径与管理。', en: 'Workspace paths and management.' },
  },
  '@deepseek-ai/dsh-session-projection-cache': {
    name: { zh: '投影缓存', en: 'Projection cache' },
    summary: { zh: '会话投影持久化缓存。', en: 'Session projection persisted cache.' },
  },
  '@deepseek-ai/dsh-session-stats': {
    name: { zh: '会话统计', en: 'Session stats' },
    summary: { zh: '整段会话轮次/步数统计。', en: 'Whole-log turn/step counts.' },
  },
  '@deepseek-ai/dsh-host-directory-picker-auto': {
    name: { zh: '目录选择', en: 'Directory picker' },
    summary: { zh: '自动选择目录选择器交互。', en: 'Auto-selected directory picker interaction.' },
  },
  '@deepseek-ai/dsh-host-plugin-inventory': {
    name: { zh: '插件清单', en: 'Plugin inventory' },
    summary: { zh: 'Loader 插件清单与热插拔。', en: 'Loader plugin inventory and hot-swap.' },
  },
  '@deepseek-ai/dsh-host-apiproxy': {
    name: { zh: 'API 代理', en: 'API proxy' },
    summary: { zh: '浏览器到宿主的 API 分发。', en: 'Browser-to-host API dispatch.' },
  },
  '@deepseek-ai/dsh-cordis-host-runner': {
    name: { zh: '宿主 Cordis 运行器', en: 'Host Cordis runner' },
    summary: { zh: '宿主动态 Cordis 插件运行。', en: 'Host dynamic Cordis plugin runner.' },
  },
  '@deepseek-ai/dsh-web-app/startup': {
    name: { zh: 'Web 启动', en: 'Web startup' },
    summary: { zh: '解析 Web 启动参数。', en: 'Parses Web launch arguments.' },
  },
  '@deepseek-ai/dsh-host-webserver': {
    name: { zh: 'Web 服务器', en: 'Web server' },
    summary: { zh: 'HTTP 路由与端口绑定。', en: 'HTTP routing and port binding.' },
  },
  '@deepseek-ai/dsh-web-app': {
    name: { zh: 'Web 运行时', en: 'Web runtime' },
    summary: { zh: '前端静态服务与 Web 运行时。', en: 'Frontend static serving and Web runtime.' },
  },
  '@deepseek-ai/dsh-client-hmr': {
    name: { zh: '客户端热更新', en: 'Client hot reload' },
    summary: { zh: '浏览器端插件热更新。', en: 'Browser-side plugin hot reload.' },
  },
  '@deepseek-ai/dsh-client-modules': {
    name: { zh: '客户端模块', en: 'Client modules' },
    summary: { zh: '浏览器插件模块表。', en: 'Browser plugin module table.' },
  },
  '@deepseek-ai/dsh-client-connection': {
    name: { zh: '连接', en: 'Connection' },
    summary: { zh: '浏览器与宿主的传输。', en: 'Browser-to-host transport.' },
  },
  '@deepseek-ai/dsh-api-remotes': {
    name: { zh: 'API 远程客户端', en: 'API remotes' },
    summary: { zh: '远程 API 客户端聚合。', en: 'Remote API client assembly.' },
  },
  '@deepseek-ai/dsh-client-runtime': {
    name: { zh: '客户端运行时', en: 'Client runtime' },
    summary: { zh: '浏览器数据对象层与会话。', en: 'Browser data layer and sessions.' },
  },
  '@deepseek-ai/dsh-cordis-client-runner': {
    name: { zh: '客户端 Cordis 运行器', en: 'Client Cordis runner' },
    summary: { zh: '浏览器动态 Cordis 插件运行。', en: 'Browser dynamic Cordis plugin runner.' },
  },
  '@deepseek-ai/dsh-client-ui-theme': {
    name: { zh: '主题', en: 'Theme' },
    summary: { zh: '全局样式令牌与主题。', en: 'Global style tokens and theme.' },
  },
  '@deepseek-ai/dsh-client-locale': {
    name: { zh: '语言', en: 'Language' },
    summary: { zh: '界面多语言与语言切换。', en: 'UI localization and language switching.' },
  },
  '@deepseek-ai/dsh-client-ui-layout': {
    name: { zh: '布局', en: 'Layout' },
    summary: { zh: '界面整体布局。', en: 'Overall UI layout.' },
  },
  '@deepseek-ai/dsh-client-ui-sidebar': {
    name: { zh: '侧边栏', en: 'Sidebar' },
    summary: { zh: '会话侧边栏。', en: 'Session sidebar.' },
  },
  '@deepseek-ai/dsh-client-ui-settings': {
    name: { zh: '设置外壳', en: 'Settings shell' },
    summary: { zh: '设置对话框框架。', en: 'Settings dialog framework.' },
  },
  '@deepseek-ai/dsh-client-ui-settings-general': {
    name: { zh: '通用设置', en: 'General settings' },
    summary: { zh: '通用设置区。', en: 'General settings section.' },
  },
  '@deepseek-ai/dsh-client-ui-settings-models': {
    name: { zh: '模型设置', en: 'Model settings' },
    summary: { zh: '模型与提供方设置。', en: 'Model and provider settings.' },
  },
  '@deepseek-ai/dsh-client-ui-settings-plugin-inventory': {
    name: { zh: '插件清单页', en: 'Plugin inventory page' },
    summary: { zh: '插件清单设置标签页。', en: 'Plugin inventory settings tab.' },
  },
  '@deepseek-ai/dsh-client-ui-conversation': {
    name: { zh: '对话', en: 'Conversation' },
    summary: { zh: '对话流与输入框。', en: 'Conversation flow and composer.' },
  },
  '@deepseek-ai/dsh-client-ui-tool': {
    name: { zh: '工具展示', en: 'Tool display' },
    summary: { zh: '工具调用卡片展示。', en: 'Tool-call card display.' },
  },
  '@deepseek-ai/dsh-client-ui-cordis': {
    name: { zh: 'Cordis 面板', en: 'Cordis panel' },
    summary: { zh: '动态 Cordis 插件面板。', en: 'Dynamic Cordis plugin panel.' },
  },
  '@deepseek-ai/dsh-client-ui-workflow-run': {
    name: { zh: '工作流展示', en: 'Workflow display' },
    summary: { zh: '工作流运行节点展示。', en: 'Workflow run node display.' },
  },
  '@deepseek-ai/dsh-client-ui-deliverables': {
    name: { zh: '产出文件', en: 'Deliverables' },
    summary: { zh: '助手消息下的产出文件行。', en: 'Produced-files row under assistant messages.' },
  },
  '@deepseek-ai/dsh-client-ui-workspace': {
    name: { zh: '工作区面板', en: 'Workspace panel' },
    summary: { zh: '工作区面板与文件。', en: 'Workspace panel and files.' },
  },
  '@deepseek-ai/dsh-client-ui-input-trigger': {
    name: { zh: '输入触发器', en: 'Input triggers' },
    summary: { zh: '"/" 与 "@" 输入管线。', en: 'The "/" and "@" input pipeline.' },
  },
  '@deepseek-ai/dsh-client-ui-commands': {
    name: { zh: '快捷命令菜单', en: 'Command menu' },
    summary: { zh: '"/" 快捷命令菜单。', en: 'The "/" shortcut-command menu.' },
  },
  '@deepseek-ai/dsh-client-ui-skill': {
    name: { zh: '技能引用', en: 'Skill references' },
    summary: { zh: '技能引用与技能行展示。', en: 'Skill references and skill-row display.' },
  },
  '@deepseek-ai/dsh-client-ui-subagent': {
    name: { zh: '子代理界面', en: 'Subagent UI' },
    summary: { zh: '子代理会话界面。', en: 'Subagent conversation UI.' },
  },
  '@deepseek-ai/dsh-client-ui-jobs': {
    name: { zh: '后台任务列表', en: 'Background job list' },
    summary: { zh: '会话后台任务列表。', en: 'Session background job list.' },
  },
  '@deepseek-ai/dsh-client-ui-goal': {
    name: { zh: '目标栏', en: 'Goal bar' },
    summary: { zh: '输入区目标状态栏。', en: 'Goal status bar in the input dock.' },
  },
  '@deepseek-ai/dsh-client-ui-message-feedback': {
    name: { zh: '消息反馈按钮', en: 'Message feedback buttons' },
    summary: { zh: '消息操作条反馈按钮。', en: 'Message action-strip feedback buttons.' },
  },
  '@deepseek-ai/dsh-client-ui-model-selection': {
    name: { zh: '模型选择', en: 'Model selection' },
    summary: { zh: '/model 与输入区模型选择。', en: '/model and composer model selection.' },
  },
  '@deepseek-ai/dsh-client-ui-permission-presets': {
    name: { zh: '权限预设界面', en: 'Permission preset UI' },
    summary: { zh: '/permission 与权限设置行。', en: '/permission and the permission settings row.' },
  },
  '@deepseek-ai/dsh-client-ui-agent-preset': {
    name: { zh: 'Agent 预设', en: 'Agent preset' },
    summary: { zh: 'Agent 预设选择与设置。', en: 'Agent preset selection and settings.' },
  },
  '@deepseek-ai/dsh-client-ui-settings-plugins': {
    name: { zh: '插件配置', en: 'Plugin configuration' },
    summary: { zh: '插件配置设置区。', en: 'Plugin configuration settings section.' },
  },
  '@deepseek-ai/dsh-client-ui-plan': {
    name: { zh: '计划控制', en: 'Plan control' },
    summary: { zh: '输入区计划模式控制。', en: 'Composer plan-mode control.' },
  },
  '@deepseek-ai/dsh-client-ui-user-questions': {
    name: { zh: '用户提问界面', en: 'User questions UI' },
    summary: { zh: '用户提问交互界面。', en: 'User-question interaction UI.' },
  },
  '@deepseek-ai/dsh-client-ui-trajectory': {
    name: { zh: '轨迹视图', en: 'Trajectory view' },
    summary: { zh: '会话轨迹可视化。', en: 'Session trajectory visualization.' },
  },
}
