// packages/common/src/useConfig.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand'
import axios from 'axios'
import { useMemo } from 'react'

export type AnyObj = Record<string, any>
const CONFIG_STORE_KEY = '__moduleConfigStore__' as const

function isPlainObject(x: unknown): x is Record<string, any> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}

/** Deep merge: objects merge; arrays/scalars from source replace target. */
export function deepMergeConfig<T extends AnyObj, U extends AnyObj>(
  a: T | undefined,
  b: U | undefined
): T & U {
  if (!isPlainObject(a)) return (isPlainObject(b) ? structuredClone(b) : ({} as any)) as T & U
  if (!isPlainObject(b)) return structuredClone(a) as T & U
  const out: AnyObj = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const av = out[k]
    out[k] = isPlainObject(av) && isPlainObject(v) ? deepMergeConfig(av, v) : v
  }
  return out as T & U
}

/** Only fields we care about from module.config.json */
export type RawModuleConfigFile = {
  moduleName: string
  config?: AnyObj
  cloudConfig?:
    | string
    | {
        endpoint?: string
        apiBase?: string // legacy alias for endpoint
        method?: 'GET' | 'POST'
        headers?: Record<string, string>
        body?: any
        select?: string // dot-path: e.g. "data.config"
      }
} & Record<string, unknown>

type CloudSource = {
  endpoint?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: any
  select?: string
}

/** Public merged view */
export type ModuleConfigEntry = {
  moduleName: string
  /** merged: cloud base ← local file ← runtime overrides (rightmost wins) */
  config: AnyObj
}

/* ---------- Eager-load all module.config.json files ---------- */
const fileModules = import.meta.glob<RawModuleConfigFile>('../../*/src/module.config.json', {
  eager: true
})

const localFromFiles: Record<string, AnyObj> = {}
const cloudFromFiles: Record<string, CloudSource> = {}

function normalizeCloud(src: RawModuleConfigFile['cloudConfig']): CloudSource | undefined {
  if (!src) return undefined
  if (typeof src === 'string') return { endpoint: src }
  if (!isPlainObject(src)) return undefined
  const endpoint =
    (typeof src.endpoint === 'string' && src.endpoint) ||
    (typeof (src as any).apiBase === 'string' && (src as any).apiBase) ||
    undefined
  return { endpoint, method: src.method, headers: src.headers, body: src.body, select: src.select }
}

for (const loaded of Object.values(fileModules)) {
  const data = (loaded as any).default ?? loaded
  if (!data?.moduleName || typeof data.moduleName !== 'string') continue
  localFromFiles[data.moduleName] = isPlainObject(data.config) ? { ...data.config } : {}
  const cloud = normalizeCloud(data.cloudConfig)
  if (cloud?.endpoint) cloudFromFiles[data.moduleName] = cloud
}

/* ---------- Merge helper ---------- */
function mergeEffective(base?: AnyObj, local?: AnyObj, runtime?: AnyObj): AnyObj {
  return deepMergeConfig(deepMergeConfig(base, local), runtime)
}

/* ---------- Store ---------- */
interface ConfigStore {
  base: Record<string, AnyObj> // fetched cloud defaults
  local: Record<string, AnyObj> // from module.config.json (config field)
  overrides: Record<string, AnyObj> // runtime changes
  cloud: Record<string, CloudSource> // endpoints per module

  baseFetchedAt: Record<string, number> // ms epoch
  baseStatus: Record<string, 'idle' | 'loading' | 'success' | 'error'>
  baseError: Record<string, string | undefined>

  setConfig: (moduleName: string, next: AnyObj | ((current?: AnyObj) => AnyObj)) => void
  patchConfig: (moduleName: string, partial: AnyObj) => void
  resetConfig: (moduleName: string) => void

  setBaseFor: (moduleName: string, base: AnyObj) => void
  refreshBase: (moduleName: string) => Promise<void>
  refreshAllBases: () => Promise<void>
}

declare global {
  var __moduleConfigStore__: UseBoundStore<StoreApi<ConfigStore>>
}

/** Global in-flight dedupe for cloud fetches (and bootstrapping guard) */
const INFLIGHT_KEY = '__config_cloud_inflight__'
const inflight: Map<string, Promise<void>> = (globalThis as any)[INFLIGHT_KEY] ??
((globalThis as any)[INFLIGHT_KEY] = new Map())

const BOOT_KEY = '__config_cloud_bootstrapped__'

/** Pick nested payload by dot-path, e.g. "data.config" */
function pickByPath(obj: any, path?: string): any {
  if (!path) return obj
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

async function fetchAndInstallBase(
  moduleName: string,
  src: CloudSource,
  setBaseFor: (m: string, b: AnyObj) => void,
  setStatus: (m: string, s: 'idle' | 'loading' | 'success' | 'error') => void,
  setError: (m: string, e?: string) => void
) {
  if (!src?.endpoint) return
  if (inflight.has(moduleName)) return inflight.get(moduleName)! // dedupe

  const p = (async () => {
    try {
      setStatus(moduleName, 'loading')
      const res = await axios.request({
        url: src.endpoint!,
        method: src.method ?? 'GET',
        headers: src.headers,
        data: src.body,
        withCredentials: false
      })
      const raw = pickByPath(res.data, src.select)
      const baseObj: AnyObj = isPlainObject(raw?.config)
        ? raw.config
        : isPlainObject(raw)
          ? raw
          : {}

      setBaseFor(moduleName, baseObj)
      setError(moduleName, undefined)
      setStatus(moduleName, 'success')
    } catch (err: any) {
      setError(moduleName, err?.message ?? String(err))
      setStatus(moduleName, 'error') // no auto-retry; call refreshBase() to retry
    } finally {
      inflight.delete(moduleName)
    }
  })()

  inflight.set(moduleName, p)
  await p
}

const configStore =
  (globalThis as any)[CONFIG_STORE_KEY] ??
  create<ConfigStore>((set, get) => ({
    base: {},
    local: { ...localFromFiles },
    overrides: {},
    cloud: { ...cloudFromFiles },

    baseFetchedAt: {},
    baseStatus: {},
    baseError: {},

    setConfig: (moduleName, next) =>
      set((state) => {
        const cur = state.overrides[moduleName]
        const computed = typeof next === 'function' ? (next as (c?: AnyObj) => AnyObj)(cur) : next
        return { overrides: { ...state.overrides, [moduleName]: computed ?? {} } }
      }),

    patchConfig: (moduleName, partial) =>
      set((state) => {
        const cur = state.overrides[moduleName] ?? {}
        return { overrides: { ...state.overrides, [moduleName]: { ...cur, ...partial } } }
      }),

    resetConfig: (moduleName) =>
      set((state) => {
        if (!(moduleName in state.overrides)) return {}
        const next = { ...state.overrides }
        delete next[moduleName]
        return { overrides: next }
      }),

    setBaseFor: (moduleName, base) =>
      set((state) => ({
        base: { ...state.base, [moduleName]: base },
        baseFetchedAt: { ...state.baseFetchedAt, [moduleName]: Date.now() }
      })),

    refreshBase: async (moduleName: string) => {
      const { cloud } = get()
      const src = cloud[moduleName]
      if (!src?.endpoint) return
      await fetchAndInstallBase(
        moduleName,
        src,
        (m, b) =>
          set((s) => ({
            base: { ...s.base, [m]: b },
            baseFetchedAt: { ...s.baseFetchedAt, [m]: Date.now() }
          })),
        (m, status) => set((s) => ({ baseStatus: { ...s.baseStatus, [m]: status } })),
        (m, e) => set((s) => ({ baseError: { ...s.baseError, [m]: e } }))
      )
    },

    refreshAllBases: async () => {
      const { cloud } = get()
      await Promise.all(
        Object.entries(cloud)
          .filter(([, src]) => !!src?.endpoint)
          .map(([name]) => get().refreshBase(name))
      )
    }
  }))

;(globalThis as any)[CONFIG_STORE_KEY] = configStore

/* ---------- One-time bootstrap fetch (no React effects) ---------- */
if (!(globalThis as any)[BOOT_KEY]) {
  ;(globalThis as any)[BOOT_KEY] = true
  setTimeout(() => {
    const s = configStore.getState()
    for (const [name, src] of Object.entries(s.cloud)) {
      if (!(src as any)?.endpoint) continue
      const hasBase = s.base[name] !== undefined
      const status = s.baseStatus[name] ?? 'idle'
      if (!hasBase && status === 'idle') {
        s.refreshBase(name) // fire and forget; errors recorded but harmless
      }
    }
  }, 0)
}

/* ---------- Public selectors (NO object literals returned) ---------- */

/** Root store (actions + raw maps). Consumers MUST NOT use object-literal selectors. */
export const useConfig = configStore

/** Merged config for a module (memoized from stable map entries) */
export const useModuleConfig = (moduleName: string): ModuleConfigEntry | undefined => {
  const baseEntry = useConfig((s: any) => s.base[moduleName])
  const localEntry = useConfig((s: any) => s.local[moduleName])
  const overrideEntry = useConfig((s: any) => s.overrides[moduleName])

  const exists = baseEntry !== undefined || localEntry !== undefined || overrideEntry !== undefined

  const config = useMemo(
    () => (exists ? mergeEffective(baseEntry, localEntry, overrideEntry) : undefined),
    [baseEntry, localEntry, overrideEntry, exists]
  )

  return exists && config ? { moduleName, config } : undefined
}

/** Merged configs for ALL modules (memoized; no selectors returning fresh objects) */
export const useAllMergedConfigs = (): Record<string, ModuleConfigEntry> => {
  const baseMap = useConfig((s: any) => s.base)
  const localMap = useConfig((s: any) => s.local)
  const overridesMap = useConfig((s: any) => s.overrides)
  const cloudMap = useConfig((s: any) => s.cloud)

  return useMemo(() => {
    const names = new Set<string>([
      ...Object.keys(cloudMap),
      ...Object.keys(localMap),
      ...Object.keys(overridesMap),
      ...Object.keys(baseMap)
    ])
    const out: Record<string, ModuleConfigEntry> = {}
    for (const name of names) {
      out[name] = {
        moduleName: name,
        config: mergeEffective(baseMap[name], localMap[name], overridesMap[name])
      }
    }
    return out
  }, [baseMap, localMap, overridesMap, cloudMap])
}

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    ;(globalThis as any)[CONFIG_STORE_KEY] = configStore
  })
}
