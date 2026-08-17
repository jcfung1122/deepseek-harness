/**
 * The bundle's substance is its patch file: the `dsh.bundle.patch` manifest
 * field must name a real, parseable patch list that inserts the two power rows.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as yaml from 'js-yaml'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'

describe('dsh-power bundle', () => {
  it('declares a parseable patch list through the dsh.bundle.patch manifest field', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>
      dsh?: { bundle?: { patch?: string } }
    }
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    const parsed = yaml.load(
      readFileSync(resolve(root, manifest.dsh!.bundle!.patch!), 'utf8'),
      { schema: entryListSchema },
    )
    expect(Array.isArray(parsed)).toBe(true)
    const rows = (parsed as { insert?: { id?: string; name?: string }[] }[]).flatMap(
      patch => patch.insert ?? [],
    )
    expect(rows.map(row => row.id)).toEqual(['power', 'ui-power'])
    expect(rows.map(row => row.name)).toEqual([
      '@deepseek-ai/dsh-host-power',
      '@deepseek-ai/dsh-client-ui-power',
    ])
    expect(manifest.dependencies).toHaveProperty('@deepseek-ai/dsh-host-power')
    expect(manifest.dependencies).toHaveProperty('@deepseek-ai/dsh-client-ui-power')
  })
})
