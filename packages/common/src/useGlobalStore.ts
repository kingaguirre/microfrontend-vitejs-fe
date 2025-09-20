// packages/common/src/useGlobalStore.ts
import { create } from 'zustand'

type StoreRecord = Record<string, any>

interface GlobalState {
  store: StoreRecord
  setStateFor: (key: string, value: any) => void
  resetStateFor: (key: string) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  store: {},
  setStateFor: (key, value) => set((prev) => ({ store: { ...prev.store, [key]: value } })),
  resetStateFor: (key) =>
    set((prev) => {
      const { [key]: _, ...rest } = prev.store
      return { store: rest }
    })
}))
