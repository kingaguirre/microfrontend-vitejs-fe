// packages/query/src/ModuleLink.tsx
import { FC } from 'react'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'
import moduleConfig from '../module.config.json'

interface ModuleLinkProps extends Omit<RouterLinkProps, 'to'> {
  /**
   * Pass either a string or a location-like object.
   * If it's a string, we'll auto-prefix `/moduleName`.
   */
  to: string
  [key: string]: any
}

const ModuleLink: FC<ModuleLinkProps> = ({ to, ...rest }) => {
  // ensure leading slash
  const raw = to.startsWith('/') ? to : `/${to}`
  // prefix with module name
  const prefixed = `/${moduleConfig.moduleName}${raw}`
  return <RouterLink to={prefixed} {...rest} />
}

export default ModuleLink
