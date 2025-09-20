import { useState } from 'react'
import { Button } from 'react-components-lib.eaa'
import ModuleLink from '@components/ModuleLink'

export default function CrashTestPage() {
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) {
    throw new Error('🛑 Intentional Test Crash: Our error boundary handled it gracefully!')
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded p-6 mt-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Crash Test Page 🚧</h1>
      <p className="text-gray-600 mb-6">
        This page helps you verify the effectiveness of <strong>Error Boundary</strong>. Click the
        button below to intentionally trigger a crash and observe how your application gracefully
        handles the error.
      </p>

      <div className="flex items-center space-x-4">
        <Button color="danger" className="font-semibold" onClick={() => setShouldCrash(true)}>
          🔥 Trigger Crash
        </Button>

        <ModuleLink to="/" className="text-gray-700 hover:text-gray-900 font-medium">
          🏠 Return Home
        </ModuleLink>
      </div>
    </div>
  )
}
