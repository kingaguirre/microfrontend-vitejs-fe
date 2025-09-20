// packages/query/src/pages/tanstack-react-query-demo/index.tsx
import { useState, useMemo } from 'react'
import { useQueryApi } from '@app/common'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'
import { Loader } from 'react-components-lib.eaa'

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
}

export default function TanStackReactQueryDemo() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // 🔥 Using shared useQueryApi instead of local fetch
  const {
    data, // the fetched users array (User[])
    isLoading, // true while the HTTP request is in progress
    error // Error object if the request fails (e.g. network error or 4xx/5xx)
  } = useQueryApi<User[]>({
    queryKey: ['users', search], // unique cache key; refetches when `search` changes
    endpoint: 'https://jsonplaceholder.typicode.com/users', // the URL to fetch the users list
    // axiosConfig?: { timeout: 10000 }               // optional: auto-fail if no response in 10s
    staleTime: 5 * 60_000 // data considered fresh for 5 minutes before refetch
  })

  // client‑side filter by name/username/email
  const filtered = useMemo(
    () =>
      data?.filter((u) =>
        [u.name, u.username, u.email].some((field) =>
          field.toLowerCase().includes(search.toLowerCase())
        )
      ) ?? [],
    [data, search]
  )

  const pageCount = Math.ceil(filtered.length / pageSize)
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  )

  return (
    <div className="p-4">
      <Card title="React Query Demo">
        {/* Info banner */}
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex items-start">
          <span className="text-xl mr-3">ℹ️</span>
          <div className="text-sm text-gray-700">
            <p>
              This demo shows how to use <code>useQueryApi</code> to:
            </p>
            <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
              <li>Fetch data from an API endpoint</li>
              <li>Filter results by name, username, or email</li>
              <li>Paginate through the list of users</li>
              <li>Automatically handle loading & error states</li>
            </ul>
            <p className="mt-2">
              Want to see how to fetch protected endpoints with a token?{' '}
              <ModuleLink to="/tanstack-react-query-demo/auth" className="text-blue-600 underline">
                Go to Auth Demo →
              </ModuleLink>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Use the input below to search users in real time.
        </p>

        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 border border-gray-300 px-2 py-1 rounded"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader size="md" label="Loading…" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded">
            <p className="font-medium mb-1">Error loading users.</p>
            <p>Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    {['ID', 'Name', 'Username', 'Email', 'Phone', 'Website'].map((h) => (
                      <th key={h} className="px-4 py-2 border text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{user.id}</td>
                      <td className="px-4 py-2 border">
                        <ModuleLink
                          to={`/tanstack-react-query-demo/${user.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {user.name}
                        </ModuleLink>
                      </td>
                      <td className="px-4 py-2 border">{user.username}</td>
                      <td className="px-4 py-2 border">{user.email}</td>
                      <td className="px-4 py-2 border">{user.phone}</td>
                      <td className="px-4 py-2 border">{user.website}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
                disabled={page === pageCount}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </Card>

      <div className="mt-4 text-right">
        <ModuleLink to="/" className="text-gray-600 underline hover:text-gray-800">
          ← Back to Query Home
        </ModuleLink>
      </div>
    </div>
  )
}
