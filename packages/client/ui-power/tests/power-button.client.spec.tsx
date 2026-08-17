// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PowerButton, type PowerButtonInjected, type PowerButtonProps } from '../src/client/PowerButton.tsx'
import { zh } from '../src/client/locales.ts'

const t: PowerButtonProps['t'] = key => (zh as Record<string, string>)[key] ?? key

// The button never reads the global runtime hooks; stub them as never-called.
const neverHook = (() => { throw new Error('button must not read global hooks') }) as never

const globalProps = { useSessions: neverHook, useWorkspaces: neverHook }

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

function renderButton(overrides: Partial<PowerButtonInjected> = {}) {
  const injected = {
    shutdown: vi.fn(async () => {}),
    restart: vi.fn(async () => {}),
    ...overrides,
  }
  const view = render(<PowerButton wide t={t} {...globalProps} {...injected} />)
  return { ...injected, view }
}

const powerButton = () => screen.getByRole('button', { name: zh.aria })

describe('PowerButton', () => {
  it('opens the two-item menu on click', () => {
    renderButton()
    fireEvent.click(powerButton())
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()
    expect(screen.getByRole('menuitem', { name: zh.restart })).toBeDefined()
  })

  it('closes immediately on a second click while open', () => {
    renderButton()
    fireEvent.click(powerButton())
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()
    fireEvent.click(powerButton())
    expect(screen.queryByRole('menuitem', { name: zh.shutdown })).toBeNull()
  })

  it('renders icon-only in the rail and keeps the menu open across the leave gap', () => {
    vi.useFakeTimers()
    const injected = { shutdown: vi.fn(async () => {}), restart: vi.fn(async () => {}) }
    const view = render(<PowerButton wide={false} t={t} {...globalProps} {...injected} />)
    const button = powerButton()
    // Rail seat: icon only, no label span.
    expect(button.querySelector('span')).toBeNull()

    fireEvent.mouseEnter(button.parentElement!)
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()

    // Leaving schedules a delayed close; the menu is not closed instantly.
    fireEvent.mouseLeave(button.parentElement!)
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()

    // Entering the menu cancels the pending close.
    fireEvent.mouseEnter(screen.getByRole('menu'))
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()

    // A fresh leave closes after the delay elapses.
    fireEvent.mouseLeave(button.parentElement!)
    act(() => { vi.advanceTimersByTime(151) })
    expect(screen.queryByRole('menuitem', { name: zh.shutdown })).toBeNull()

    view.unmount()
    vi.useRealTimers()
  })

  it('confirms before shutting down, then closes this window', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {})
    const { shutdown } = renderButton()
    fireEvent.click(powerButton())
    fireEvent.click(screen.getByRole('menuitem', { name: zh.shutdown }))
    expect(screen.getByText(zh['shutdown.confirm'])).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: zh.confirm }))
    await vi.waitFor(() => { expect(shutdown).toHaveBeenCalledExactlyOnceWith() })
    expect(close).toHaveBeenCalledOnce()
  })

  it('cancels a pending confirmation back to the menu', () => {
    renderButton()
    fireEvent.click(powerButton())
    fireEvent.click(screen.getByRole('menuitem', { name: zh.restart }))
    fireEvent.click(screen.getByRole('button', { name: zh.cancel }))
    expect(screen.getByRole('menuitem', { name: zh.shutdown })).toBeDefined()
  })

  it('surfaces a Remote failure and keeps the menu open', async () => {
    renderButton({ shutdown: vi.fn(async () => { throw new Error('nope') }) })
    fireEvent.click(powerButton())
    fireEvent.click(screen.getByRole('menuitem', { name: zh.shutdown }))
    fireEvent.click(screen.getByRole('button', { name: zh.confirm }))
    await vi.waitFor(() => { expect(screen.getByText('nope')).toBeDefined() })
  })

  it('stringifies a non-Error failure', async () => {
    renderButton({ shutdown: vi.fn(async () => { throw 'oops' }) })
    fireEvent.click(powerButton())
    fireEvent.click(screen.getByRole('menuitem', { name: zh.shutdown }))
    fireEvent.click(screen.getByRole('button', { name: zh.confirm }))
    await vi.waitFor(() => { expect(screen.getByText('oops')).toBeDefined() })
  })

  it('invokes restart without closing until it resolves', async () => {
    const close = vi.spyOn(window, 'close').mockImplementation(() => {})
    const { restart } = renderButton()
    fireEvent.click(powerButton())
    fireEvent.click(screen.getByRole('menuitem', { name: zh.restart }))
    fireEvent.click(screen.getByRole('button', { name: zh.confirm }))
    await vi.waitFor(() => { expect(restart).toHaveBeenCalledExactlyOnceWith() })
    expect(close).toHaveBeenCalledOnce()
  })
})
