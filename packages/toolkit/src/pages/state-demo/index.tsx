import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import { GlobalStateDemo } from '@components/demo/GlobalStateDemo'
import { LocalStateDemo } from '@components/demo/LocalStateDemo'

export default function StateManagement() {
  return (
    <Layout>
      <Card title="State Management Demo">
        {/* More detailed intro */}
        <p className="mb-2 text-gray-700">
          Manage state at two levels:
          <br />• <strong>Module-scoped</strong>: isolate state within your module using{' '}
          <code>useStore</code>.<br />• <strong>Global</strong>: share across modules with{' '}
          <code>useGlobalStore</code>.
        </p>
        <p className="mb-4 text-gray-600">
          Expand the example below to see a complete component wiring up buttons, state reads, and
          updates. The code is collapsible so it won't bloat the page.
        </p>

        {/* Collapsible full example */}
        <details className="mb-4 group">
          <summary className="cursor-pointer flex items-center space-x-2 bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded transition hover:bg-gray-200">
            <span className="transform transition-transform group-open:rotate-90">▶</span>
            <span>Show full CounterComponent example</span>
          </summary>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm mt-2">
            {`import React from 'react'
import { useStore } from '@components/../useStore'
import { useGlobalStore } from '@app/common'

// Demonstrates both local and global updates
export function CounterComponent() {
  // Module-local state
  const { state, setState, reset } = useStore<{ count: number }>()
  const local = state.count ?? 0

  // Global state for another module
  const otherKey = 'analytics' // module name: use this key to access that module’s state slice
  const globalCount = useGlobalStore(
    s => (s.store[otherKey] as { count: number } | undefined)?.count ?? 0
  )

  function incLocal() {
    setState({ count: local + 1 })
  }

  function incGlobal() {
    const gs = useGlobalStore.getState()
    const current = (gs.store[otherKey] as { count: number } | undefined)?.count ?? 0
    gs.setStateFor(otherKey, { count: current + 1 })
  }

  return (
    <div className="space-y-3">
      <button onClick={incLocal} className="px-3 py-1 bg-green-500 text-white rounded">
        Local + ({local})
      </button>
      <button onClick={reset} className="px-3 py-1 bg-red-500 text-white rounded">
        Reset Local
      </button>
      <button onClick={incGlobal} className="px-3 py-1 bg-blue-500 text-white rounded">
        Global + ({globalCount})
      </button>
    </div>
  )
}`}
          </pre>
        </details>

        {/* Info box: Zustand */}
        <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-blue-800 text-sm">
            🔷 We’re using <code>zustand</code> under the hood. Learn more at{' '}
            <a
              href="https://github.com/pmndrs/zustand"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              github.com/pmndrs/zustand
            </a>
          </p>
        </div>
      </Card>

      {/* Live demos */}
      <GlobalStateDemo />
      <LocalStateDemo />
    </Layout>
  )
}
