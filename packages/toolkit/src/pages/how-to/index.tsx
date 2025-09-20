// src/pages/Home.tsx
import { Link, useLocation } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import NewModuleGuide from '@components/demo/NewModuleGuide'
import ReadmeGuide from '@components/demo/ReadmeGuide'
import PageStoreDemo from '@components/demo/PageStoreDemo'
import SubMenuStoreOverride from '@components/demo/SubMenuStoreOverride'
import AlertStoreDemo from '@components/demo/AlertStoreDemo'
import UseConfigDemo from '@components/demo/UseConfigDemo'

export default function Home() {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const active = params.get('scroll')

  const tabs = [
    { id: 'how-to-create-module', label: '🛠️ Create Module' },
    { id: 'how-to-run-local', label: '🚀 Run Locally' },
    { id: 'how-to-change-page-data', label: '🛠️ Change Page-(Title & Name)' },
    { id: 'how-to-add-sub-menu', label: '🛠️ Add Sub-menu dynamically' },
    { id: 'how-to-use-alert-store', label: '🛠️ Use Alert Store' },
    { id: 'how-to-use-config', label: '🛠️ Use config Store' }
  ]

  return (
    <Layout>
      <div className="max-w-none">
        {/* Sticky sub-menu as styled tabs */}
        <nav className="sticky top-0 bg-white flex border-b border-gray-200 mb-6 z-20 shadow">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={`?scroll=${tab.id}`}
              className={`px-4 py-2 -mb-px text-sm font-medium transition whitespace-nowrap
                ${
                  active === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'border-b-2 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Guides with tighter spacing */}
        <div className="space-y-8">
          <NewModuleGuide />
          <ReadmeGuide />
          <PageStoreDemo />
          <SubMenuStoreOverride />
          <AlertStoreDemo />
          <UseConfigDemo />
        </div>
      </div>
    </Layout>
  )
}
