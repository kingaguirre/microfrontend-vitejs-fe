// packages/common/src/useQueryApi.ts
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'
import axios, { AxiosRequestConfig } from 'axios'

// 🔥 eager‑load every module.config.json
const configModules = import.meta.glob<{ moduleName: string; apiBaseUrl?: string }>(
  '../../*/src/module.config.json',
  { eager: true }
)

// flatten them into { [moduleName]: apiBaseUrl }
const moduleApiBases = Object.values(configModules).reduce(
  (acc, mod) => {
    const cfg = (mod as any).default ?? mod
    if (cfg.moduleName && cfg.apiBaseUrl) {
      acc[cfg.moduleName] = cfg.apiBaseUrl
    }
    return acc
  },
  {} as Record<string, string>
)

// **Internal** holder for whatever module “owns” this MFE
let currentModuleName: string | undefined

/** Call this once in your app’s entrypoint (see below) */
export function registerCurrentModule(name: string) {
  currentModuleName = name
}

export interface QueryApiOptions<TData>
  extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey
  endpoint: string
  /** you can still override if you need a one‑off different module */
  moduleName?: string
  axiosConfig?: Omit<AxiosRequestConfig, 'url'>
  getAuthToken?: () => string | null
}

export function useQueryApi<TData>({
  queryKey,
  endpoint,
  moduleName = currentModuleName,
  axiosConfig,
  getAuthToken,
  ...rqOptions
}: QueryApiOptions<TData>) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      // 1) pick your base URL
      const base =
        (moduleName && moduleApiBases[moduleName]) || import.meta.env.VITE_API_BASE_URL || ''
      const url = endpoint.startsWith('http')
        ? endpoint
        : `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

      // 2) grab your token (or nothing)
      const token = getAuthToken?.() ?? localStorage.getItem('token')

      // 3) merge JSON + any extra headers + auth
      const headers = {
        'Content-Type': 'application/json',
        ...(axiosConfig?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      // 4) fire it off (Axios will throw on 4xx/5xx or timeout)
      const { data } = await axios.request<TData>({
        url,
        ...axiosConfig,
        headers
      })
      return data
    },
    ...rqOptions
  })
}
