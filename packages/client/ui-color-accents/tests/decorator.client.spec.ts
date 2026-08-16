// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DECORATED_ATTR, KIND_ATTR, decorateOnce, installGitDecorator } from '../src/client/decorator.ts'

function badge(text: string): HTMLSpanElement {
  const el = document.createElement('span')
  el.className = 'W-zNGW_gitBadge'
  el.textContent = text
  return el
}

function betterRef(text: string): HTMLSpanElement {
  const el = document.createElement('span')
  el.className = 'W-zNGW_gitLogRef'
  el.textContent = text
  return el
}

function graphRef(text: string, current = false): HTMLSpanElement {
  const el = document.createElement('span')
  el.setAttribute('data-gitgraph-ref', '')
  if (current) el.setAttribute('data-gitgraph-ref-current', '')
  el.textContent = text
  return el
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('decorateOnce', () => {
  it('decorates status badges with their semantic kind', () => {
    const added = badge('A')
    document.body.append(added)
    expect(decorateOnce(document.body)).toBe(1)
    expect(added.getAttribute(KIND_ATTR)).toBe('added')
    expect(added.hasAttribute(DECORATED_ATTR)).toBe(true)
  })

  it('marks a status badge decorated even when its letter carries no kind', () => {
    const empty = badge('')
    document.body.append(empty)
    decorateOnce(document.body)
    expect(empty.hasAttribute(KIND_ATTR)).toBe(false)
    expect(empty.hasAttribute(DECORATED_ATTR)).toBe(true)
  })

  it('classifies refs by their text', () => {
    const branch = betterRef('main')
    const remote = betterRef('origin/main')
    const tag = graphRef('tag: v1.0.0')
    document.body.append(branch, remote, tag)
    expect(decorateOnce(document.body)).toBe(3)
    expect(branch.getAttribute(KIND_ATTR)).toBe('branch')
    expect(remote.getAttribute(KIND_ATTR)).toBe('remote')
    expect(tag.getAttribute(KIND_ATTR)).toBe('tag')
  })

  it('prefers the git-graph current marker over the ref text', () => {
    const current = graphRef('main', true)
    document.body.append(current)
    decorateOnce(document.body)
    expect(current.getAttribute(KIND_ATTR)).toBe('head')
  })

  it('skips elements already marked decorated', () => {
    const el = badge('M')
    el.setAttribute(DECORATED_ATTR, '')
    document.body.append(el)
    expect(decorateOnce(document.body)).toBe(0)
    expect(el.getAttribute(KIND_ATTR)).toBeNull()
  })

  it('skips already-decorated refs too', () => {
    const el = betterRef('main')
    el.setAttribute(DECORATED_ATTR, '')
    document.body.append(el)
    expect(decorateOnce(document.body)).toBe(0)
    expect(el.getAttribute(KIND_ATTR)).toBeNull()
  })
})

describe('installGitDecorator', () => {
  it('decorates inserted nodes and stops after dispose', async () => {
    const dispose = installGitDecorator()
    const host = document.createElement('div')
    document.body.append(host)
    host.append(badge('M'))
    await vi.waitFor(() => {
      expect(host.querySelector('[class*="gitBadge"]')!.getAttribute(KIND_ATTR)).toBe('modified')
    })

    dispose()
    const added = badge('A')
    host.append(added)
    expect(added.hasAttribute(DECORATED_ATTR)).toBe(false)
  })

  it('returns a no-op when MutationObserver is unavailable', () => {
    vi.stubGlobal('MutationObserver', undefined)
    const dispose = installGitDecorator()
    expect(dispose).toBeTypeOf('function')
    dispose()
  })

  it('returns a no-op when the document is unavailable', () => {
    vi.stubGlobal('document', undefined)
    expect(installGitDecorator()).toBeTypeOf('function')
  })
})
