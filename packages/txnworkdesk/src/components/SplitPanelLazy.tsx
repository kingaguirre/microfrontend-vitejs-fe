// packages/common/src/components/SplitPanelLazy.tsx
import React, { Suspense, useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Panel, Loader, theme, Button, Icon } from 'react-components-lib.eaa'
import moduleConfig from '../module.config.json'

export type SplitItem =
  | {
      id: string
      title: string
      icon?: string
      loader: () => Promise<{ default: React.ComponentType<any> }>
      element?: never
    }
  | {
      id: string
      title: string
      icon?: string
      element: React.ReactNode
      loader?: never
    }

type Hotkey = {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  label?: string
}

export type PaneHandle<TValues = unknown, TResult = unknown> = {
  submit?: () => TResult | Promise<TResult>
  validate?: () => boolean | Promise<boolean>
  getValues?: () => TValues
  reset?: () => void
}

export type FooterAction = {
  key: string
  label: string
  onClick: (api: {
    activeId: string | null
    form: PaneHandle<any, any> | null
    closeForm: () => void
  }) => void | Promise<void>
  icon?: string
  color?: string
  disabled?: boolean
  variant?: string
  width?: number
}

export type PaneInfo = {
  id: string
  index: number
  item: SplitItem
  isActive: boolean
}

export type PaneProps = {
  disabled?: boolean | ((info: PaneInfo) => boolean)
  [key: string]: any
}

export interface SplitPanelLazyProps {
  items: SplitItem[]
  defaultActiveId?: string
  activeId?: string
  onChangeActiveId?: (id: string) => void
  /** Notified whenever active pane changes (incl. via ?menu=) */
  onMenuChange?: (nextId: string, prevId: string | null, nextItem: SplitItem) => void
  leftWidth?: number
  header?: React.ReactNode
  height?: string | number
  activationHotkey?: Hotkey
  disabledSubmit?: boolean
  footerActions?: FooterAction[]
  renderFooter?: (api: {
    activeId: string | null
    form: PaneHandle | null
    closeForm: () => void
  }) => React.ReactNode
  /** Props for loader-based panes; object or fn(info)=>object */
  paneProps?: PaneProps | ((info: PaneInfo) => PaneProps)
  onSuccess?: (e: {
    id: string
    index: number
    item: SplitItem
    data: any
    source?: 'fetch' | 'submit' | string
  }) => void
  onError?: (e: {
    id: string
    index: number
    item: SplitItem
    error: string
    source?: 'fetch' | 'submit' | string
  }) => void
}

type LoaderFn = () => Promise<{ default: React.ComponentType<any> }>

export function SplitPanelLazy({
  items,
  defaultActiveId,
  activeId,
  onChangeActiveId,
  onMenuChange,
  leftWidth = 240,
  header,
  activationHotkey = { key: '/', alt: true, label: 'Alt+/' },
  footerActions,
  renderFooter,
  paneProps,
  disabledSubmit = false,
  onSuccess,
  onError
}: SplitPanelLazyProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // ----- selection vs highlight -----
  const [inner, setInner] = useState<string>(defaultActiveId ?? items[0]?.id)
  const selectedId = activeId ?? inner
  const [highlightId, setHighlightId] = useState<string | null>(selectedId ?? null)
  const [navActive, setNavActive] = useState(false)

  const setSelected = (id: string) => {
    if (activeId == null) setInner(id)
    onChangeActiveId?.(id)
  }

  // read ?menu=pane_id on mount / when the querystring changes
  useEffect(() => {
    if (!items.length) return
    const params = new URLSearchParams(location.search)
    const fromQuery = params.get('menu')
    if (!fromQuery) return
    const exists = items.some((i) => i.id === fromQuery)
    if (!exists) return
    if (activeId == null) setInner(fromQuery)
    setHighlightId(fromQuery)
  }, [location.search, items, activeId])

  useEffect(() => {
    if (!items.length) return
    const exists = items.some((i) => i.id === (highlightId ?? ''))
    if (!exists) setHighlightId(selectedId ?? items[0].id)
  }, [items, selectedId, highlightId])

  const current = items.find((i) => i.id === selectedId) ?? items[0]

  // ----- notify on menu change -----
  const prevIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!current) return
    const prev = prevIdRef.current
    if (prev !== current.id) {
      onMenuChange?.(current.id, prev, current)
      prevIdRef.current = current.id
    }
  }, [current, onMenuChange])

  // ----- lazy cache -----
  const lazyMapRef = useRef<WeakMap<LoaderFn, React.LazyExoticComponent<any>>>(new WeakMap())

  // ----- refs -----
  const listRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([])

  // active pane handle
  const activeHandleRef = useRef<PaneHandle | null>(null)
  useEffect(() => {
    activeHandleRef.current = null
  }, [selectedId])

  const submitActive = async () => {
    const aa = await activeHandleRef.current?.submit?.()
    console.log(aa)

  }

  // ----- hotkeys -----
  const isTypingTarget = (el: EventTarget | null) => {
    const node = el as HTMLElement | null
    if (!node) return false
    const tag = node.tagName?.toLowerCase()
    const editable =
      (node as any).isContentEditable || node.getAttribute?.('contenteditable') === 'true'
    return (
      editable ||
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      !!node.closest?.('[role="textbox"]')
    )
  }

  const matchHotkey = useCallback(
    (e: KeyboardEvent) => {
      if (activationHotkey.ctrl && !e.ctrlKey) return false
      if (!activationHotkey.ctrl && e.ctrlKey) return false
      if (activationHotkey.alt && !e.altKey) return false
      if (!activationHotkey.alt && e.altKey) return false
      if (activationHotkey.shift && !e.shiftKey) return false
      if (!activationHotkey.shift && e.shiftKey) return false
      // Use layout-independent code for "/" so Option/ works on macOS
      if (activationHotkey.key === '/' && (e as any).code) return (e as any).code === 'Slash'
      return e.key.toLowerCase() === activationHotkey.key.toLowerCase()
    },
    [activationHotkey]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navActive && !isTypingTarget(e.target)) {
        e.preventDefault()
        setNavActive(false)
        return
      }
      if (!isTypingTarget(e.target) && matchHotkey(e)) {
        e.preventDefault()
        setNavActive(true)
        setHighlightId((prev) => prev ?? selectedId ?? items[0]?.id ?? null)
        requestAnimationFrame(() => listRef.current?.focus())
      }
    }

    const onNavArrows = (e: KeyboardEvent) => {
      if (!navActive || !items.length) return
      if (isTypingTarget(e.target)) return

      const baseId = highlightId ?? selectedId ?? items[0]?.id
      const idx = Math.max(
        0,
        items.findIndex((i) => i.id === baseId)
      )

      if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault()
        const next = (idx + 1) % items.length
        setHighlightId(items[next].id)
        btnRefs.current[next]?.focus()
        btnRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return
      }
      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault()
        const prev = (idx - 1 + items.length) % items.length
        setHighlightId(items[prev].id)
        btnRefs.current[prev]?.focus()
        btnRefs.current[prev]?.scrollIntoView({ block: 'nearest' })
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const id = highlightId ?? selectedId ?? items[idx].id
        setSelected(id)
        return
      }
    }

    window.addEventListener('keydown', onKey, { capture: true })
    window.addEventListener('keydown', onNavArrows, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKey, { capture: true } as any)
      window.removeEventListener('keydown', onNavArrows, { capture: true } as any)
    }
  }, [items, navActive, matchHotkey, selectedId, highlightId])

  // click selects + enters nav mode + focuses list
  const onClickItem = (id: string, index: number) => {
    setSelected(id)
    setHighlightId(id)
    if (!navActive) setNavActive(true)
    requestAnimationFrame(() => {
      listRef.current?.focus()
      btnRefs.current[index]?.scrollIntoView({ block: 'nearest' })
    })
  }

  // keep highlighted visible
  useEffect(() => {
    if (!navActive || !highlightId) return
    const idx = items.findIndex((i) => i.id === highlightId)
    if (idx >= 0) btnRefs.current[idx]?.scrollIntoView({ block: 'nearest' })
  }, [highlightId, navActive, items])

  // ----- Right content w/ paneProps + injected title/id/index -----
  const rightContent = useMemo<React.ReactNode>(() => {
    if (!current) return <div className="text-sm text-gray-500 p-4">No content.</div>

    if ('element' in current && current.element) {
      return current.element
    }

    if ('loader' in current && current.loader) {
      const loader = current.loader as LoaderFn
      let L = lazyMapRef.current.get(loader)
      if (!L) {
        L = React.lazy(loader)
        lazyMapRef.current.set(loader, L)
      }
      const LazyComp = L as React.ComponentType<any>

      const index = items.findIndex((i) => i.id === current.id)
      const info: PaneInfo = { id: current.id, index, item: current, isActive: true }
      const rawPaneProps = typeof paneProps === 'function' ? paneProps(info) : (paneProps ?? {})
      const resolved: Record<string, any> = { ...(rawPaneProps as any) }

      // allow disabled to be a function
      if (typeof resolved?.disabled === 'function') {
        resolved.disabled = resolved.disabled(info)
      }

      // inject id/title/index for panes
      const paneTitle = (current as any).title
      if (resolved.title == null) resolved.title = paneTitle // pane can read `title`
      if (resolved.paneTitle == null) resolved.paneTitle = paneTitle
      if (resolved.paneId == null) resolved.paneId = current.id
      if (resolved.paneIndex == null) resolved.paneIndex = index

      // wrap emitters with pane context
      const emitSuccess = (data: any, meta?: { source?: 'fetch' | 'submit' | string }) => {
        onSuccess?.({ id: current.id, index, item: current, data, source: meta?.source })
      }
      const emitError = (error: string, meta?: { source?: 'fetch' | 'submit' | string }) => {
        onError?.({ id: current.id, index, item: current, error, source: meta?.source })
      }

      return (
        <LazyComp
          onRegisterHandle={(h: PaneHandle | null) => {
            activeHandleRef.current = h
          }}
          onSuccess={emitSuccess}
          onError={emitError}
          {...resolved}
        />
      )
    }

    return <div className="text-sm text-gray-500 p-4">No content.</div>
  }, [current, items, paneProps])

  // ----- Footer helpers -----
  const closeForm = () => {
    const base = `/${String((moduleConfig as any)?.moduleName || '').replace(/^\/+/, '')}`
    navigate(base || '/')
  }

  return (
    <div className="w-full">
      <style>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

      {/* Optional external header slot */}
      {header ?? null}

      <div className="grid" style={{ gridTemplateColumns: `${leftWidth}px calc(100% - 252px)`, gap: 12 }}>
        {/* Left rail */}
        <div className='bg-white'>
          <Panel hideShadow title="SECTIONS">
            <div
              ref={listRef}
              role="listbox"
              aria-label="Sections"
              aria-activedescendant={highlightId ?? undefined}
              aria-orientation="vertical"
              tabIndex={0}
              className="overflow-auto focus:outline-none no-scrollbar"
              style={{ maxHeight: 'calc(100vh - 228px)' }}
            >
              {items.map((it, i) => {
                const selected = it.id === selectedId
                const highlighted = navActive && it.id === highlightId && !selected
                const selectedAndActive = navActive && selected && highlightId === selectedId

                const baseColor = '#6b7280'
                const bg = selected
                  ? theme.colors.primary.pale
                  : highlighted
                    ? 'rgba(17,24,39,0.06)'
                    : 'transparent'
                const leftBar = selected
                  ? `3px solid ${selectedAndActive ? theme.colors.primary.dark : theme.colors.primary.base}`
                  : highlighted
                    ? `3px dashed ${theme.colors.primary.base}`
                    : '3px solid transparent'

                return (
                  <button
                    key={it.id}
                    id={it.id}
                    ref={(el) => (btnRefs.current[i] = el) as any}
                    type="button"
                    onClick={() => onClickItem(it.id, i)}
                    role="option"
                    aria-selected={selected}
                    className="group w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                    style={{
                      background: bg,
                      color: selected ? theme.colors.primary.darker : baseColor,
                      borderLeft: leftBar,
                      outline: 'none'
                    }}
                  >
                    {it.icon ? <Icon icon={it.icon} size={16} /> : null}
                    <span className="truncate">{it.title}</span>
                  </button>
                )
              })}

              {/* Tips footer (sticky) */}
              <div
                className="px-2 pt-2 text-xs border-t mt-2 sticky bottom-0"
                style={{
                  background: '#ffffff',
                  borderColor: '#e5e7eb',
                  color: navActive ? theme.colors.primary.darker : '#6b7280',
                  fontSize: '10px',
                  lineHeight: 1.2
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-[4px]">
                  <div className="truncate">
                    {activationHotkey.label ?? formatHotkeyLabel(activationHotkey)} to activate •
                    Esc to exit
                  </div>
                  <div className="shrink-0 hidden md:block">↑/↓ move • Enter select</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right content */}
        {/* <Panel hideShadow noPadding> */}
          <div className="overflow-auto no-scrollbar relative bg-white rounded-[2px]" style={{ height: 'calc(100vh - 174px)' }}>
            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-content-center">
                  <Loader size="md" label="Loading section..." />
                </div>
              }
            >
              {rightContent}
            </Suspense>
          </div>
        {/* </Panel> */}
      </div>

      {/* Footer (always visible) */}
      <div className="border-t bg-white px-3 py-2 mt-3 fixed bottom-0 right-[16px] left-[16px] rounded-[2px]">
        {typeof renderFooter === 'function' ? (
          renderFooter({
            activeId: selectedId ?? null,
            form: activeHandleRef.current,
            closeForm
          })
        ) : (
          <div className="flex items-center justify-end gap-[8px]">
            {(footerActions ?? []).map((a) => (
              <Button
                key={a.key}
                onClick={() =>
                  a.onClick({
                    activeId: selectedId ?? null,
                    form: activeHandleRef.current,
                    closeForm
                  })
                }
                icon={a.icon}
                color={a.color as any}
                disabled={a.disabled}
                width={a.width}
                variant={a.variant as any}
              >
                {a.label}
              </Button>
            ))}
            <Button onClick={submitActive} disabled={disabledSubmit} width={80}>
              Submit
            </Button>
            <Button onClick={closeForm} variant="outlined" color="default">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatHotkeyLabel(h: Hotkey): string {
  const parts: string[] = []
  if (h.ctrl) parts.push('Ctrl')
  if (h.alt) parts.push('Alt')
  if (h.shift) parts.push('Shift')
  parts.push(h.key.length === 1 ? h.key.toUpperCase() : h.key)
  return parts.join('+')
}
