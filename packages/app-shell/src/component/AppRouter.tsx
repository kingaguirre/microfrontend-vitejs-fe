// packages/app-shell/src/AppRouter.tsx
import React, { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './AppShell'
import Login from '../Login'
import NotFound from '../NotFound'
import Home from '../Home'
import type { RouteObject } from 'react-router-dom'
import { Loader } from 'react-components-lib.eaa'

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

  const shellMenuItems =
    menuItems.length > 0 ? menuItems : [{ title: moduleName ?? '', path: moduleName ?? '' }]

  // Define the full RouteObject tree
  const appRoutes: RouteObject[] = [
    // PUBLIC
    {
      // index: true,
      path: '/',
      element: !token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <AppShell menuItems={shellMenuItems} onLogout={handleLogout} />
      ),
      children: [
        {
          path: '/',
          element: <Home />
        }
      ]
    },
    {
      path: 'login',
      element: !token ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />
    },
    // PROTECTED + LAYOUT
    {
      path: moduleName ?? '',
      element: token ? (
        <AppShell menuItems={shellMenuItems} onLogout={handleLogout} />
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
        <Routes>{renderRoutes(appRoutes)}</Routes>
      </Suspense>
    </BrowserRouter>
  )
}
