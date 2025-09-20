// packages/common/src/useAlertStore.ts
import { ReactNode } from 'react'
import { create, StoreApi, UseBoundStore } from 'zustand'
import { AlertProps } from 'react-components-lib.eaa'

/** Public options for firing an alert — everything in AlertProps except the render‑only `children` */
export type AlertOptions = Partial<Omit<AlertProps, 'children'>> & {
  /** The main message/content of the alert */
  content?: ReactNode
}

/** Internal state: all AlertProps plus our triggers */
interface AlertState extends Omit<AlertProps, 'children'> {
  /** Mapped from `AlertOptions.content` */
  content: ReactNode
  setAlert(opts?: AlertOptions): void
  clearAlert(): void
}

/** Extend the hook itself with static methods */
type AlertStoreApi = UseBoundStore<StoreApi<AlertState>> & {
  setAlert(opts?: AlertOptions): void
  clearAlert(): void
}

/** Defaults for AlertProps */
const DEFAULT_TITLE = 'Notification'
const DEFAULT_CONTENT: ReactNode = '-'
const DEFAULT_COLOR: AlertState['color'] = 'info'
const DEFAULT_ICON: string | undefined = undefined
const DEFAULT_PLACEMENT: NonNullable<AlertProps['placement']> = 'bottom-right'
const DEFAULT_CLOSE_DELAY: number = 5000
const DEFAULT_CLOSE_ICON: boolean = true
const DEFAULT_TOAST: boolean = true
const DEFAULT_CLOSEABLE: boolean = false
const DEFAULT_ON_CLOSE: (() => void) | undefined = undefined
const DEFAULT_ANIMATION: NonNullable<AlertProps['animation']> = 'fade'

/** Create the store and cast via `unknown` to our extended API */
export const useAlertStore = create<AlertState>((set) => ({
  // initial state
  show: false,
  color: DEFAULT_COLOR,
  icon: DEFAULT_ICON,
  closeIcon: DEFAULT_CLOSE_ICON,
  title: DEFAULT_TITLE,
  content: DEFAULT_CONTENT,
  toast: DEFAULT_TOAST,
  closeDelay: DEFAULT_CLOSE_DELAY,
  closeable: DEFAULT_CLOSEABLE,
  placement: DEFAULT_PLACEMENT,
  onClose: DEFAULT_ON_CLOSE,
  animation: DEFAULT_ANIMATION,

  // actions
  setAlert: (opts = {}) =>
    set({
      show: true,
      // map all AlertOptions, using .content → children
      color: opts.color ?? DEFAULT_COLOR,
      icon: opts.icon ?? DEFAULT_ICON,
      closeIcon: opts.closeIcon ?? DEFAULT_CLOSE_ICON,
      title: opts.title ?? DEFAULT_TITLE,
      content: opts.content ?? DEFAULT_CONTENT,
      toast: opts.toast ?? DEFAULT_TOAST,
      closeDelay: opts.closeDelay ?? DEFAULT_CLOSE_DELAY,
      closeable: opts.closeable ?? DEFAULT_CLOSEABLE,
      placement: opts.placement ?? DEFAULT_PLACEMENT,
      onClose: opts.onClose ?? DEFAULT_ON_CLOSE,
      animation: opts.animation ?? DEFAULT_ANIMATION
    }),
  clearAlert: () =>
    set({
      show: false
    })
})) as unknown as AlertStoreApi

// Attach static methods so you can call `useAlertStore.setAlert(...)`
useAlertStore.setAlert = (opts?) => {
  useAlertStore.getState().setAlert(opts)
}
useAlertStore.clearAlert = () => {
  useAlertStore.getState().clearAlert()
}

/** Hook for React components to fire alerts via callback */
export function useAlert(): (opts?: AlertOptions) => void {
  return useAlertStore((s) => s.setAlert)
}
