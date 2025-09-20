// packages/app-shell/src/Layout.tsx
import React from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import moduleConfig from '@components/../module.config.json'
import ModuleLink from '@components/ModuleLink'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/how-to', label: 'How-To Guides' },
  { to: '/state-demo', label: 'State Demo' },
  { to: '/route-demo', label: 'Route Demo' },
  { to: '/scroll-demo', label: 'Scroll Demo' },
  { to: '/translation-demo', label: 'Translation Demo' },
  { to: '/components', label: 'Components' },
  { to: '/crash-test', label: 'Crash Test' },
  { to: '/no-route', label: '404 Page' }
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  const isActive = (to: string) => {
    // normalize
    const raw = to.startsWith('/') ? to : `/${to}`
    const full = `/${moduleConfig.moduleName}${raw}`

    if (raw === '/') {
      // exact match for home
      return pathname === full
    }
    // prefix match for deeper routes
    return matchPath({ path: full, end: false }, pathname) !== null
  }

  return (
    <div className="min-h-screen bg-gray-100 [&_code]:text-pink-500">
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-4 py-4">
            {navItems.map((item) => {
              const active = isActive(item.to)
              return (
                <li
                  key={item.to}
                  className={
                    active ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-500'
                  }
                >
                  <ModuleLink to={item.to}>{item.label}</ModuleLink>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-6">{children}</main>
    </div>
  )
}
