// packages/toolkit/src/main.tsx
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from '@app/app-shell/component/AppRouter'
import moduleConfig from './module.config.json'
import routes from './routes'
import '@app/app-shell/index.css'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRouter moduleName={moduleConfig.moduleName} routes={routes} />
  </QueryClientProvider>
)
