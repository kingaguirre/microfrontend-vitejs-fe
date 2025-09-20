import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'

export default function RouteDemo() {
  const steps = [
    { to: '/route-demo/step1', label: 'Static Route Example' },
    { to: '/route-demo/123', label: 'Dynamic ID Example' }
  ]

  return (
    <Layout>
      <Card title="Routing Demo">
        <p className="text-gray-700 mb-4">
          Below are cards demonstrating navigation within this module and across modules. Thanks to{' '}
          <code>vite-plugin-pages</code>, any file you place under <code>/src/pages/</code> is
          picked up as a route automatically—no manual route config required.
        </p>

        {/* File tree snippet */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Arrange your files like this to get the routes:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {`module-xyz/                    // your module root
└── src/
    └── pages/                 // all routes are auto-generated from this folder
        ├── route-demo/        // Route-Demo route (/route-demo)
        │   ├── index.tsx      // this RouteDemo screen
        │   ├── step1/
        │   │   └── index.tsx  // renders step 1 (Static Route Example /route-demo/step1)
        │   └── [id]/
        │       └── index.tsx  // dynamic route for IDs (e.g. /route-demo/123)
        └── query/
            └── index.tsx      // Query route (/query)
`}
          </pre>
        </div>

        {/* Info box: Learn more about auto-routing */}
        <div className="mt-4 mb-4 container mx-auto px-4 py-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <div className="text-blue-800 text-sm space-y-2">
            <p>
              🚀 Want to dive deeper? Check out{' '}
              <a
                href="https://www.npmjs.com/package/vite-plugin-pages"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                vite-plugin-pages on npm
              </a>
              , the plugin that enables automatic route generation.
            </p>
          </div>
        </div>

        {/* three columns so our extra “Query” card fits on one row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {steps.map((step, idx) => (
            <ModuleLink
              key={step.to}
              to={step.to}
              className="block p-4 bg-white border border-gray-200 rounded-lg shadow hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 mr-3 text-white bg-blue-500 rounded-full font-bold">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">{step.label}</p>
                  <code className="font-mono">{step.to}</code>
                </div>
              </div>
            </ModuleLink>
          ))}

          {/* “native” Link styled exactly like the ModuleLink cards */}
          <Link
            to="/query"
            className="block p-4 bg-white border border-gray-200 rounded-lg shadow hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-3 text-white bg-green-500 rounded-full font-bold">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Go to Query Module Home</p>
                <code className="font-mono">/query</code>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </Layout>
  )
}
