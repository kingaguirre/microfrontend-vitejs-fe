// packages/query/src/pages/index.tsx
import ModuleLink from '@components/ModuleLink'
import { Link } from 'react-router-dom'
import Card from '@components/demo/Card'
import { StateViewer } from '@components/demo/StateViewer'

export default function QueryHome() {
  return (
    <div className="min-h-screen bg-gray-100 pb-4">
      <div className="bg-white shadow mb-2 h-14 flex items-center px-4">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Query Module</span>
        </nav>
      </div>

      <div className="p-4 space-y-6 container mx-auto">
        <Card title="Query Module">
          <ul className="space-y-3">
            <li className="flex flex-col items-start">
              <div className="flex items-start w-full max-w-[75%]">
                <span className="text-purple-500 mr-2">🚀</span>
                <span>
                  Dive into our built-in GraphQL client from <code>@app/common/graphql-client</code>{' '}
                  — see queries, mutations, and error handling in action.{' '}
                  <Link to="/query?scroll=graphql-demo" className="text-yellow-600 underline ml-1">
                    Jump to GraphQL Demo →
                  </Link>
                </span>
              </div>
              {/* Info box: graphql-request */}
              <div className="mt-2 w-full bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-yellow-800 text-sm mb-4">
                🔗 Powered by{' '}
                <a
                  href="https://github.com/prisma-labs/graphql-request"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  graphql-request
                </a>
              </div>
            </li>

            <li className="flex flex-col items-start">
              <div className="flex items-start w-full max-w-[75%]">
                <span className="text-green-500 mr-2">🔄</span>
                <span>
                  Explore REST and other data flows with our shared <code>useQueryApi</code> hook —
                  check out the demo for endpoint setup, caching strategies, and real‑world usage.{' '}
                  <Link
                    to="/query?scroll=react-query-demo"
                    className="text-blue-600 underline ml-1"
                  >
                    Jump to React Query Demo →
                  </Link>
                </span>
              </div>
              <div className="flex items-start w-full max-w-[75%] mt-2">
                <span className="text-green-500 mr-2">🔒</span>
                <span>
                  Discover how to fetch protected endpoints with authentication using our shared{' '}
                  <code>useQueryApi</code> hook — check out the demo for token handling, header
                  injection, and real‑world error handling.{' '}
                  <Link to="/query?scroll=auth-demo" className="text-blue-600 underline ml-1">
                    Jump to Auth Demo →
                  </Link>
                </span>
              </div>
              <div className="mt-2 w-full bg-blue-50 border-l-4 border-blue-400 p-2 rounded text-blue-800 text-sm">
                🔗 Powered by{' '}
                <a
                  href="https://tanstack.com/query/v4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  TanStack Query
                </a>{' '}
                &{' '}
                <a
                  href="https://axios-http.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Axios
                </a>
              </div>
            </li>
          </ul>
        </Card>

        <StateViewer />

        {/* GraphQL Demo Info Box */}
        <div
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded"
          data-scroll-to-view="graphql-demo"
        >
          <h3 className="text-lg font-semibold mb-2">💡 Try the GraphQL CRUD Demo</h3>
          <p className="text-sm">
            Want to see CRUD in action with <code>createGraphQLClient</code>?{' '}
            <ModuleLink to="/graphql-demo" className="text-yellow-600 underline">
              Go to Email Manager Demo →
            </ModuleLink>
          </p>
        </div>

        {/* Demos using useQueryApi */}
        <div
          className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded"
          data-scroll-to-view="react-query-demo"
        >
          <h3 className="text-lg font-semibold mb-2">📊 Try the React Query Demo</h3>
          <p className="text-sm">
            Explore pagination, global search, and real‑world data fetching patterns powered by{' '}
            <code>useQueryApi</code> —{' '}
            <ModuleLink to="/tanstack-react-query-demo" className="text-blue-600 underline">
              Go to React Query Demo →
            </ModuleLink>
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">🔒 See the Auth Demo</h3>
          <p className="text-sm">
            Learn how to fetch protected endpoints and attach your JWT via <code>useQueryApi</code>{' '}
            —{' '}
            <ModuleLink to="/tanstack-react-query-demo/auth" className="text-green-600 underline">
              Go to Auth Demo →
            </ModuleLink>
          </p>
        </div>
      </div>
    </div>
  )
}
