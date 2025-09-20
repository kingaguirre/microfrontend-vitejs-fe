import MenuHub from '../components/MenuHub'
import { useModuleConfig } from '@app/common'
import moduleConfig from '../module.config.json'

export default function Index() {
  const config = useModuleConfig(moduleConfig.moduleName);
  const { config: { setupMenu } } = config as any
  return <MenuHub data={setupMenu} />
}