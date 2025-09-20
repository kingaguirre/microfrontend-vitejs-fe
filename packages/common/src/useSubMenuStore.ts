import { create } from 'zustand'

export interface SubMenuItem {
  id: string
  icon: string
  title: string
  path?: string
  /** Optional badge with either numeric or icon+color */
  badge?: {
    value?: number
    icon?: string
    color?: string
  }
  onClick: () => void
  /** Nested children */
  children?: SubMenuItem[]
}

interface SubMenuStore {
  subMenus: Record<string, SubMenuItem[]>
  setSubMenu: (
    module: string,
    newSubMenu: SubMenuItem[] | ((current: SubMenuItem[]) => SubMenuItem[])
  ) => void
  resetSubMenu: (module: string) => void
}

// 🔥 eager-load every module.config.json under packages/*/src
const configModules = import.meta.glob<{
  moduleName: string
  subMenu?: Omit<SubMenuItem, 'onClick'>[]
}>('../../*/src/module.config.json', { eager: true })

/**
 * Recursively attach onClick (and carry over badge) to each item and its children
 */
function attachOnClick(item: Omit<SubMenuItem, 'onClick'>): SubMenuItem {
  const base: SubMenuItem = {
    id: item.id,
    icon: item.icon,
    title: item.title,
    path: item.path,
    badge: item.badge,
    onClick: () => {
      if (item.path) window.location.assign(item.path)
    }
  }
  if (Array.isArray(item.children)) {
    base.children = item.children.map(attachOnClick)
  }
  return base
}

// build initial map: moduleName → SubMenuItem[]
const defaultSubMenus: Record<string, SubMenuItem[]> = {}
for (const loaded of Object.values(configModules)) {
  const data = (loaded as any).default ?? loaded
  const { moduleName, subMenu } = data
  if (!Array.isArray(subMenu)) continue
  defaultSubMenus[moduleName] = subMenu.map(attachOnClick)
}

// Key to store Zustand instance globally for persistence across modules
const ZUSTAND_KEY = '__subMenuStore__'

declare global {
  var __subMenuStore__: ReturnType<typeof create<SubMenuStore>>
}

// Initialize or reuse the store (TS will infer the correct store type)
const zustandStore =
  (globalThis as any)[ZUSTAND_KEY] ||
  create<SubMenuStore>((set) => ({
    subMenus: { ...defaultSubMenus },

    setSubMenu: (module, newSubMenu) =>
      set((state) => {
        const current = state.subMenus[module] || []
        const computed = typeof newSubMenu === 'function' ? newSubMenu(current) : newSubMenu
        return { subMenus: { ...state.subMenus, [module]: computed } }
      }),

    resetSubMenu: (module) =>
      set((state) => ({
        subMenus: defaultSubMenus[module]
          ? { ...state.subMenus, [module]: defaultSubMenus[module] }
          : Object.fromEntries(Object.entries(state.subMenus).filter(([k]) => k !== module))
      }))
  }))

// Merge any newly loaded defaults into an existing store (without overwriting updates)
Object.entries(defaultSubMenus).forEach(([moduleName, menu]) => {
  if (!zustandStore.getState().subMenus[moduleName]) {
    zustandStore.setState((state: any) => ({
      subMenus: { ...state.subMenus, [moduleName]: menu }
    }))
  }
})

// Persist store instance on globalThis
;(globalThis as any)[ZUSTAND_KEY] = zustandStore

export const useSubMenuStore = zustandStore

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    ;(globalThis as any)[ZUSTAND_KEY] = zustandStore
  })
}
