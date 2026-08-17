/** Web power button beside Settings: hover menu to shut down or restart the GUI. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls ui-sidebar's SlotMap merge (the 'sidebar.power' entry).
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { PowerButton, type PowerButtonInjected } from './PowerButton.tsx'
import { en, zh, type PowerKey } from './locales.ts'

export type { PowerButtonInjected, PowerButtonProps } from './PowerButton.tsx'
export type { PowerKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Power button + hover menu copy. */
    power: PowerKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'power'

/** Required services: slots/locale for the seat, plus the generated power Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.power']

/**
 * Register the `power` dictionary and the power button into the sidebar foot.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-power: dictionaries')

  const shutdown: PowerButtonInjected['shutdown'] = async () => {
    const result = await ctx.remote.power.shutdown()
    if (!result.ok) throw new Error(result.error.message)
  }
  const restart: PowerButtonInjected['restart'] = async () => {
    const result = await ctx.remote.power.restart()
    if (!result.ok) throw new Error(result.error.message)
  }
  const injected = (): PowerButtonInjected => ({ shutdown, restart })

  ctx.slots.inject('sidebar.power', () => ctx.slots.register({
    name: 'sidebar.power',
    locale: NS,
    inject: injected,
  }, PowerButton))
}
