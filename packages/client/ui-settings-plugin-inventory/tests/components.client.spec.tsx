// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PluginInventorySettingsTab } from '../src/client/PluginInventorySettingsTab.tsx'
import type {
  PluginInventorySettingsTabInjected,
  PluginInventorySettingsTabProps,
} from '../src/client/PluginInventorySettingsTab.tsx'
import { en, type PluginInventoryLocaleKey } from '../src/client/locales.ts'

afterEach(cleanup)

type Snapshot = Awaited<ReturnType<PluginInventorySettingsTabInjected['list']>>
const t = ((key: PluginInventoryLocaleKey, params?: Record<string, unknown>): string => {
  const template = en[key]
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match)
}) as PluginInventorySettingsTabProps['t']

function props(
  list: PluginInventorySettingsTabInjected['list'],
  overrides: Partial<PluginInventorySettingsTabInjected> = {},
): PluginInventorySettingsTabProps {
  return {
    t,
    list,
    describe: () => undefined,
    setEnabled: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as PluginInventorySettingsTabProps
}

const SNAPSHOT = {
  entries: [
    { entryId: '8a1b2c3d', moduleName: '@deepseek-ai/cordis-plugin-hmr', enabled: true, fiberPhase: 'active' },
    { entryId: 'pending', moduleName: 'cordis:pending-name', enabled: true, fiberPhase: 'pending' },
    { entryId: 'loading', moduleName: '@fixture/loading-name', enabled: true, fiberPhase: 'loading' },
    { entryId: 'failed', moduleName: '@fixture/failed-name', enabled: true, fiberPhase: 'failed' },
    { entryId: 'unloading', moduleName: '@fixture/unloading-name', enabled: true, fiberPhase: 'unloading' },
    { entryId: 'unobserved', moduleName: '@fixture/unobserved-name', enabled: true, fiberPhase: null },
    { entryId: 'disabled-entry', moduleName: '@deepseek-ai/dsh-host-directory-picker-native', enabled: false, fiberPhase: null },
  ],
} as unknown as Snapshot

describe('PluginInventorySettingsTab', () => {
  it('renders runtime status only for enabled plugins', async () => {
    const deferred = Promise.withResolvers<Snapshot>()
    const list = vi.fn(() => deferred.promise)
    const view = render(<PluginInventorySettingsTab {...props(list)} />)
    expect(screen.getByText(en.loading)).toBeTruthy()

    await act(async () => { deferred.resolve(SNAPSHOT) })
    expect(list).toHaveBeenCalledOnce()
    expect(screen.getByRole('searchbox', { name: en.search })).toBeTruthy()
    expect(screen.getByRole('heading', { name: en.catalog })).toBeTruthy()
    expect(view.container.querySelector('[data-plugin-count]')?.textContent).toBe('7')
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(6)
    expect(screen.getAllByRole('switch', { checked: false })).toHaveLength(1)
    for (const value of [
      'Mounted',
      'Waiting for dependencies',
      'Loading',
      'Mount failed',
      'Unloading',
      'Not mounted',
    ]) {
      expect(screen.getByRole('img', { name: value })).toBeTruthy()
    }
    const active = screen.getByRole('button', { name: 'hmr, Mounted, Enabled' })
    expect(active.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(active)
    expect(active.getAttribute('aria-expanded')).toBe('true')
    expect(view.container.querySelector('[data-loader-entry]')?.textContent).toBe('8a1b2c3d')
    expect(screen.getByText(en.configuration)).toBeTruthy()
    expect(screen.getByText(en.cordis)).toBeTruthy()
    fireEvent.click(active)
    expect(view.container.querySelector('[data-loader-entry]')).toBeNull()

    fireEvent.click(active)
    fireEvent.change(screen.getByRole('searchbox', { name: en.search }), {
      target: { value: 'disabled-entry' },
    })
    expect(view.container.querySelector('[data-loader-entry]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'directory-picker-native, Disabled' }))
    expect(screen.getAllByText(en.disabledTag)).toHaveLength(1)
    expect(screen.queryByText(en.cordis)).toBeNull()
    expect(screen.queryByText(en.unobserved)).toBeNull()
  })

  it('filters by module name or Loader entry id', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT)} />)
    const search = await screen.findByRole('searchbox', { name: en.search })

    fireEvent.change(search, { target: { value: 'disabled-entry' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('directory-picker-native')).toBeTruthy()

    fireEvent.change(search, { target: { value: 'cordis-plugin-hmr' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('hmr')).toBeTruthy()

    fireEvent.change(search, { target: { value: 'not-a-plugin' } })
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(en.emptySearch)).toBeTruthy()
  })

  it('shows a generic failure and retries into the empty state', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>()
      .mockRejectedValueOnce(new Error('private transport detail'))
      .mockResolvedValueOnce({ entries: [] })
    render(<PluginInventorySettingsTab {...props(list)} />)

    expect((await screen.findByRole('alert')).textContent).toBe(en.error)
    expect(screen.queryByText('private transport detail')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.retry }))
    await waitFor(() => { expect(list).toHaveBeenCalledTimes(2) })
    expect(await screen.findByText(en.empty)).toBeTruthy()
  })

  it('contains a synchronous Remote failure and ignores a result after unmount', async () => {
    const syncFailure = vi.fn(() => { throw new Error('namespace unavailable') }) as PluginInventorySettingsTabInjected['list']
    const failed = render(<PluginInventorySettingsTab {...props(syncFailure)} />)
    expect((await screen.findByRole('alert')).textContent).toBe(en.error)
    failed.unmount()

    const deferred = Promise.withResolvers<Snapshot>()
    const pending = render(<PluginInventorySettingsTab {...props(() => deferred.promise)} />)
    pending.unmount()
    await act(async () => { deferred.resolve(SNAPSHOT) })

    const deferredFailure = Promise.withResolvers<Snapshot>()
    const pendingFailure = render(<PluginInventorySettingsTab {...props(() => deferredFailure.promise)} />)
    pendingFailure.unmount()
    await act(async () => { deferredFailure.reject(new Error('late failure')) })
  })

  it('renders the localized name and summary and falls back to the short name', async () => {
    const describe = vi.fn((moduleName: string) => moduleName === '@deepseek-ai/dsh-session'
      ? { name: '会话', summary: '会话数据、持久化与投影。' }
      : undefined)
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { describe })} />)

    // The disabled fixture uses an unmapped module name, so it keeps the short name.
    expect(await screen.findByText('directory-picker-native')).toBeTruthy()
    // Every card renders a toggle switch with its enabled state.
    expect(screen.getAllByRole('switch')).toHaveLength(7)
    expect(screen.getAllByRole('switch', { checked: true })).toHaveLength(6)
    expect(screen.getAllByRole('switch', { checked: false })).toHaveLength(1)
  })

  it('shows the summary from describe for a mapped module', async () => {
    const describe = vi.fn((moduleName: string) => moduleName === '@deepseek-ai/cordis-plugin-hmr'
      ? { name: '热更新', summary: '模块热更新与配置热重载。' }
      : undefined)
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { describe })} />)

    expect(await screen.findByText('热更新')).toBeTruthy()
    expect(screen.getByText('模块热更新与配置热重载。')).toBeTruthy()
  })

  it('toggles one entry and refreshes the snapshot on success', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>().mockResolvedValue(SNAPSHOT)
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>().mockResolvedValue(undefined)
    render(<PluginInventorySettingsTab {...props(list, { setEnabled })} />)

    await screen.findAllByRole('switch')
    const disabledSwitch = screen.getAllByRole('switch', { checked: false })[0]!
    await act(async () => { fireEvent.click(disabledSwitch) })
    expect(setEnabled).toHaveBeenCalledWith('disabled-entry', true)
    await waitFor(() => { expect(list).toHaveBeenCalledTimes(2) })
  })

  it('surfaces a toggle failure with its specific reason without crashing the list', async () => {
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockRejectedValueOnce(new Error('private toggle detail'))
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)

    await screen.findAllByRole('switch')
    await act(async () => {
      fireEvent.click(screen.getAllByRole('switch', { checked: false })[0]!)
    })
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('private toggle detail')
  })
})
