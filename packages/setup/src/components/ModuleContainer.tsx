// src/components/ModuleContainer.tsx
import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon, Button } from 'react-components-lib.eaa'
import { useModuleConfig } from '@app/common'
import moduleConfig from '../module.config.json'
import type { ButtonProps } from 'react-components-lib.eaa'

type Props = {
  title: string
  onBack?: () => void
  className?: string
  children: React.ReactNode
  right?: React.ReactNode
  showFooter?: boolean
  footerLeftButtons?: ButtonProps[]
  footerRightButtons?: ButtonProps[]
}

type MenuNode = {
  id?: string
  title?: string
  label?: string
  icon?: string
  path?: string
  children?: MenuNode[]
}

const slugify = (s: string) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
const toTitleCase = (s: string) => {
  const cleaned = String(s).replace(/[-_]+/g, ' ').trim()
  if (!cleaned) return ''
  return cleaned
    .split(/\s+/)
    .map((t) => (/^[A-Z0-9]{2,5}$/.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1)))
    .join(' ')
}

// Layout constants
const HEADER_BASE = 162
const FOOTER_HEIGHT = 56
const FOOTER_SIDE_INSET = 16
const FOOTER_BOTTOM = 0
const BODY_EXTRA = 16

function flatten(nodes?: MenuNode[] | null): MenuNode[] {
  const out: MenuNode[] = []
  const stack = Array.isArray(nodes) ? [...nodes] : []
  while (stack.length) {
    const n = stack.shift()!
    out.push(n)
    if (Array.isArray(n.children) && n.children.length) stack.unshift(...n.children)
  }
  return out
}

export default function ModuleContainer({
  title,
  onBack,
  className,
  children,
  right,
  showFooter = true,
  footerLeftButtons,
  footerRightButtons
}: Props) {
  const location = useLocation()

  // required pattern
  const config = useModuleConfig(moduleConfig.moduleName) as any
  const setupMenu: MenuNode[] = (config?.config?.setupMenu as MenuNode[]) ?? []

  const { parentLabel, pageLabel } = useMemo(() => {
    const moduleSlug = (moduleConfig?.moduleName || location.pathname.split('/')[1] || '').trim()
    const parent = toTitleCase(moduleSlug || 'module')

    const path = location.pathname
    const lastSeg = slugify(path.split('/').filter(Boolean).pop() || '')

    const flat = flatten(setupMenu)
    const hit =
      flat.find((n) => n?.path === path) ||
      flat.find((n) => slugify(String(n?.title || n?.label || '')) === lastSeg) ||
      null

    const page = toTitleCase(
      (hit?.title || hit?.label || title || lastSeg.replace(/-/g, ' ')) as string
    )

    return { parentLabel: parent, pageLabel: page }
  }, [setupMenu, location.pathname, title])

  const noLeft = !footerLeftButtons || footerLeftButtons.length === 0
  const noRight = !footerRightButtons || footerRightButtons.length === 0
  const useDefaultClose = showFooter && noLeft && noRight

  const bodyHeight = showFooter
    ? `calc(100vh - ${HEADER_BASE + BODY_EXTRA * 2}px)`
    : `calc(100vh - ${HEADER_BASE}px)`

  return (
    <>
      {/* Scoped CSS to make .panel-header sticky within this container only */}
      <style>{`
        [data-panel-sticky] .panel-header {
          position: sticky;
          top: 0;
          z-index: 100;
        }
        [data-panel-sticky] .panel {
          overflow: unset !important;
        }
      `}</style>

      <div data-panel-sticky className={'w-full h-full overflow-hidden ' + (className ?? '')}>
        {/* Header */}
        <div className="w-full bg-white border-b border-gray-200 rounded-[2px]">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <Button variant="outlined" rounded onClick={onBack}>
                <span className="inline-flex items-center gap-2">
                  <Icon icon="arrow_back" size={20} />
                  Back
                </span>
              </Button>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500 font-medium">{parentLabel}</span>
                <span className="text-gray-300">|</span>
                <span className="text-lg font-semibold text-gray-900">{pageLabel}</span>
              </div>
            </div>
            {right}
          </div>
        </div>

        {/* Body (scroll container) */}
        <div data-panel-sticky className="pt-4 rounded-[2px] overflow-hidden">
          <div className="overflow-auto bg-white" style={{ height: bodyHeight }}>
            {children}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      {showFooter && (
        <div
          className="fixed bg-white overlow-hidden"
          style={{
            left: FOOTER_SIDE_INSET,
            right: FOOTER_SIDE_INSET,
            bottom: FOOTER_BOTTOM,
            height: FOOTER_HEIGHT,
            zIndex: 40,
            borderTopLeftRadius: '2px',
            borderTopRightRadius: '2px'
          }}
        >
          <div className="h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {footerLeftButtons?.map((btn, idx) => (
                <Button key={idx} {...btn} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {useDefaultClose ? (
                <Button color="default" variant="outlined" onClick={() => window.history.back()}>
                  Close
                </Button>
              ) : (
                footerRightButtons?.map((btn, idx) => <Button key={idx} {...btn} />)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
