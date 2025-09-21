// packages/common/src/useQueryApi.ts
import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
  type QueryClient,
  type StaleTime,
  type QueryFunction,
  useMutation,
  useQueryClient,
  type UseMutationOptions
} from '@tanstack/react-query'
import axios, { type AxiosRequestConfig } from 'axios'

// 🔥 eager-load every module.config.json
const configModules = import.meta.glob<{ moduleName: string; apiBaseUrl?: string }>(
  '../../*/src/module.config.json',
  { eager: true }
)

// flatten into { [moduleName]: apiBaseUrl }
const moduleApiBases = Object.values(configModules).reduce(
  (acc, mod) => {
    const cfg = (mod as any).default ?? mod
    if (cfg?.moduleName && cfg?.apiBaseUrl) acc[cfg.moduleName] = cfg.apiBaseUrl
    return acc
  },
  {} as Record<string, string>
)

// **Internal** owner module
let currentModuleName: string | undefined
export function registerCurrentModule(name: string) {
  currentModuleName = name
}

export function resolveApiBase(moduleName?: string) {
  return (moduleName && moduleApiBases[moduleName]) || import.meta.env.VITE_API_BASE_URL || ''
}

function buildUrl(endpoint: string, base: string) {
  return endpoint.startsWith('http')
    ? endpoint
    : `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
}

export interface QueryApiOptions<TData>
  extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey
  endpoint: string
  moduleName?: string
  axiosConfig?: Omit<AxiosRequestConfig, 'url'>
  getAuthToken?: () => string | null
}

/** React Query hook (cached) */
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
    queryFn: async ({ signal }) => {
      const base = resolveApiBase(moduleName)
      const url = buildUrl(endpoint, base)

      const token =
        getAuthToken?.() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

      const headers = {
        'Content-Type': 'application/json',
        ...(axiosConfig?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }

      const { data } = await axios.request<TData>({
        url,
        signal, // ✅ abortable
        ...axiosConfig,
        headers
      })
      return data
    },
    ...rqOptions
  })
}

/* ------------------------------------------------------------------ */
/* Optional caching for NON-hook requests (e.g. DataTable fetchers)   */
/* ------------------------------------------------------------------ */

/**
 * Use a global to ensure a single QueryClient is visible
 * across all MFEs even if module duplication happens.
 */
const g = globalThis as any
let externalQueryClient: QueryClient | undefined = g.__APP_COMMON_RQ_CLIENT__

/** Call this once where you create your QueryClient (App root) */
export function attachQueryClient(client: QueryClient) {
  g.__APP_COMMON_RQ_CLIENT__ = client
  externalQueryClient = client
}

export type ApiRequestBase<TData> = {
  endpoint: string
  moduleName?: string
  axiosConfig?: Omit<AxiosRequestConfig, 'url'>
  getAuthToken?: () => string | null
}

/** Extra cache knobs (all optional) when you want caching in apiRequest */
export type ApiRequestCacheOpts = {
  queryKey?: QueryKey
  staleTime?: StaleTime
  gcTime?: number
}

/**
 * ✅ Non-hook request helper:
 * - If you pass a `queryKey` **and** you've called `attachQueryClient`, it will cache via React Query.
 * - Otherwise, it performs a one-off request (no cache).
 */
export async function apiRequest<TData>({
  endpoint,
  moduleName = currentModuleName,
  axiosConfig,
  getAuthToken,
  queryKey, // optional
  staleTime, // optional
  gcTime // optional
}: ApiRequestBase<TData> & ApiRequestCacheOpts): Promise<TData> {
  const base = resolveApiBase(moduleName)
  const url = buildUrl(endpoint, base)

  const token =
    getAuthToken?.() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const headers = {
    'Content-Type': 'application/json',
    ...(axiosConfig?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const http = async (signal?: AbortSignal) => {
    const { data } = await axios.request<TData>({
      url,
      signal,
      ...axiosConfig,
      headers
    })
    return data
  }

  if (queryKey && externalQueryClient) {
    // Properly typed so TS knows the return is TData
    const queryFn: QueryFunction<TData, QueryKey> = ({ signal }) => http(signal)

    // Decide freshness using an invalidation-aware staleTime
    const defaults = externalQueryClient.getDefaultOptions().queries
    const effectiveSt = staleTime ?? defaults?.staleTime ?? 0

    const state = externalQueryClient.getQueryState<TData, Error, QueryKey>(queryKey)
    const hasData = !!state?.dataUpdatedAt
    const invalidated = !!(state as any)?.isInvalidated

    let isFresh = false
    if (hasData) {
      if (effectiveSt === Infinity) {
        // infinitely fresh unless explicitly invalidated
        isFresh = !invalidated
      } else if (typeof effectiveSt === 'number') {
        // fresh by age AND not invalidated
        isFresh = !invalidated && Date.now() - (state!.dataUpdatedAt as number) < effectiveSt
      } else {
        // function/other -> let fetchQuery decide (treat as not fresh here)
        isFresh = false
      }
    }

    if (hasData && isFresh) {
      // Fresh enough -> return cached data synchronously
      return externalQueryClient.getQueryData<TData>(queryKey) as TData
    }

    // Missing OR stale/invalidated -> FETCH and await fresh data
    return externalQueryClient.fetchQuery<TData>({
      queryKey,
      queryFn,
      ...(staleTime !== undefined ? { staleTime } : {}),
      ...(gcTime !== undefined ? { gcTime } : {})
    })
  }

  // no-cache path
  return http()
}

/* ------------------------------------------------------------------ */
/* Convenience non-hook verbs (clean call sites)                      */
/* ------------------------------------------------------------------ */

type ApiCallArgs<TData, TBody = any> = ApiRequestBase<TData> &
  ApiRequestCacheOpts & {
    params?: any
    data?: TBody
  }

export async function apiGet<TData>(args: ApiCallArgs<TData>) {
  const { params, ...rest } = args
  return apiRequest<TData>({
    ...rest,
    axiosConfig: { method: 'GET', params, ...(args.axiosConfig || {}) }
  })
}

export async function apiPost<TData, TBody = any>(args: ApiCallArgs<TData, TBody>) {
  const { data, params, ...rest } = args
  return apiRequest<TData>({
    ...rest,
    axiosConfig: { method: 'POST', data, params, ...(args.axiosConfig || {}) }
  })
}

export async function apiPatch<TData, TBody = any>(args: ApiCallArgs<TData, TBody>) {
  const { data, params, ...rest } = args
  return apiRequest<TData>({
    ...rest,
    axiosConfig: { method: 'PATCH', data, params, ...(args.axiosConfig || {}) }
  })
}

export async function apiPut<TData, TBody = any>(args: ApiCallArgs<TData, TBody>) {
  const { data, params, ...rest } = args
  return apiRequest<TData>({
    ...rest,
    axiosConfig: { method: 'PUT', data, params, ...(args.axiosConfig || {}) }
  })
}

export async function apiDelete<TData>(args: ApiCallArgs<TData>) {
  const { params, ...rest } = args
  return apiRequest<TData>({
    ...rest,
    axiosConfig: { method: 'DELETE', params, ...(args.axiosConfig || {}) }
  })
}

/* ------------------------------------------------------------------ */
/* Low-boilerplate mutation hook + aliases                            */
/* ------------------------------------------------------------------ */

type InvalidateTarget = QueryKey | { startsWith: QueryKey }

type UseApiMutationOptions<TVars, TData, TError = Error> = {
  endpoint: string | ((vars: TVars) => string)
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  moduleName?: string
  getAuthToken?: () => string | null
  axiosConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>

  /** Keys to invalidate on success. Accept exact keys or roots via { startsWith }. */
  invalidate?: InvalidateTarget | InvalidateTarget[]

  /** Also refetch active queries for each invalidated key/root. */
  refetchAfterInvalidate?: boolean

  /** Pass-through lifecycle hooks/options to TanStack (we’ll wrap onSuccess). */
  tanstack?: Omit<UseMutationOptions<TData, TError, TVars, unknown>, 'mutationFn'>
}

function toArr<T>(x?: T | T[]): T[] {
  return x == null ? [] : Array.isArray(x) ? x : [x]
}

function invalidateMany(qc: QueryClient, targets: InvalidateTarget[]) {
  for (const t of targets) {
    if (Array.isArray(t)) {
      qc.invalidateQueries({ queryKey: t })
    } else if ('startsWith' in t) {
      qc.invalidateQueries({ queryKey: t.startsWith })
    } else {
      qc.invalidateQueries({ queryKey: t as QueryKey })
    }
  }
}

export function useApiMutation<TVars = any, TData = unknown, TError = Error>(
  opts: UseApiMutationOptions<TVars, TData, TError>
) {
  const qc = useQueryClient()

  const {
    endpoint,
    method = 'PATCH',
    moduleName = currentModuleName,
    getAuthToken,
    axiosConfig,
    invalidate,
    refetchAfterInvalidate,
    tanstack
  } = opts

  // Pull out user onSuccess so we can call it after our invalidation
  const { onSuccess: userOnSuccess, ...restTanstack } = tanstack ?? {}

  return useMutation<TData, TError, TVars>({
    mutationFn: async (vars: TVars) => {
      const ep = typeof endpoint === 'function' ? endpoint(vars) : endpoint
      return apiRequest<TData>({
        endpoint: ep,
        moduleName,
        getAuthToken,
        axiosConfig: { method, data: vars as any, ...(axiosConfig || {}) }
      })
    },
    onSuccess: async (data, vars, ctx) => {
      const targets = toArr(invalidate)
      if (targets.length) {
        invalidateMany(qc, targets)
        if (refetchAfterInvalidate) {
          for (const t of targets) {
            const key = (
              Array.isArray(t) ? t : 'startsWith' in t ? t.startsWith : (t as QueryKey)
            ) as QueryKey
            await qc.refetchQueries({ queryKey: key, type: 'active' })
          }
        }
      }
      // call user-supplied onSuccess last
      await userOnSuccess?.(data, vars, ctx as unknown as void)
    },
    ...restTanstack
  })
}

// Aliases with method defaults
export const useApiPost = <TVars = any, TData = unknown, TError = Error>(
  o: Omit<UseApiMutationOptions<TVars, TData, TError>, 'method'>
) => useApiMutation<TVars, TData, TError>({ ...o, method: 'POST' })

export const useApiPatch = <TVars = any, TData = unknown, TError = Error>(
  o: Omit<UseApiMutationOptions<TVars, TData, TError>, 'method'>
) => useApiMutation<TVars, TData, TError>({ ...o, method: 'PATCH' })

export const useApiPut = <TVars = any, TData = unknown, TError = Error>(
  o: Omit<UseApiMutationOptions<TVars, TData, TError>, 'method'>
) => useApiMutation<TVars, TData, TError>({ ...o, method: 'PUT' })

export const useApiDelete = <TVars = any, TData = unknown, TError = Error>(
  o: Omit<UseApiMutationOptions<TVars, TData, TError>, 'method'>
) => useApiMutation<TVars, TData, TError>({ ...o, method: 'DELETE' })
