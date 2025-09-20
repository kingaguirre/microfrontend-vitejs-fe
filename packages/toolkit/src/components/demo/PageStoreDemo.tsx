import React from 'react'
import { useLocation } from 'react-router-dom'
import { usePageStore } from '@app/common'

export default function PageStoreOverride() {
  const { pathname } = useLocation()
  const modulePath = pathname.replace(/^\/|\/$/g, '').split('/')[0] || ''

  // store hooks
  const setName = usePageStore((s) => s.setPageName)
  const setTitle = usePageStore((s) => s.setPageTitle)
  const resetName = usePageStore((s) => s.resetPageName)
  const resetTitle = usePageStore((s) => s.resetPageTitle)

  // read current (or default) values
  const pageName = usePageStore((s) => s.pageNames[modulePath] ?? '')
  const pageTitle = usePageStore((s) => s.pageTitles[modulePath] ?? '')

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-change-page-data"
      data-scroll-offset="70"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="text-blue-500 mr-2">🛠️</span>
        How to Update Page Title & Page Name
      </h2>

      {/* Tip Info Box */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <h3 className="flex items-center text-yellow-800 font-semibold mb-2">
          <span className="mr-2">💡</span>Tip
        </h3>
        <p className="text-sm text-yellow-800">
          Edits apply when you change the inputs below. Toggle "Don't reset on navigation" to
          preserve or reset your changes on route change.
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">
        In any <em>remote module</em> page component, use the store setters to update{' '}
        <strong>pageTitle</strong> and <strong>pageName</strong> based on user action.
      </p>

      {/* Demo code block */}
      <pre className="w-full bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono mb-6">
        {`import React from 'react'
import { usePageStore } from '@app/common'

export default function TranslationDemoPage() {
  const setName  = usePageStore((s) => s.setPageName)
  const setTitle = usePageStore((s) => s.setPageTitle)

  const update = () => {
    setName('Translation Demo')
    setTitle('Translation Demo')
  }

  return (
    <div>
      <h1>Translation Demo</h1>
      <button onClick={update}>Set Page Name & Title</button>
    </div>
  )
}`}
      </pre>

      {/* Live Edit Inputs */}
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="title-input" className="block text-gray-800 font-medium mb-1">
            Page Title
          </label>
          <input
            id="title-input"
            type="text"
            value={pageTitle}
            onChange={(e) => setTitle(modulePath, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="name-input" className="block text-gray-800 font-medium mb-1">
            Page Name
          </label>
          <input
            id="name-input"
            type="text"
            value={pageName}
            onChange={(e) => setName(modulePath, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Reset to Default */}
      <button
        onClick={() => {
          resetName(modulePath)
          resetTitle(modulePath)
        }}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Reset to Default
      </button>
    </div>
  )
}
