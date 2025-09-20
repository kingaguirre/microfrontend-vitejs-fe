// packages/toolkit/src/main.tsx
import ReactDOM from 'react-dom/client'
import AppRouter from '@app/app-shell/component/AppRouter'
import moduleConfig from './module.config.json'
import '@app/app-shell/index.css'
import './index.css'
import routes from './routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRouter moduleName={moduleConfig.moduleName} routes={routes} />
)
