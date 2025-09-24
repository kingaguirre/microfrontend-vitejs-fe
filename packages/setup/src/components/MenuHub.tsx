// packages/.../ModernMenuHub.tsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleLink from '../components/ModuleLink'
import { Icon, Button, FormControl, theme, Panel } from 'react-components-lib.eaa'

// Platform helpers for Alt vs Option label
const IS_MAC = (() => {
  try {
    const p =
      // @ts-ignore
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      ''
    return /Mac|iPhone|iPad|iPod/.test(p)
  } catch {
    return false
  }
})()
const SEARCH_CHORD_LABEL = IS_MAC ? '⌥ + K' : 'Alt + K'

/** ---------- Types ---------- */
export type MenuNode = {
  id: string
  title: string
  icon?: string
  path: string
  children?: MenuNode[] | null
  keywords?: string[]
}

export type ModernMenuHubProps = {
  data?: MenuNode[] | null
  onNavigate?: (path: string) => void // optional hook (analytics etc.)
  className?: string
  title?: string
}

/** ---------- Utils ---------- */
type FlatHit = {
  idPath: string[]
  titlePath: string[]
  node: MenuNode
  isLeaf: boolean
  path: string
}

const asArray = <T,>(m: T[] | null | undefined): T[] => (Array.isArray(m) ? m : [])
const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g
const escapeRegExp = (s: string) => String(s).replace(ESCAPE_RE, '\\$&')
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Highlight WITHOUT spacing bugs */
const highlight = (text: string, query: string) => {
  const q = (query ?? '').trim()
  if (!q) return text
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig')
  const parts = String(text).split(re)
  return parts.map((seg, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        style={{ backgroundColor: '#FFF59D', padding: 0, borderRadius: 2, color: '#000' }}
      >
        {seg}
      </mark>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    )
  )
}

const rank = (hit: FlatHit, q: string) => {
  const query = q.toLowerCase()
  const title = hit.node.title.toLowerCase()
  const inTitle = title.indexOf(query)
  const inKeywords = (hit.node.keywords || []).some((k) => k.toLowerCase().includes(query))
  const starts = title.startsWith(query) ? 0 : 1
  const contains = inTitle >= 0 ? 0 : 2
  const kw = inKeywords ? 0 : 2
  const depth = hit.titlePath.length
  return starts + contains + kw + depth / 10
}

/** Flatten (defensive) */
const flatten = (
  roots?: MenuNode[] | null,
  parentIdPath: string[] = [],
  parentTitlePath: string[] = []
): FlatHit[] => {
  const out: FlatHit[] = []
  const safeRoots = asArray(roots)
  for (const n of safeRoots) {
    const idPath = [...parentIdPath, n.id]
    const titlePath = [...parentTitlePath, n.title]
    const children = asArray(n.children)
    const isLeaf = children.length === 0
    const path = n.path
    out.push({ idPath, titlePath, node: n, isLeaf, path })
    if (children.length) {
      const sub = flatten(children, idPath, titlePath)
      if (Array.isArray(sub) && sub.length) out.push.apply(out, sub)
    }
  }
  return out
}

/** ---------- Component ---------- */
export default function ModernMenuHub({
  data = [],
  onNavigate,
  className,
  title = 'Setup Menu'
}: ModernMenuHubProps) {
  const roots = asArray(data)
  const [stack, setStack] = useState<{ label: string; nodes: MenuNode[]; path: string }[]>([
    { label: title, nodes: roots, path: '/' }
  ])
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const current = stack[stack.length - 1]
  const isRoot = stack.length === 1

  const flat = useMemo(() => flatten(roots), [roots])

  const results = useMemo(() => {
    const q = (query ?? '').trim()
    if (!q) return [] as FlatHit[]
    return flat
      .filter(
        (h) =>
          h.titlePath.join(' ').toLowerCase().includes(q.toLowerCase()) ||
          (h.node.keywords || []).some((k) => k.toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => rank(a, q) - rank(b, q))
      .slice(0, 20)
  }, [flat, query])

  // ---------- Search keyboard + shortcuts ----------
  const searchId = 'menuhub-search'
  const listRef = useRef<HTMLDivElement | null>(null)
  const searchWrapRef = useRef<HTMLDivElement | null>(null)

  const focusSearch = useCallback(() => {
    ;(document.getElementById(searchId) as HTMLInputElement | null)?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyK') {
        e.preventDefault()
        focusSearch()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true } as any)
  }, [focusSearch])

  // Close dropdown on outside click
  useEffect(() => {
    if (!searchOpen) return
    const onDocPointerDown = (e: Event) => {
      const wrap = searchWrapRef.current
      if (!wrap) return
      const target = e.target as Node | null
      if (target && wrap.contains(target)) return
      setSearchOpen(false)
    }
    // capture=true so we get the event before inner handlers
    window.addEventListener('pointerdown', onDocPointerDown, true)
    window.addEventListener('click', onDocPointerDown, true)
    return () => {
      window.removeEventListener('pointerdown', onDocPointerDown, true)
      window.removeEventListener('click', onDocPointerDown, true)
    }
  }, [searchOpen])

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!searchOpen) return
    const len = results.length
    if (!len) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % len)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + len) % len)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const activeEl = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      if (activeEl) activeEl.click()
      setSearchOpen(false)
      setQuery('')
      return
    }
    if (e.key === 'Escape') {
      setSearchOpen(false)
      return
    }
  }

  // Keep selected row in view when arrowing
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, searchOpen])

  // ---------- Navigation ----------
  const openNode = useCallback(
    (n: MenuNode) => {
      const children = asArray(n.children)
      if (children.length) {
        setStack((prev) => [
          ...prev,
          { label: cap(n.title), nodes: children, path: n.path || `#virtual/${n.id}` }
        ])
        return
      }
      const dest = n.path
      if (typeof window !== 'undefined') window.location.href = dest
      onNavigate?.(dest)
    },
    [onNavigate]
  )

  const goBack = useCallback(
    () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)),
    []
  )

  // Reset activeIndex when results change
  useEffect(() => setActiveIndex(0), [query])

  // ---------- Theme tokens (align with Home) ----------
  const primaryBase = theme?.colors?.primary?.base || '#6366F1'
  const primaryPale = theme?.colors?.primary?.pale || primaryBase + '22'
  const primaryDarker = theme?.colors?.primary?.darker || theme?.colors?.primary?.dark || '#3730A3'

  // --- FIX: reopen dropdown after Esc when user types again
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e?.target?.value ?? ''
    setQuery(v)
    const hasText = v.trim().length > 0
    setSearchOpen(hasText)
  }, [])

  return (
    <div
      className={
        'w-full max-w-screen-2xl mx-auto bg-white rounded-[2px] shadow-sm ' +
        'flex flex-col h-[calc(100vh-64px)] overflow-hidden ' +
        (className ?? '')
      }
      style={{ borderBottom: `1px solid ${theme.colors.primary.base}` }}
    >
      {/* Card hover styles (title bigger, text gray → darker on hover, title to primary.darker) */}
      <style>{`
        .menu-card .card-title,
        .menu-card .card-text {
          transition: all 300ms ease;
        }
        .menu-card:hover .card-title {
          color: ${primaryDarker} !important;
        }
        .menu-card:hover .card-text {
          color: #374151 !important; /* gray-700 */
        }
      `}</style>

      {/* Header — match Home top bar (pale→white gradient + bottom border) */}
      <div
        className="sticky top-0 z-20 px-5 py-3 rounded-[2px]"
        style={{
          background: `linear-gradient(90deg, ${primaryPale} 0%, #ffffff 100%)`,
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <div className="flex items-center gap-3">
          {!isRoot ? (
            <Button variant="outlined" rounded onClick={goBack} className="px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <Icon icon="arrow_back" size={20} />
                Back
              </span>
            </Button>
          ) : (
            <div
              className="h-9 w-9 flex items-center justify-center rounded-md font-bold text-white shrink-0"
              style={{ background: primaryBase }}
            >
              <Icon icon="grid_view" size={18} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold" style={{ color: primaryDarker }}>
              {isRoot ? cap(title) : cap(current.label)}
            </div>
            <div className="text-xs text-gray-600">
              Find a setting fast — press{' '}
              <span className="px-1 rounded bg-gray-100 border">{SEARCH_CHORD_LABEL}</span> to search
            </div>
          </div>

          {/* Search box */}
          <div ref={searchWrapRef} className="ml-auto flex items-center gap-2 w-[min(520px,80vw)] relative">
            <FormControl
              id={searchId}
              type="text"
              value={query ?? ''}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onSearchKeyDown}
              onChange={handleSearchChange}
              placeholder={`Search menus, e.g. Product Details… (${SEARCH_CHORD_LABEL})`}
              iconRight={[{ icon: 'search' }]}
              className="w-full"
              rounded
              size="lg"
            />

            {/* Search dropdown */}
            <AnimatePresence>
              {searchOpen && (query ?? '').trim() && (
                <motion.div
                  key="search-dropdown"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full mt-2 w-full left-0 rounded-[4px] border bg-white shadow-xl overflow-hidden"
                  style={{
                    transition: 'all .15s ease',
                    maxWidth: '520px',
                    backgroundColor: theme.colors.lightA
                  }}
                >
                  <div
                    ref={listRef}
                    className="max-h-[56vh] overflow-auto p-1"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {results.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No matches</div>
                    ) : (
                      results.map((hit, idx) => {
                        const last = hit.titlePath[hit.titlePath.length - 1] ?? ''
                        const isLeaf = hit.isLeaf
                        const baseKey = hit.idPath.join('/')
                        const selected = idx === activeIndex

                        // Row card: 1px in both states; selected uses color + outer ring (no size change)
                        const rowStyle: React.CSSProperties = {
                          border: `1px solid ${selected ? primaryBase : '#E5E7EB'}`,
                          boxShadow: selected ? `0 0 0 3px ${primaryPale}` : 'none',
                          background: '#fff',
                          transition:
                            'border-color .2s ease, box-shadow .2s ease, background-color .2s ease'
                        }

                        // Icon wrapper: 1px border always; subtle ring when selected
                        const iconWrapStyle: React.CSSProperties = {
                          background: selected ? primaryBase : primaryPale,
                          color: selected ? 'white' : primaryDarker,
                          border: 'none',
                          boxShadow: selected ? `0 0 0 4px ${primaryPale}` : 'none',
                          lineHeight: 1,
                          transition: 'all .2s ease'
                        }

                        const Trail = () => (
                          <div className="mt-0.5 text-xs text-gray-500 capitalize">
                            {hit.titlePath.map((p, i) => (
                              <span key={`${hit.idPath.join('/')}-${i}`}>
                                {i > 0 && <span className="mx-1 text-gray-400">›</span>}
                                {highlight(cap(p), query)}
                              </span>
                            ))}
                          </div>
                        )

                        const RowInner = (
                          <div
                            className="rounded-[6px] p-3 hover:bg-gray-50 transition-all"
                            style={rowStyle}
                          >
                            {/* make text gray-500 by default; darker when selected */}
                            <div className={selected ? 'text-gray-700' : 'text-gray-500'}>
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
                                  style={iconWrapStyle}
                                >
                                  <Icon
                                    icon={
                                      hit.node.icon || (isLeaf ? 'insert_drive_file' : 'folder')
                                    }
                                    size={18}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    <span className="inline align-middle capitalize">
                                      {highlight(cap(last), query)}
                                    </span>
                                    <span
                                      className="ml-2 align-middle text-xs inline-flex items-center gap-1"
                                      style={{
                                        color: isLeaf ? primaryBase : undefined
                                      }}
                                    >
                                      {isLeaf ? (
                                        <>
                                          Go to {hit.path} <Icon icon="arrow_forward" size={12} />
                                        </>
                                      ) : (
                                        <>
                                          Open <Icon icon="arrow_forward" size={12} />
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <Trail />
                                </div>
                              </div>
                            </div>
                          </div>
                        )

                        if (isLeaf) {
                          return (
                            <ModuleLink
                              key={`${baseKey}::leaf`}
                              to={hit.path}
                              className="block w-full text-left p-1"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => {
                                onNavigate?.(hit.path)
                                setSearchOpen(false)
                                setQuery('')
                              }}
                              data-active={selected ? 'true' : undefined}
                              aria-selected={selected}
                            >
                              {RowInner}
                            </ModuleLink>
                          )
                        }

                        return (
                          <button
                            key={`${baseKey}::branch`}
                            className="w-full text-left p-1"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              openNode(hit.node)
                              setSearchOpen(false)
                              setQuery('')
                            }}
                            data-active={selected ? 'true' : undefined}
                            aria-selected={selected}
                          >
                            {RowInner}
                          </button>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Breadcrumb */}
        <div className="mt-4 mb-3 text-xs text-gray-500 flex items-center gap-1 px-5">
          <Icon icon="alt_route" size={18} />
          <span>{stack.map((s) => cap(s.label)).join(' / ')}</span>
        </div>

        {/* Cards with fade between levels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.path || 'root'}::${current.label || 'root'}::depth-${stack.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {asArray(current?.nodes).map((n) => {
                const children = asArray(n.children)
                const hasChildren = children.length > 0
                const cardKey = `${n.id}::${hasChildren ? 'folder' : 'file'}`
                const count = children.length

                const CardBody = (
                  <>
                    <div className="flex items-start gap-3">
                      <div
                        className="icon-tile border h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: primaryPale,
                          color: primaryDarker,
                          borderColor: primaryPale,
                          lineHeight: 1,
                          transition: 'all .3s ease'
                        }}
                        aria-hidden
                      >
                        <Icon
                          icon={n.icon || (hasChildren ? 'folder' : 'insert_drive_file')}
                          size={20}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* title a bit bigger; hover goes to primary.darker via .menu-card */}
                        <div className="card-title font-semibold truncate capitalize text-base transition-colors">
                          {cap(n.title)}
                        </div>

                        {/* copy: default gray-600; hover darker via .menu-card */}
                        <div className="mt-1 text-sm text-gray-600 card-text transition-colors">
                          {hasChildren ? (
                            <span>
                              {count} item{count === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span>
                              Go to page <span style={{ color: primaryBase }}>{n.path}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* footer row: same gray→darker behavior */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 card-text transition-colors">
                      {hasChildren ? (
                        <>
                          <Icon icon="keyboard_arrow_right" size={20} />
                          <span>Open</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="call_made" size={18} />
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ color: primaryBase }}
                          >
                            Navigate <Icon icon="arrow_forward" size={12} />
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )

                // Hover coloring for icon tile
                const onHoverEnter = (target: HTMLElement) => {
                  const tile = target.querySelector('.icon-tile') as HTMLElement | null
                  if (tile) {
                    tile.style.boxShadow = `0 0 0 4px ${primaryPale}`
                    tile.style.color = 'white'
                    tile.style.borderColor = primaryBase
                    tile.style.backgroundColor = primaryBase
                  }
                }
                const onHoverLeave = (target: HTMLElement) => {
                  const tile = target.querySelector('.icon-tile') as HTMLElement | null
                  if (tile) {
                    tile.style.boxShadow = ''
                    tile.style.color = primaryDarker
                    tile.style.borderColor = primaryPale
                    tile.style.backgroundColor = primaryPale
                  }
                }

                if (hasChildren) {
                  return (
                    <motion.button
                      key={cardKey}
                      whileTap={{ scale: 0.99 }}
                      onMouseEnter={(e) => onHoverEnter(e.currentTarget)}
                      onMouseLeave={(e) => onHoverLeave(e.currentTarget)}
                      onClick={() => openNode(n)}
                      className="group text-left menu-card"
                      aria-label={`Open ${n.title}`}
                    >
                      <Panel className="h-full">{CardBody}</Panel>
                    </motion.button>
                  )
                }

                return (
                  <ModuleLink
                    key={cardKey}
                    to={n.path}
                    className="group block text-left menu-card"
                    onMouseEnter={(e: any) => onHoverEnter(e.currentTarget)}
                    onMouseLeave={(e: any) => onHoverLeave(e.currentTarget)}
                    onClick={() => onNavigate?.(n.path)}
                    aria-label={`Navigate to ${n.title}`}
                  >
                    <Panel className="h-full">{CardBody}</Panel>
                  </ModuleLink>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
