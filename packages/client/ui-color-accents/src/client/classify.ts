/**
 * Pure git-tag classification: maps a status letter or a ref decoration label
 * to a semantic kind the accent stylesheet colors. No DOM access, so the
 * mapping is unit-testable without a browser.
 */

/** Semantic git status kinds derived from git's XY status letters. */
export type StatusKind =
  | 'added'
  | 'deleted'
  | 'modified'
  | 'renamed'
  | 'copied'
  | 'unmerged'
  | 'typechange'
  | 'untracked'

/** Semantic git ref kinds derived from a ref decoration label. */
export type RefKind = 'head' | 'branch' | 'remote' | 'tag'

/**
 * Map one status letter (the X or Y of git's XY status, e.g. `M`, `A`, `?`)
 * to a semantic kind.
 * @param letter - a single status letter, possibly empty.
 * @returns the kind, or `null` when the letter carries no status.
 */
export function classifyStatusLetter(letter: string): StatusKind | null {
  switch (letter) {
    case 'A': return 'added'
    case 'D': return 'deleted'
    case 'M': return 'modified'
    case 'R': return 'renamed'
    case 'C': return 'copied'
    case 'U': return 'unmerged'
    case 'T': return 'typechange'
    case '?': return 'untracked'
    default: return null
  }
}

/**
 * Map one ref decoration label to a semantic kind. git-graph passes raw refs
 * (`HEAD -> main`, `tag: v1.0.0`, `origin/main`); better-sidebar passes
 * already-normalized names (its `refNames` strips the `tag: ` and `HEAD -> `
 * prefixes), which classify as `branch`/`remote`.
 * @param text - the ref label text.
 * @returns the ref kind.
 */
export function classifyRef(text: string): RefKind {
  const label = text.trim()
  if (label.startsWith('tag: ')) return 'tag'
  if (label.startsWith('HEAD')) return 'head'
  if (label.startsWith('origin/') || label.startsWith('upstream/')) return 'remote'
  return 'branch'
}
