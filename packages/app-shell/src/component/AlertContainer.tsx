// src/components/AlertContainer.tsx
import React from 'react'
import { Alert } from 'react-components-lib.eaa'
import { useAlertStore } from '@app/common'

export const AlertContainer: React.FC = () => {
  const show = useAlertStore((s) => s.show)
  const title = useAlertStore((s) => s.title)
  const content = useAlertStore((s) => s.content)
  const color = useAlertStore((s) => s.color)
  const icon = useAlertStore((s) => s.icon)
  const closeIcon = useAlertStore((s) => s.closeIcon)
  const toast = useAlertStore((s) => s.toast)
  const closeDelay = useAlertStore((s) => s.closeDelay)
  const closeable = useAlertStore((s) => s.closeable)
  const placement = useAlertStore((s) => s.placement)
  const animation = useAlertStore((s) => s.animation)
  const onCloseCb = useAlertStore((s) => s.onClose)
  const clearAlert = useAlertStore((s) => s.clearAlert)

  if (!show) return null

  return (
    <Alert
      show={show}
      title={title}
      color={color}
      icon={icon}
      closeIcon={closeIcon}
      toast={toast}
      closeDelay={closeDelay}
      closeable={closeable}
      placement={placement}
      animation={animation}
      onClose={() => {
        clearAlert()
        onCloseCb?.()
      }}
    >
      {content}
    </Alert>
  )
}
