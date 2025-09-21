// packages/<your-module>/src/useStore.ts

/**
 * 🚨 DO NOT TOUCH THIS FILE UNLESS YOU KNOW WHAT YOU’RE DOING.
 */

import { useCallback, useRef } from 'react'
import moduleConfig from './module.config.json'
import { useGlobalStore } from '@app/common'

/**
 * A hook that wires your module into the global Zustand store.
 *
 * @template T - the shape of your module’s slice
 * @returns {{
 *   state: T,                             // your slice from the global store
 *   setState: (p: Partial<T>) => void,    // merge into your slice
 *   reset: () => void                     // remove your slice entirely
 * }}
 */
export function useStore<T extends Record<string, any> = Record<string, any>>() {
  const { moduleName } = moduleConfig

  // Stable, cached empty object to avoid infinite loop when slice is unset
  const emptyRef = useRef<T>({} as T)

  // Subscribe to just your module’s bucket; fallback to the same empty object each time
  const slice = useGlobalStore((s) => (s.store[moduleName] ?? emptyRef.current) as T)

  // Merge partial updates into your slice.
  // We grab the freshest slice inside getState() to avoid stale closures.
  const setState = useCallback((partial: Partial<T>) => {
    const currentSlice = useGlobalStore.getState().store[moduleName] ?? {}
    useGlobalStore.getState().setStateFor(moduleName, { ...currentSlice, ...partial })
  }, [])

  // Wipe your slice completely
  const reset = useCallback(() => {
    useGlobalStore.getState().resetStateFor(moduleName)
  }, [])

  return { state: slice, setState, reset }
}
