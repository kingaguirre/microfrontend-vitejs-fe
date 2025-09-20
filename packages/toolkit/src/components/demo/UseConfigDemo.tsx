// packages/toolkit/src/components/demo/UseConfigDemo.tsx
import React, { useMemo, useState } from 'react'
import { useConfig, useAllMergedConfigs, useModuleConfig, deepMergeConfig } from '@app/common'

type AnyObj = Record<string, any>
const pretty = (v: any) => JSON.stringify(v, null, 2)
const isObj = (x: any): x is AnyObj => x && typeof x === 'object' && !Array.isArray(x)

/* ---------- shallow + deep utils ---------- */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
    return true
  }
  if (isObj(a) && isObj(b)) {
    const ak = Object.keys(a),
      bk = Object.keys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) if (!deepEqual(a[k], b[k])) return false
    return true
  }
  return false
}
function collectLeafPaths(o: any, prefix = '', out: string[] = []): string[] {
  if (!isObj(o)) return out
  for (const k of Object.keys(o)) {
    const p = prefix ? `${prefix}.${k}` : k
    const v = o[k]
    if (isObj(v)) collectLeafPaths(v, p, out)
    else out.push(p)
  }
  return out
}
function getAtPath(obj: any, path: string) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

/* ---------- JSON viewer with highlight ---------- */
type HighlightSets = { local: Set<string>; runtime: Set<string> }
function JsonViewer({
  value,
  path = '',
  highlights,
  level = 0
}: {
  value: any
  path?: string
  level?: number
  highlights: HighlightSets
}) {
  if (!isObj(value)) {
    return <span className="font-mono">{JSON.stringify(value)}</span>
  }
  const keys = Object.keys(value)
  return (
    <div className="font-mono text-sm">
      {'{'}
      {keys.map((k, idx) => {
        const p = path ? `${path}.${k}` : k
        const v = value[k]
        const hlLocal = highlights.local.has(p)
        const hlRuntime = highlights.runtime.has(p)
        const bg = hlRuntime
          ? 'bg-green-100 ring-1 ring-green-300'
          : hlLocal
            ? 'bg-yellow-100 ring-1 ring-yellow-300'
            : ''
        const title = hlRuntime
          ? 'Overwritten by runtime overrides'
          : hlLocal
            ? 'Overwritten by local config (beats cloud)'
            : undefined
        return (
          <div key={p} className="pl-4">
            <span className={`pr-1 ${bg}`} title={title}>
              "{k}"
            </span>
            :{' '}
            {isObj(v) ? (
              <JsonViewer value={v} path={p} highlights={highlights} level={level + 1} />
            ) : (
              <span className={`whitespace-pre ${bg}`} title={title}>
                {JSON.stringify(v)}
              </span>
            )}
            {idx < keys.length - 1 ? ',' : ''}
          </div>
        )
      })}
      {'}'}
    </div>
  )
}

export default function UseConfigDemo() {
  // select fields individually (no object-literal selectors to keep snapshots stable)
  const setConfig = useConfig((s: any) => s.setConfig)
  const resetConfig = useConfig((s: any) => s.resetConfig)
  const refreshBase = useConfig((s: any) => s.refreshBase)
  const baseStatus = useConfig((s: any) => s.baseStatus)
  const baseError = useConfig((s: any) => s.baseError)
  const cloudMap = useConfig((s: any) => s.cloud)
  const baseMap = useConfig((s: any) => s.base) // stored cloud base (object)
  const localMap = useConfig((s: any) => s.local) // local file config (object)
  const overridesMap = useConfig((s: any) => s.overrides)

  const allMerged = useAllMergedConfigs()
  const moduleKeys = useMemo(() => Object.keys(allMerged).sort(), [allMerged])
  const [moduleKey, setModuleKey] = useState(moduleKeys[1] ?? '')

  const entry = useModuleConfig(moduleKey) // { moduleName, config } | undefined
  const finalConfig = entry?.config ?? {}

  const cloudSrc = cloudMap[moduleKey]
  const cloudBase = baseMap[moduleKey] ?? {}
  const localConf = localMap[moduleKey] ?? {}
  const runtimeOvr = overridesMap[moduleKey] ?? {}

  // compute highlight paths:
  // local overwrite: leaf appears in both cloud & local and differs from cloud
  const localPaths = collectLeafPaths(localConf)
  const localOverwrites = new Set<string>()
  for (const p of localPaths) {
    if (getAtPath(cloudBase, p) === undefined) continue
    const c = getAtPath(cloudBase, p)
    const l = getAtPath(localConf, p)
    if (!deepEqual(c, l)) localOverwrites.add(p)
  }

  // runtime overwrite: leaf appears in runtime and differs from preRuntime (cloud ← local)
  const preRuntime = useMemo(() => deepMergeConfig(cloudBase, localConf), [cloudBase, localConf])
  const runtimePaths = collectLeafPaths(runtimeOvr)
  const runtimeOverwrites = new Set<string>()
  for (const p of runtimePaths) {
    const before = getAtPath(preRuntime, p)
    const after = getAtPath(finalConfig, p)
    if (!deepEqual(before, after)) runtimeOverwrites.add(p)
  }

  // simple runtime override example
  const applyRuntimeExample = () => {
    if (!moduleKey) return
    setConfig(moduleKey, (cur: any) =>
      deepMergeConfig(cur ?? {}, { runtime: { apiBase: '/api/toolkit-example' } })
    )
  }
  const clearOverrides = () => {
    if (!moduleKey) return
    resetConfig(moduleKey)
  }

  if (moduleKeys.length === 0) {
    return (
      <div className="prose max-w-none p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">🧩 useConfig Demo</h2>
        <p>
          No modules discovered. Add at least one{' '}
          <code>packages/&lt;name&gt;/src/module.config.json</code>.
        </p>
      </div>
    )
  }

  const status = baseStatus[moduleKey] ?? 'idle'
  const err = baseError[moduleKey]

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-use-config"
    >
      <h2 className="text-2xl font-bold mb-4">🧩 useConfig Demo (cloud base ← local ← runtime)</h2>

      {/* INFO BOX */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-blue-900 font-semibold mb-2">ℹ️ How merging + highlights work</h3>
        <ul className="list-disc list-inside text-sm text-blue-900">
          <li>
            If <code>cloudConfig.endpoint</code> exists, we fetch a JSON object as <b>cloud base</b>
            . If the API wraps it, set <code>cloudConfig.select</code> (e.g.,{' '}
            <code>"data.config"</code>).
          </li>
          <li>
            Effective config = <code>cloud base</code> ←{' '}
            <code>
              local file <b>config</b>
            </code>{' '}
            ← <code>runtime overrides</code> (rightmost wins).
          </li>
          <li>
            <span className="bg-yellow-100 ring-1 ring-yellow-300 px-1 rounded">Yellow</span> keys
            in the <b>Final</b> column were overwritten by <b>local</b> config.
            <span className="ml-2 bg-green-100 ring-1 ring-green-300 px-1 rounded">Green</span> keys
            were overwritten by <b>runtime</b> overrides.
          </li>
          <li>
            Concrete example: if cloud returns <code>{`{ userId: 1 }`}</code> and local sets{' '}
            <code>{`"userId": "1234"`}</code>, the <b>Final</b> config shows{' '}
            <code>"userId": "1234"</code> highlighted in yellow.
          </li>
        </ul>
      </div>

      {/* Module controls */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Module</label>
        <select
          value={moduleKey}
          onChange={(e) => setModuleKey(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {moduleKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* THREE COLUMNS: Cloud / Local / Final (with highlights) */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold">1) Cloud vs Local vs Final (highlighted)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Cloud */}
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm text-slate-600 mb-1">Cloud base</div>
            <pre className="bg-white p-2 rounded text-sm overflow-x-auto">{pretty(cloudBase)}</pre>
            {/* 👇 ADDED: endpoint + status under the JSON block */}
            <div className="text-xs text-slate-600 mt-2">
              Endpoint: <code>{cloudSrc?.endpoint ?? '—'}</code>
              <br />
              Cloud fetch status: <code>{status}</code>
              {err ? (
                <>
                  {' '}
                  — <span className="text-red-600">{err}</span>
                </>
              ) : null}
            </div>
            <div className="mt-2">
              <button
                onClick={() => refreshBase(moduleKey)}
                className="bg-slate-700 text-white px-3 py-1.5 rounded text-xs"
                title="Manually refetch & store cloud base"
              >
                Refetch Cloud Base
              </button>
            </div>
          </div>

          {/* Local */}
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm text-slate-600 mb-1">Local config (module.config.json)</div>
            <pre className="bg-white p-2 rounded text-sm overflow-x-auto">{pretty(localConf)}</pre>
          </div>

          {/* Final with highlights */}
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm text-slate-600 mb-1">Final (cloud ← local ← runtime)</div>
            <div className="bg-white p-2 rounded text-sm overflow-x-auto">
              <JsonViewer
                value={finalConfig}
                highlights={{ local: localOverwrites, runtime: runtimeOverwrites }}
              />
            </div>
            <div className="text-xs text-slate-600 mt-2">
              <span className="bg-yellow-100 ring-1 ring-yellow-300 px-1 rounded">Yellow</span> —
              local overwrote cloud,&nbsp;
              <span className="bg-green-100 ring-1 ring-green-300 px-1 rounded">Green</span> —
              runtime overwrote earlier layers.
            </div>
          </div>
        </div>
      </section>

      {/* UPDATE (runtime) */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold">2) Update (runtime only)</h3>
        <p className="text-sm text-slate-700 mb-2">
          Apply a simple runtime override so it’s obvious in the highlights:
        </p>

        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{`{ "runtime": { "apiBase": "/api/toolkit-example" } }`}</pre>
        <div className="flex gap-2 mt-2">
          <button
            onClick={applyRuntimeExample}
            className="bg-emerald-700 text-white px-4 py-2 rounded"
            title="Deep-merge runtime.apiBase into current config overrides"
          >
            Apply Runtime Example
          </button>
          <button onClick={clearOverrides} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">
            Reset Overrides
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{`// Code used by the button:
import { useConfig, deepMergeConfig } from '@app/common';
const setConfig = useConfig(s => s.setConfig);
setConfig('${moduleKey}', cur => deepMergeConfig(cur ?? {}, { runtime: { apiBase: '/api/toolkit-example' } }));`}</pre>

          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{`// Reset overrides:
import { useConfig } from '@app/common';
const resetConfig = useConfig(s => s.resetConfig);
resetConfig('${moduleKey}');`}</pre>
        </div>
      </section>

      {/* Snapshot */}
      <section className="mt-6">
        <h3 className="font-semibold">All merged entries</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{pretty(allMerged)}</pre>
      </section>
      {/* ──────────────────────────────
    Hooks Reference / How to use
────────────────────────────── */}
      <section className="mb-6 bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
        <h3 className="text-indigo-900 font-semibold mb-2">🔎 Config hooks — what to use when</h3>
        <ul className="list-disc list-inside text-sm text-indigo-900 space-y-2">
          <li>
            <code className="font-mono">useModuleConfig(moduleName)</code> → returns
            <code className="font-mono">{' { moduleName, config } '}</code> for a single module
            (merged: <b>cloud</b> ← <b>local</b> ← <b>runtime</b>). Best for pages scoped to one
            module.
            <pre className="bg-white p-2 rounded text-xs mt-2 overflow-x-auto">{`const entry = useModuleConfig('toolkit');
const cfg = entry?.config; // merged config for 'toolkit'`}</pre>
          </li>

          <li>
            <code className="font-mono">useAllMergedConfigs()</code> → returns
            <code className="font-mono">{' { [name]: { moduleName, config } } '}</code>
            for <b>every</b> discovered module. Handy for dashboards, admin panels, or tooling.
            <pre className="bg-white p-2 rounded text-xs mt-2 overflow-x-auto">{`const all = useAllMergedConfigs();
Object.entries(all).forEach(([name, { config }]) => {
  // render per-module config summary
});`}</pre>
          </li>

          <li>
            <code className="font-mono">useConfig(selector)</code> → low-level store access: select{' '}
            <b>actions</b> and <b>raw maps</b> (base/local/overrides/status). Avoid object-literal
            selectors; pick fields individually to keep snapshots stable.
            <pre className="bg-white p-2 rounded text-xs mt-2 overflow-x-auto">{`const setConfig  = useConfig(s => s.setConfig);
const reset      = useConfig(s => s.resetConfig);
const refresh    = useConfig(s => s.refreshBase);
const baseStatus = useConfig(s => s.baseStatus);`}</pre>
          </li>

          <li>
            <code className="font-mono">deepMergeConfig(a, b)</code> → deep merge for objects
            (objects merge, arrays/primitives are replaced by <code className="font-mono">b</code>).
            Use this when you want to <b>patch nested structures</b> in runtime overrides without
            clobbering siblings.
            <pre className="bg-white p-2 rounded text-xs mt-2 overflow-x-auto">{`// Patch runtime.apiBase without losing other runtime keys
setConfig('toolkit', cur => deepMergeConfig(cur ?? {}, { runtime: { apiBase: '/api/toolkit-example' } }));`}</pre>
          </li>

          <li className="mt-2">
            <b>Precedence rule (rightmost wins):</b> <code>cloud base</code> ←{' '}
            <code>local file config</code> ← <code>runtime overrides</code>. If cloud returns{' '}
            <code>{`{ userId: 1 }`}</code> and local sets <code>{'"userId": "1234"'}</code>, final
            is <code>"1234"</code>. In the demo, keys overwritten by local are{' '}
            <span className="bg-yellow-100 ring-1 ring-yellow-300 px-1 rounded">yellow</span>, and
            keys overwritten by runtime are{' '}
            <span className="bg-green-100 ring-1 ring-green-300 px-1 rounded">green</span>.
          </li>
        </ul>
      </section>
    </div>
  )
}
