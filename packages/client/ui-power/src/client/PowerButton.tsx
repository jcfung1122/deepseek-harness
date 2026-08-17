/**
 * Power button beside the Settings trigger: hover opens a two-item menu
 * (shut down / restart), each gated by an inline confirm before invoking the
 * Host power Remote. On acknowledgement the page closes itself via
 * `window.close()`, so only this DSH page is closed — never other Chrome
 * windows.
 */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './power.module.css'

/** Inline power glyph (open ring + top stem), so the plugin carries no icon-library dependency. */
function PowerIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.71 3.88a5.25 5.25 0 1 1-7.42 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 1.17V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Injected business face: the two Host power actions, surfaced from the Remote. */
export interface PowerButtonInjected {
  /** Request a clean process shutdown; resolves once the Host acknowledged. */
  shutdown: () => Promise<void>
  /** Request a restart; resolves once the Host acknowledged and detached its re-launcher. */
  restart: () => Promise<void>
}

/** Full component props: the sidebar.footer.action seat + locale + injected face. */
export type PowerButtonProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'power'> & PowerButtonInjected

type PowerAction = 'shutdown' | 'restart'

/**
 * How long the menu stays open after the pointer leaves it, so crossing the
 * gap between the button and the menu never collapses the menu mid-move.
 */
const MENU_CLOSE_DELAY_MS = 150

/**
 * Render the power trigger and its hover menu.
 * @param props - composed slot props.
 * @returns the power button tree.
 */
export function PowerButton({ wide, t, shutdown, restart }: PowerButtonProps) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<PowerAction | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const clearClose = (): void => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = undefined
    }
  }

  const openMenu = (): void => {
    clearClose()
    setOpen(true)
  }

  const closeMenu = (): void => {
    clearClose()
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = undefined
      setOpen(false)
      setConfirming(null)
      setError(null)
    }, MENU_CLOSE_DELAY_MS)
  }

  const dismiss = (): void => {
    clearClose()
    setOpen(false)
    setConfirming(null)
    setError(null)
  }

  useEffect(() => clearClose, [])

  const invoke = async (action: PowerAction): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      await (action === 'shutdown' ? shutdown() : restart())
      // Only this page closes; other browser windows stay untouched.
      window.close()
    } catch (cause) {
      setBusy(false)
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  return (
    <div
      className={css.wrap}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <button
        type="button"
        className={wide ? css.button : `${css.button} ${css.rail}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('aria')}
        onClick={() => {
          if (open) {
            dismiss()
          } else {
            openMenu()
          }
        }}
      >
        <PowerIcon size={wide ? 16 : 18} />
        {wide && <span className={css.label}>{t('trigger')}</span>}
      </button>
      {open && (
        <div className={css.menu} role="menu" onMouseEnter={openMenu}>
          {confirming === null ? (
            <>
              <button type="button" role="menuitem" className={css.item} disabled={busy} onClick={() => { setConfirming('shutdown') }}>
                {t('shutdown')}
              </button>
              <button type="button" role="menuitem" className={css.item} disabled={busy} onClick={() => { setConfirming('restart') }}>
                {t('restart')}
              </button>
            </>
          ) : (
            <div className={css.confirm}>
              <p className={css.confirmText}>{confirming === 'shutdown' ? t('shutdown.confirm') : t('restart.confirm')}</p>
              {error !== null && <p className={css.error}>{error}</p>}
              <div className={css.confirmActions}>
                <button type="button" className={css.confirmButton} disabled={busy} onClick={() => { setConfirming(null); setError(null) }}>
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className={`${css.confirmButton} ${css.confirmDanger}`}
                  disabled={busy}
                  onClick={() => { void invoke(confirming) }}
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
