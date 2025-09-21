import { FC } from 'react'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'
import moduleConfig from '../module.config.json'

interface ModuleLinkProps extends Omit<RouterLinkProps, 'to'> {
  to: string
  [key: string]: any
}

const ModuleLink: FC<ModuleLinkProps> = ({ to, ...rest }) => {
  const raw = to.startsWith('/') ? to : `/${to}`
  const prefixed = `/${moduleConfig.moduleName}${raw}`
  return <RouterLink to={prefixed} {...rest} />
}

export default ModuleLink
