/**
 * Client color-accents plugin: stacks a brand-blue token accent layer and
 * installs the read-only git-tag decorator so the accent stylesheet can color
 * the git tags in both third-party git panels.
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the `ctx.theme` Context merge and the override layer type.
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import { installGitDecorator } from './decorator.ts'
import './styles/accents.module.css'

/** Override-layer identity (the package id names the layer for inspection). */
const ACCENT_SOURCE = 'ui-color-accents'

/**
 * Brand-blue accent layer. The alias sheet leaves `brand-primary` neutral
 * (ink); re-pointing it at the business blue colors focus rings, input
 * borders, selected states, and brand text while the primary button fill is
 * re-pinned to the original neutral so its inverted label contrast is
 * untouched in both palettes.
 */
const ACCENT_OVERRIDES: ThemeTokenOverrides = {
  '--dsw-alias-brand-primary': {
    light: 'var(--dsw-alias-state-business-primary)',
    dark: 'var(--dsw-alias-state-business-primary)',
  },
  '--dsw-alias-button-primary-fill': {
    light: 'var(--dsw-static-neutral-bluish-1000)',
    dark: 'var(--dsw-static-neutral-bluish-50)',
  },
}

/** The `theme` service is a hard dependency: the accent layer must always stack. */
export const inject = ['theme']

/**
 * Client plugin body: stack the accent token layer and install the git
 * decorator; both side effects release with the plugin fiber.
 * @param ctx - client cordis context.
 */
export function apply(ctx: Context): void {
  ctx.effect(
    () => ctx.theme.overrideTokens(ACCENT_SOURCE, ACCENT_OVERRIDES),
    'ui-color-accents: brand-blue token layer',
  )
  ctx.effect(() => installGitDecorator(), 'ui-color-accents: git tag decorator')
}
