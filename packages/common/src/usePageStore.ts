import { create } from 'zustand'

/** shape of your module.config.json */
interface ModulePageConfig {
  moduleName: string
  pageName?: string
  pageTitle?: string
  // subMenu etc omitted
}

// 1️⃣ load all module.config.json under packages/*/src
const pageConfigs = import.meta.glob<ModulePageConfig>('../../*/src/module.config.json', {
  eager: true
})

const defaultNames: Record<string, string> = {}
const defaultTitles: Record<string, string> = {}

for (const mod of Object.values(pageConfigs)) {
  // Vite puts your JSON under `.default` when you use `eager`
  const cfg = (mod as any).default ?? mod
  const { moduleName, pageName, pageTitle } = cfg
  if (pageName) defaultNames[moduleName] = pageName
  if (pageTitle) defaultTitles[moduleName] = pageTitle
}

interface PageStore {
  pageNames: Record<string, string>
  pageTitles: Record<string, string>

  setPageName: (module: string, name: string) => void
  setPageTitle: (module: string, title: string) => void
  resetPageName: (module: string) => void
  resetPageTitle: (module: string) => void
}

const ZUSTAND_PAGE_KEY = '__pageStore__'

declare global {
  var __pageStore__: ReturnType<typeof create<PageStore>>
}

/** 2️⃣ create or reuse the store */
const usePageStore =
  globalThis[ZUSTAND_PAGE_KEY] ||
  create<PageStore>((set) => ({
    pageNames: { ...defaultNames },
    pageTitles: { ...defaultTitles },

    setPageName: (module, name) => set((s) => ({ pageNames: { ...s.pageNames, [module]: name } })),
    setPageTitle: (module, title) =>
      set((s) => ({ pageTitles: { ...s.pageTitles, [module]: title } })),

    resetPageName: (module) =>
      set((s) => ({
        pageNames: { ...s.pageNames, [module]: defaultNames[module] ?? '' }
      })),
    resetPageTitle: (module) =>
      set((s) => ({
        pageTitles: { ...s.pageTitles, [module]: defaultTitles[module] ?? '' }
      }))
  }))

// 3️⃣ persist across hot reloads
;(globalThis as any)[ZUSTAND_PAGE_KEY] = usePageStore
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    ;(globalThis as any)[ZUSTAND_PAGE_KEY] = usePageStore
  })
}

export { usePageStore }
