/** Dictionary copy for the power button and its hover menu. */
export type PowerKey =
  | 'trigger'
  | 'aria'
  | 'shutdown'
  | 'restart'
  | 'shutdown.confirm'
  | 'restart.confirm'
  | 'confirm'
  | 'cancel'

export const zh: Record<PowerKey, string> = {
  trigger: '电源',
  aria: '电源',
  shutdown: '关闭 DSH',
  restart: '重启 Web UI',
  'shutdown.confirm': '确认关闭 DSH？将关闭本页面和后台服务。',
  'restart.confirm': '确认重启 Web UI？将重启服务并重新打开本页面。',
  confirm: '确认',
  cancel: '取消',
}

export const en: Record<PowerKey, string> = {
  trigger: 'Power',
  aria: 'Power',
  shutdown: 'Shut down DSH',
  restart: 'Restart Web UI',
  'shutdown.confirm': 'Shut down DSH? This closes this page and the backend service.',
  'restart.confirm': 'Restart Web UI? The service restarts and this page reopens.',
  confirm: 'Confirm',
  cancel: 'Cancel',
}
