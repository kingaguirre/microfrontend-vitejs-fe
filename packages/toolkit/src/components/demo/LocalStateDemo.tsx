// packages/toolkit/src/LocalStateDemo.tsx
import React, { useMemo, useRef, useEffect } from 'react'
import moduleConfig from '@components/../module.config.json'
import { FormControl } from 'react-components-lib.eaa'
import { useStore } from '@components/../useStore'

const { moduleName } = moduleConfig

/**
 * Boolean checkbox demo (module-scoped global state)
 */
function BooleanBlock() {
  const {
    state: { checkbox = false },
    setState
  } = useStore<{ checkbox: boolean }>()

  const random = useMemo(() => Math.floor(Math.random() * 100), [])
  const toggle = () => setState({ checkbox: !checkbox })

  return (
    <div className="flex-1 bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-2">Checkbox Demo</h4>
      <p className="text-sm text-gray-600">
        Random this when re-render: <code className="text-pink-500 font-mono">{random}</code>.
      </p>
      <p className="mb-4">Toggling this won’t re-render the other blocks.</p>
      <label className="inline-flex items-center space-x-2">
        <FormControl type="checkbox" checked={checkbox} onChange={toggle} simple />
        <span>Enable feature</span>
      </label>
    </div>
  )
}

/**
 * Text-input demo (module-scoped global state)
 */
function TextBlock() {
  const {
    state: { text = '' },
    setState
  } = useStore<{ text: string }>()

  const random = useMemo(() => Math.floor(Math.random() * 100), [])
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setState({ text: e.target.value })

  return (
    <div className="flex-1 bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-2">Text Input Demo</h4>
      <p className="text-sm text-gray-600">
        Random this when re-render: <code className="text-pink-500 font-mono">{random}</code>.
      </p>
      <p className="mb-4">Typing here won’t re-render the other blocks.</p>
      <FormControl type="text" value={text} onChange={onChange} placeholder="Type something…" />
    </div>
  )
}

/**
 * Counter demo (module-scoped global state, standalone from cross-module counter)
 */
function CounterBlockLocal() {
  const {
    state: { localCounter = 0 },
    setState
  } = useStore<{ localCounter: number }>()

  // seed initial value once
  useEffect(() => {
    if (localCounter === undefined) setState({ localCounter: 0 })
  }, [])

  const random = useMemo(() => Math.floor(Math.random() * 100), [])
  const adjust = (delta: number) => setState({ localCounter: localCounter + delta })

  return (
    <div className="flex-1 bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-2">Counter Demo (Module State)</h4>
      <p className="text-sm text-gray-600">
        Random this when re-render: <code className="text-pink-500 font-mono">{random}</code>.
      </p>
      <p className="mb-4">This counter is module-scoped and won’t affect cross-module state.</p>
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => adjust(-1)}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition text-sm"
        >
          −
        </button>
        <span className="text-2xl font-mono">{localCounter}</span>
        <button
          onClick={() => adjust(1)}
          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition text-sm"
        >
          +
        </button>
      </div>
    </div>
  )
}

/**
 * RenderTrackerDemo
 *
 * Shows that this component re-renders when THIS MODULE’S counter changes.
 * Displays render count and a fresh random each render.
 */
function RenderTrackerDemo() {
  const {
    state: { localCounter }
  } = useStore<{ localCounter: number }>()
  const renders = useRef(0)
  renders.current++

  // new random every render
  const random = Math.floor(Math.random() * 100)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-2">Render Tracker Demo</h4>
      <p className="text-sm text-gray-600 mb-4">
        Re-renders when <code className="text-pink-500 font-mono">{moduleName}.localCounter</code>{' '}
        changes.
      </p>
      <p>
        Counter value: <span className="font-mono">{localCounter}</span>
      </p>
      <p>
        Render count: <span className="font-mono">{renders.current}</span>
      </p>
      <p>
        Random this when re-render: <code className="text-pink-500 font-mono">{random}</code>
      </p>
    </div>
  )
}

/**
 * LocalStateDemo
 *
 * Wraps title, all three demo blocks and the tracker in one card.
 * On large screens, the three blocks sit side-by-side.
 */
export function LocalStateDemo() {
  return (
    <div className=" space-y-6 mb-6">
      <h3 className="text-xl font-semibold mb-2">Module Local State Demo ({moduleName} Module)</h3>

      {/* three demo blocks */}
      <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
        <BooleanBlock />
        <TextBlock />
        <CounterBlockLocal />
      </div>

      {/* render-tracker */}
      <RenderTrackerDemo />
    </div>
  )
}
