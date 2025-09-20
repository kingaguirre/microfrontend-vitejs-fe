// packages/app-shell/src/AppRouter.tsx
import React, { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './AppShell'
import Login from '../Login'
import NotFound from '../NotFound'
import type { RouteObject } from 'react-router-dom'
import { Loader } from 'react-components-lib.eaa'

import { useLocation } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import './appRouter.css'

interface AppRouterProps {
  moduleName?: string
  menuItems?: {
    title: string
    path: string // optional, if not provided, it will use moduleName
  }[]
  routes?: RouteObject[]
}

export const renderRoutes = (arr: RouteObject[]): React.ReactNode =>
  arr.map((route) => {
    const rawPath = route.path as string | undefined
    const normalizedPath = rawPath?.startsWith('/') ? rawPath.slice(1) : rawPath
    const key = normalizedPath ?? (route.index ? 'index' : JSON.stringify(route))

    if (route.index) {
      return <Route key={key} index element={route.element} />
    }

    return (
      <Route key={key} path={normalizedPath} element={route.element}>
        {route.children ? renderRoutes(route.children) : null}
      </Route>
    )
  })

export default function AppRouter({ moduleName, menuItems = [], routes }: AppRouterProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  const handleLogin = (t: string) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  // Combine local and remote routes for the protected layout
  const combinedChildren: RouteObject[] = [
    // use remoteRoutes if provided, otherwise fallback to local routes
    ...(routes ?? []),
    // catch-all inside protected section
    { path: '*', element: <NotFound /> }
  ]

  const defaultRoute = moduleName ?? menuItems[0]?.path ?? ''

  // Define the full RouteObject tree
  const appRoutes: RouteObject[] = [
    // PUBLIC
    {
      index: true,
      element: !token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Navigate to={`/${defaultRoute}`} replace />
      )
    },
    {
      path: 'login',
      element: !token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Navigate to={`/${defaultRoute}`} replace />
      )
    },
    // PROTECTED + LAYOUT
    {
      path: moduleName ?? '',
      element: token ? (
        <AppShell
          menuItems={
            menuItems.length > 0 ? menuItems : [{ title: moduleName ?? '', path: moduleName ?? '' }]
          }
          onLogout={handleLogout}
        />
      ) : (
        <Navigate to="/login" replace />
      ),
      children: combinedChildren
    },
    // GLOBAL 404
    {
      path: '*',
      element: <NotFound />
    }
  ]

  return (
    <BrowserRouter>
      <Suspense
        fallback={<Loader size="md" appendTo=".app-shell-main-content" label="Loading..." />}
      >
        <FadeTransition>
          {(loc) => <Routes location={loc}>{renderRoutes(appRoutes)}</Routes>}
        </FadeTransition>
      </Suspense>
    </BrowserRouter>
  )
}

/**
 * Only when going from “/” or “/login” into any other path,
 * will this wrapper fade-out the old tree then fade-in the new one.
 */
function FadeTransition({
  children
}: {
  children: (loc: ReturnType<typeof useLocation>) => React.ReactNode
}) {
  const location = useLocation()
  const prevPath = useRef(location.pathname)
  const [phase, setPhase] = useState<'fade-in' | 'fade-out'>('fade-in')
  const [displayLoc, setDisplayLoc] = useState(location)

  useEffect(() => {
    const fromLogin = prevPath.current === '/' || prevPath.current === '/login'
    const toAppShell = location.pathname !== '/' && location.pathname !== '/login'

    if (fromLogin && toAppShell) {
      // start fade-out
      setPhase('fade-out')
      const t = window.setTimeout(() => {
        // swap to the new location and fade-in
        prevPath.current = location.pathname
        setDisplayLoc(location)
        setPhase('fade-in')
      }, 100) // match CSS transition-duration
      return () => clearTimeout(t)
    } else {
      // any other navigation: no fade; just update
      prevPath.current = location.pathname
      setDisplayLoc(location)
      setPhase('fade-in')
    }
  }, [location])

  return <div className={`fade-transition ${phase}`}>{children(displayLoc)}</div>
}
