// packages/query/src/StateViewer.tsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import moduleConfig from '@components/../module.config.json'
import { useGlobalStore } from '@app/common'

export function StateViewer() {
  // stable empty objects to prevent selector from returning a new {} each render
  const defaultToolkit = useMemo(() => ({}) as Record<string, any>, [])
  const defaultQuery = useMemo(() => ({}) as Record<string, any>, [])

  // now selectors will return the same fallback reference until real data appears
  const toolkitState = useGlobalStore(
    (s) => (s.store['toolkit'] as Record<string, any>) ?? defaultToolkit
  )
  const queryState = useGlobalStore(
    (s) => (s.store[moduleConfig.moduleName] as Record<string, any>) ?? defaultQuery
  )

  return (
    <div data-scroll-to-view="state-demo">
      <h3 className="text-xl font-bold mb-4">
        Cross-Module Global State Demo (State Viewer) ({moduleConfig.moduleName} Module)
      </h3>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
        <h3 className="text-lg font-semibold mb-2">🔧 Update State from Toolkit Module</h3>
        <p className="text-sm">
          Want to update or experiment with shared state from the <strong>Toolkit module</strong>?{' '}
          <Link to="/toolkit/state-demo?scroll=state-demo" className="text-blue-600 underline">
            Go to Toolkit State Demo →
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toolkit state block */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Toolkit State</h3>
          <p className="text-sm text-gray-600 mb-4">
            All values in the <code>toolkit</code> slice of the global store.
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(toolkitState, null, 2)}
          </pre>
        </div>

        {/* Query state block */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Query State</h3>
          <p className="text-sm text-gray-600 mb-4">
            All values in the <code>{moduleConfig.moduleName}</code> slice of the global store.
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(queryState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
