// packages/query/src/pages/tanstack-react-query-demo/auth/index.tsx
import React, { useState } from 'react'
import { useQueryApi } from '@app/common'
import ModuleLink from '@components/ModuleLink'

/** Response from HTTPBin’s /bearer endpoint */
interface BearerResponse {
  authenticated: boolean
  token: string
}

export default function AuthDemoPage() {
  // — holds the JWT to send
  const [token, setToken] = useState<string>('')
  // — toggles the protected fetch
  const [triggerFetch, setTriggerFetch] = useState(false)

  // 🔥 Protected fetch using useQueryApi
  const {
    data, // the parsed JSON response ({ authenticated, token })
    isLoading, // true while the request is in flight
    error // populated if the request fails (e.g. 401)
  } = useQueryApi<BearerResponse>({
    queryKey: ['protected-demo', triggerFetch],
    // ↑ unique cache key: re‑runs when `triggerFetch` toggles
    endpoint: 'https://httpbin.org/bearer',
    // ↑ the URL to hit; can be a path if you have a baseURL configured
    enabled: triggerFetch,
    // ↑ only fire this query after user clicks the button
    staleTime: 0,
    // ↑ treat data as stale immediately (always fetch fresh)
    getAuthToken: () => token || null
    // ↑ dynamic token lookup: returns `null` if empty, or your JWT
  })

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* 🔒 Demo Banner */}
        <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 px-6 py-4">
          <span className="text-xl">🔒</span>
          <div className="text-sm text-gray-700">
            This demo shows how to use <code>useQueryApi</code> to pass your JWT as{' '}
            <code>Authorization: Bearer &lt;token&gt;</code> to a protected endpoint.
          </div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Auth Demo</h1>
          <p className="text-gray-600 text-sm mt-1">
            Paste a JWT below, then click “Fetch Protected Resource” to call{' '}
            <code className="bg-gray-100 px-1 rounded mx-1">https://httpbin.org/bearer</code>.
          </p>
        </div>

        {/* Token input + button */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste JWT here"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            onClick={() => setTriggerFetch((t) => !t)}
            disabled={!token || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />
            ) : (
              'Fetch Protected Resource'
            )}
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              <p className="font-medium">Not Authenticated</p>
              <p className="text-sm mt-1">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Success payload */}
        {data && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
              <p className="font-medium">✅ Authenticated!</p>
              <pre className="text-sm mt-2">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-4 text-center">
        <ModuleLink to="/" className="text-gray-600 underline hover:text-gray-800">
          ← Back to Query Home
        </ModuleLink>
      </div>
    </div>
  )
}
