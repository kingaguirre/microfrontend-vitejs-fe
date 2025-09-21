// packages/toolkit/src/main.tsx
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from '@app/app-shell/component/AppRouter'
import moduleConfig from './module.config.json'
import { attachQueryClient } from '@app/common'
import '@app/app-shell/index.css'
import './index.css'
import routes from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true
    }
  }
})

attachQueryClient(queryClient)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRouter moduleName={moduleConfig.moduleName} routes={routes} />
  </QueryClientProvider>
)
