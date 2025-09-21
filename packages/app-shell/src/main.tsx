// packages/app-shell/src/main.tsx
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader } from 'react-components-lib.eaa'
import AppRouter from './component/AppRouter'
import NotFound from './NotFound'
import type { RouteObject } from 'react-router-dom'
import { attachQueryClient } from '@app/common'
import './index.css'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false
    }
  }
})

attachQueryClient(qc)

function AppRouterWrapper() {
  const [combined, setCombined] = useState<any[] | null>(null)

  useEffect(() => {
    const modules = [
      /* __MODULE_setup_START */
      {
        path: 'setup',
        title: 'Setup',
        loader: () => import('setup/Routes' as any)
      },
      /* __MODULE_setup_END */
      /* __MODULE_ackworkdesk_START */
      {
        path: 'ackworkdesk',
        title: 'Ackworkdesk',
        loader: () => import('ackworkdesk/Routes' as any)
      },
      /* __MODULE_ackworkdesk_END */
      /* __MODULE_statement-browser_START */
      {
        path: 'statement-browser',
        title: 'Statement-browser',
        loader: () => import('statement-browser/Routes' as any)
      },
      /* __MODULE_statement-browser_END */
      /* __MODULE_txnenquiry_START */
      {
        path: 'txnenquiry',
        title: 'Txnenquiry',
        loader: () => import('txnenquiry/Routes' as any)
      },
      /* __MODULE_txnenquiry_END */
      /* __MODULE_txnworkdesk_START */
      {
        path: 'txnworkdesk',
        title: 'Txnworkdesk',
        loader: () => import('txnworkdesk/Routes' as any)
      },
      /* __MODULE_txnworkdesk_END */
      {
        // loader import string is built from:
        //  • toolkit  = the name of the remote federation module
        //  • Routes   = the key you exposed in that module’s federation config
        //
        // Combined: import('toolkit/Routes')
        path: 'toolkit',
        title: 'Toolkit',
        loader: () => import('toolkit/Routes' as any)
      },
      {
        // Similarly:
        //  • query    = remote module name
        //  • Routes   = exposed entry key
        //
        // Combined: import('query/Routes')
        path: 'query',
        title: 'Query',
        loader: () => import('query/Routes' as any)
      }
    ] as const

    Promise.allSettled(modules.map((m) => m.loader())).then((results) => {
      const routes: RouteObject[] = results.flatMap((res, i) => {
        if (res.status === 'fulfilled') {
          return [
            {
              title: modules[i].title,
              path: modules[i].path,
              children: res.value.default as RouteObject[]
            }
          ]
        } else {
          console.warn(`Module "${modules[i].path}" failed to load:`, res.reason)
          return [] // drop it
        }
      })

      setCombined(routes)
    })
  }, [])

  // null = still loading *any* attempt; [] = attempted but nothing loaded
  if (combined === null) {
    return <Loader appendTo="body" size="md" label="Getting ready..." />
  }

  const routesToUse =
    combined.length === 0
      ? [{ path: '*', title: 'No route found', element: <NotFound /> }]
      : combined

  return <AppRouter menuItems={routesToUse} routes={combined} />
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <QueryClientProvider client={qc}>
    <AppRouterWrapper />
  </QueryClientProvider>
)
