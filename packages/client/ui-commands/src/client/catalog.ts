/**
 * Chinese overlay for the shipped Host slash-command descriptions. The key is
 * the command name (without the leading slash). The host registry already
 * carries an English description, which stays the display text for the English
 * locale and for any command not listed here (client contributions and future
 * commands); this catalog only overrides it for the Chinese locale. Command
 * names and their argument hints stay in English on purpose: they are the
 * literal command grammar the host parses, while the description is the
 * human-facing discovery copy shown in the "/" menu.
 */

/** Chinese description keyed by host command name. */
export const COMMAND_CATALOG: Readonly<Record<string, string>> = {
  compact: '压缩较早的对话历史',
  goal: '设置或查看长期任务的目标',
  feedback: '记录关于本次会话的反馈',
  permission: '切换权限预设（沙箱模式与审批策略）',
  plan: '进入或退出计划模式',
  export: '将会话日志下载为 ZIP 压缩包',
}
