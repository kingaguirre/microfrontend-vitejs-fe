// packages/toolkit/src/GlobalStateDemo.tsx
import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import moduleConfig from '@components/../module.config.json'
import { useStore } from '@components/../useStore' // for module-local slice
import { useGlobalStore } from '@app/common' // for cross-module slices
import { FormControl } from 'react-components-lib.eaa'

const { moduleName } = moduleConfig

// ─────────────────────────────────────────────────────────────────────────────
// 1) Define the shape of our Query module slice.
//    We’ll use this in the demo to type‐safe our cross‐module inputs.
// ─────────────────────────────────────────────────────────────────────────────
interface QueryState {
  selected: string[]
  note: string
  switchX: boolean
  switchY: boolean
  starredEmails?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Main Demo Component
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_STARRED: string[] = []
export function GlobalStateDemo() {
  // ————————————————————————————————
  // Grab starredEmails from the 'query' global slice
  // ————————————————————————————————
  const starredEmails = useGlobalStore((s) => {
    const slice = s.store['query'] as QueryState | undefined
    return slice?.starredEmails ?? EMPTY_STARRED
  })

  return (
    <div className="mb-6">
      <div data-scroll-to-view="state-demo">
        <h3 className="text-xl font-semibold mb-6">
          Cross-Module Global State Demo ({moduleName} Module)
        </h3>

        {/* Navigation styled as info box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
          <h3 className="text-lg font-semibold mb-2">🔗 View the Query Module State</h3>
          <p className="text-sm">
            Want to review the latest shared state values in the <strong>Query module</strong>?{' '}
            <Link to="/query?scroll=state-demo" className="text-blue-600 underline">
              Go to Query State Demo →
            </Link>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          <ToolkitStatePanel />
          <QueryStatePanel />
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* Starred Emails Display */}
      {/* ───────────────────────────────────────────── */}
      <div className="mt-6 bg-white shadow rounded-lg p-6" data-scroll-to-view="starred-emails">
        <h4 className="text-lg font-semibold mb-4">⭐ Starred Emails</h4>

        {starredEmails.length === 0 ? (
          <p className="text-gray-600 text-sm mb-4">
            You haven’t starred any emails yet.{' '}
            <Link to="/query/graphql-demo" className="text-blue-600 underline">
              Go star some emails →
            </Link>
          </p>
        ) : (
          <>
            <ul className="space-y-4 mb-4">
              {starredEmails.map(({ id, title, body }) => (
                <li key={id} className="border bg-gray-50 p-4 rounded">
                  <h5 className="font-semibold">{title}</h5>
                  <p className="text-gray-700 text-sm mt-1">{body}</p>
                </li>
              ))}
            </ul>

            {/* Only show this when there are already starred emails */}
            <div className="mt-2 mb-4">
              <Link to="/query/graphql-demo" className="text-blue-600 underline">
                ⭐ Star more emails →
              </Link>
            </div>
          </>
        )}

        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <p className="text-sm">
            💡 <strong>Cross-Module State Example:</strong> This box demonstrates how the Query
            module’s state (starred emails) is shared and consumed here in the Toolkit module.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) ToolkitStatePanel
//    Uses useStore: your module’s slice lives under `store[moduleName]`
// ─────────────────────────────────────────────────────────────────────────────
function ToolkitStatePanel() {
  // Pull in our module slice: { counter?, switchA?, switchB? }
  const {
    state: toolkitState,
    setState,
    reset
  } = useStore<{
    counter?: number
    switchA?: boolean
    switchB?: boolean
  }>()

  // Default to 0 on first mount, so counter is never undefined
  useEffect(() => {
    if (toolkitState.counter === undefined) {
      setState({ counter: 0 })
    }
  }, [toolkitState.counter, setState])

  const toolkitCount = toolkitState.counter!

  // Handlers to update our local slice
  const adjustCounter = (delta: number) => setState({ counter: toolkitCount + delta })
  const toggleA = () => setState({ switchA: !toolkitState.switchA })
  const toggleB = () => setState({ switchB: !toolkitState.switchB })
  const wipeModuleState = () => reset() // resets the entire slice

  return (
    <div className="flex-1 bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Toolkit State Demo (module = {moduleName})</h4>

      {/* Counter controls */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={() => adjustCounter(-1)}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          −
        </button>
        <span className="text-2xl font-mono">{toolkitCount}</span>
        <button
          onClick={() => adjustCounter(1)}
          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
        >
          ＋
        </button>
      </div>

      {/* Switch toggles */}
      <div className="space-y-2 mb-4">
        <FormControl
          type="switch"
          label="Switch A"
          checked={toolkitState.switchA ?? false}
          onChange={toggleA}
          simple
        />
        <FormControl
          type="switch"
          label="Switch B"
          checked={toolkitState.switchB ?? false}
          onChange={toggleB}
          simple
        />
      </div>

      {/* Reset button */}
      <button
        onClick={wipeModuleState}
        className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
      >
        Reset Toolkit Slice
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) QueryStatePanel
//    Uses useGlobalStore: any module can read/write this slice.
// ─────────────────────────────────────────────────────────────────────────────
function QueryStatePanel() {
  // A single, memoized default to avoid new object each render
  const defaultQuery = useMemo<QueryState>(
    () => ({ selected: [], note: '', switchX: false, switchY: false }),
    []
  )

  // Selector for the Query slice; falls back to default if unset
  const querySlice = useGlobalStore((s) => (s.store['query'] as QueryState) ?? defaultQuery)

  // Helper to merge partial updates into the Query slice
  const setQuery = (patch: Partial<QueryState>) => {
    const full = (useGlobalStore.getState().store['query'] as QueryState) || defaultQuery
    useGlobalStore.getState().setStateFor('query', { ...full, ...patch })
  }

  // Handlers
  const toggleX = () => setQuery({ switchX: !querySlice.switchX })
  const toggleY = () => setQuery({ switchY: !querySlice.switchY })
  const resetQuerySlice = () => useGlobalStore.getState().resetStateFor('query')

  const options = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']

  return (
    <div className="flex-1 bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Query Module State Demo (cross-module)</h4>

      {/* Multi-select checklist */}
      <FormControl
        type="checkbox-group"
        options={options.map((label) => ({ value: label, text: label }))}
        value={querySlice.selected}
        onChange={(sel: string[]) => setQuery({ selected: sel })}
      />

      {/* Free-text note */}
      <div className="mt-4">
        <FormControl
          type="text"
          value={querySlice.note}
          onChange={(e) => setQuery({ note: e.target.value })}
          placeholder="Add a note…"
        />
      </div>

      {/* Two switches */}
      <div className="flex items-center mt-4 gap-4">
        <FormControl
          type="switch"
          label="Switch X"
          checked={querySlice.switchX}
          onChange={toggleX}
          simple
        />
        <FormControl
          type="switch"
          label="Switch Y"
          checked={querySlice.switchY}
          onChange={toggleY}
          simple
        />
      </div>

      {/* Reset Query slice */}
      <button
        onClick={resetQuerySlice}
        className="mt-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
      >
        Reset Query Slice
      </button>
    </div>
  )
}
