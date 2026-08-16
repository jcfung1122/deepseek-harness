/**
 * Read-only DOM decorator: tags git elements with a semantic `data-dsh-git-kind`
 * so the accent stylesheet can color them. It only writes two data attributes
 * and never touches text content, layout, or interaction.
 */
import { classifyRef, classifyStatusLetter } from './classify.ts'

/** Attribute carrying the semantic kind consumed by the stylesheet. */
export const KIND_ATTR = 'data-dsh-git-kind'
/** Attribute marking an element as already decorated. */
export const DECORATED_ATTR = 'data-dsh-git-decorated'

const STATUS_SELECTOR = '[class*="gitBadge"]'
const REF_SELECTOR = '[class*="gitLogRef"], [data-gitgraph-ref]'

/** Decorate one status badge; a letter without a status keeps no kind attribute. */
function decorateStatus(el: Element): void {
  const kind = classifyStatusLetter(el.textContent.trim())
  if (kind !== null) el.setAttribute(KIND_ATTR, kind)
  el.setAttribute(DECORATED_ATTR, '')
}

/** Decorate one ref badge, preferring git-graph's explicit current-branch marker. */
function decorateRef(el: Element): void {
  const kind = el.hasAttribute('data-gitgraph-ref-current')
    ? 'head'
    : classifyRef(el.textContent.trim())
  el.setAttribute(KIND_ATTR, kind)
  el.setAttribute(DECORATED_ATTR, '')
}

/**
 * Decorate every undecorated git element under `root`.
 * @param root - the subtree to scan.
 * @returns the number of elements decorated in this pass.
 */
export function decorateOnce(root: ParentNode): number {
  let count = 0
  for (const el of root.querySelectorAll(STATUS_SELECTOR)) {
    if (el.hasAttribute(DECORATED_ATTR)) continue
    decorateStatus(el)
    count += 1
  }
  for (const el of root.querySelectorAll(REF_SELECTOR)) {
    if (el.hasAttribute(DECORATED_ATTR)) continue
    decorateRef(el)
    count += 1
  }
  return count
}

/**
 * Install a subtree MutationObserver that decorates git elements as they
 * appear. Returns a disposer that disconnects the observer; a no-op when the
 * environment lacks the DOM APIs.
 * @returns the disposer.
 */
export function installGitDecorator(): () => void {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }
  const observer = new MutationObserver(() => { decorateOnce(document.body) })
  observer.observe(document.body, { childList: true, subtree: true })
  decorateOnce(document.body)
  return () => { observer.disconnect() }
}
