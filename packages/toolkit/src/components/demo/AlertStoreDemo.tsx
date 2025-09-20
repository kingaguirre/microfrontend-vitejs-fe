// src/components/AlertStoreDemo.tsx
import React, { useState } from 'react'
import { useAlertStore } from '@app/common'

export default function AlertStoreDemo() {
  const triggerAlert = useAlertStore((state) => state.setAlert)
  const clearAlert = useAlertStore((state) => state.clearAlert)
  const [jsonInput, setJsonInput] = useState<string>(
    `{
  "title": "Sample Alert",
  "content": "This is a demo alert.",
  "color": "info",
  "icon": "info",
  "placement": "top-right",
  "closeDelay": 5000
}`
  )
  const [error, setError] = useState<string | null>(null)

  const buildConfig = (): any | null => {
    try {
      const parsed = JSON.parse(jsonInput)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Alert config must be an object')
      }
      return parsed
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      return null
    }
  }

  const handleTrigger = () => {
    const cfg = buildConfig()
    if (cfg) {
      triggerAlert(cfg)
      setError(null)
    }
  }

  const handleClear = () => {
    clearAlert()
    setError(null)
  }

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-use-alert-store"
      data-scroll-offset="70"
    >
      <h2 className="text-2xl font-bold mb-4">🚨 Alert Store Demo</h2>

      {/* Tip Info Box */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-blue-800 font-semibold mb-1">ℹ️ Tip</h3>
        <p className="text-sm text-blue-800">
          Use <code>useAlertStore</code> to dispatch global toasts. Configure your alert as JSON and
          hit "Trigger Alert".
        </p>
      </div>

      {/* JSON Editor */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Alert Config (JSON)</label>
        <textarea
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full border rounded px-3 py-2 font-mono text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-2 mb-4">
        <button onClick={handleTrigger} className="bg-blue-500 text-white px-4 py-2 rounded">
          Trigger Alert
        </button>
        <button onClick={handleClear} className="bg-red-500 text-white px-4 py-2 rounded">
          Clear Alert
        </button>
      </div>

      {/* Error */}
      {error && <div className="text-red-600 mb-4">Error: {error}</div>}

      {/* Code Example */}
      <div className="bg-gray-50 p-4 rounded border-2 border-blue-300">
        <h3 className="font-semibold mb-2">Code Example</h3>
        <pre className="bg-white p-2 rounded text-sm overflow-auto font-mono">{`// Trigger a success alert
useAlertStore.setAlert({
  title: 'Operation Successful',
  content: 'Your changes have been saved.',
  color: 'success',
  icon: 'check_circle',
  placement: 'bottom-right',
  closeDelay: 3000,
})

// Clear current alert
useAlertStore.clearAlert()
`}</pre>
      </div>
    </div>
  )
}
