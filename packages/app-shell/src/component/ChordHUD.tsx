// packages/app-shell/src/components/ChordHUD.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from 'react-components-lib.eaa'
import { useAllMergedConfigs } from '@app/common'
import { createPortal } from 'react-dom'

type RouteMap = Partial<Record<string, string>>
type ChordOpener = { ctrl?: boolean; meta?: boolean; code: string }

// ── Static behavior ───────────────────────────────────────────────────────────
const STATIC_CHORD_OPENERS: ChordOpener[] = [
  { ctrl: true, code: 'Period' }, // Ctrl + .
  { meta: true, code: 'Period' } // ⌘ + .
]
const STATIC_CHORD_LABEL = 'Ctrl + .'
const STATIC_SHOW = true
const STATIC_LINGER_MS = 1200

// Optional AppShell hooks (safe no-ops if absent)
const STATIC_OPEN_MENU = () => {
  try {
    ;(window as any)?.AppShell?.openMenu?.()
  } catch {}
}
const STATIC_CLOSE_MENU = () => {
  try {
    ;(window as any)?.AppShell?.closeMenu?.()
  } catch {}
}
const STATIC_IS_MENU_OPEN = (): boolean => {
  try {
    return !!(window as any)?.AppShell?.isMenuOpen?.()
  } catch {
    return false
  }
}
const STATIC_CUSTOM_NAVIGATE: ((path: string) => void) | undefined = undefined

// Home special key
const HOME_KEY_DISPLAY = '/' // shown on pill
const HOME_KEY_CODE = 'Slash' // KeyboardEvent.code for "/"
const HOME_PATH = '/'
// ─────────────────────────────────────────────────────────────────────────────

function isEditableTarget(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || (el as any).isContentEditable) return true
  const role = el.getAttribute?.('role')
  return role === 'textbox'
}

export default function ChordHUD() {
  const rrNavigate = useNavigate()
  const navigate = (path: string) =>
    STATIC_CUSTOM_NAVIGATE ? STATIC_CUSTOM_NAVIGATE(path) : rrNavigate(path)

  // Dynamic key map from module configs
  const allConfigs = useAllMergedConfigs() as Record<
    string,
    { config?: { menuIcon?: string; navigateKey?: string; navigateKeyName?: string } } | undefined
  >

  const dynamicItems = useMemo(() => {
    const seen = new Set<string>()
    const items: { key: string; label: string; path: string }[] = []

    if (allConfigs && typeof allConfigs === 'object') {
      for (const [moduleName, mod] of Object.entries(allConfigs)) {
        const cfg = mod?.config as any
        const k: unknown = cfg?.navigateKey
        const name: unknown = cfg?.navigateKeyName

        if (typeof k === 'string' && typeof name === 'string') {
          const letter = k.trim().toUpperCase()
          if (/^[A-Z]$/.test(letter) && !seen.has(letter)) {
            seen.add(letter)
            items.push({ key: letter, label: name, path: `/${moduleName}` })
          }
        }
      }
    }

    items.sort((a, b) => a.key.localeCompare(b.key))
    return items
  }, [allConfigs])

  // ROUTES: letters from configs + special "/" for Home
  const ROUTES: RouteMap = useMemo(() => {
    const r: RouteMap = { [HOME_KEY_DISPLAY]: HOME_PATH }
    for (const it of dynamicItems) r[it.key] = it.path
    return r
  }, [dynamicItems])

  // HUD pills: Home first, then the rest
  const hudItems = useMemo(
    () => [{ key: HOME_KEY_DISPLAY, label: 'Home', path: HOME_PATH }, ...dynamicItems],
    [dynamicItems]
  )

  const [armed, setArmed] = useState(false)
  const [visible, setVisible] = useState(false)
  const openedByChordRef = useRef(false)
  const disarmTid = useRef<number | null>(null)

  const hintText = useMemo(() => {
    const letters = Object.keys(ROUTES)
      .sort((a, b) =>
        a === HOME_KEY_DISPLAY ? -1 : b === HOME_KEY_DISPLAY ? 1 : a.localeCompare(b)
      )
      .join(' ')
    return `${STATIC_CHORD_LABEL} then press: ${letters}`
  }, [ROUTES])

  const clearTimer = () => {
    if (disarmTid.current !== null) {
      clearTimeout(disarmTid.current)
      disarmTid.current = null
    }
  }

  const scheduleDisarm = () => {
    clearTimer()
    disarmTid.current = window.setTimeout(() => {
      if (openedByChordRef.current) STATIC_CLOSE_MENU()
      setArmed(false)
      setVisible(false)
      openedByChordRef.current = false
      disarmTid.current = null
    }, STATIC_LINGER_MS) as unknown as number
  }

  const arm = () => {
    clearTimer()
    setArmed(true)
    setVisible(true)
    if (!STATIC_IS_MENU_OPEN()) {
      STATIC_OPEN_MENU()
      openedByChordRef.current = true
    } else {
      openedByChordRef.current = false
    }
  }

  const matchesOpener = (e: KeyboardEvent) =>
    STATIC_CHORD_OPENERS.some((o) => {
      if (o.ctrl && !e.ctrlKey) return false
      if (o.meta && !e.metaKey) return false
      if (!o.ctrl && e.ctrlKey) return false
      if (!o.meta && e.metaKey) return false
      return e.code === o.code
    })

  useEffect(() => {
    if (!STATIC_SHOW) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e)) return

      // Start chord
      if (!armed && matchesOpener(e)) {
        e.preventDefault()
        arm()
        return
      }

      if (!armed) return

      // ESC cancels immediately
      if (e.code === 'Escape') {
        e.preventDefault()
        clearTimer()
        if (openedByChordRef.current) STATIC_CLOSE_MENU()
        setArmed(false)
        setVisible(false)
        openedByChordRef.current = false
        return
      }

      // While ARMED: Home on "/" and letters from configs
      if (e.code === HOME_KEY_CODE) {
        e.preventDefault()
        navigate(HOME_PATH)
        clearTimer()
        if (openedByChordRef.current) STATIC_CLOSE_MENU()
        setArmed(false)
        setVisible(false)
        openedByChordRef.current = false
        return
      }

      const code = e.code || ''
      if (code.startsWith('Key')) {
        const letter = code.replace('Key', '').toUpperCase()
        const path = ROUTES[letter]
        if (path) {
          e.preventDefault()
          navigate(path)
          clearTimer()
          if (openedByChordRef.current) STATIC_CLOSE_MENU()
          setArmed(false)
          setVisible(false)
          openedByChordRef.current = false
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (!armed) return
      // Keep HUD visible as long as Ctrl/Meta is still held.
      const modifiersStillDown = e.ctrlKey || e.metaKey
      if (!modifiersStillDown) {
        scheduleDisarm()
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true } as any)
      window.removeEventListener('keyup', onKeyUp, { capture: true } as any)
      clearTimer()
    }
  }, [armed, navigate, ROUTES])

  if (!STATIC_SHOW) return null

  // Clickable pills
  const handlePillClick = (path: string) => {
    navigate(path)
    clearTimer()
    if (openedByChordRef.current) STATIC_CLOSE_MENU()
    setArmed(false)
    setVisible(false)
    openedByChordRef.current = false
  }

  // Show/hide animation & container sizing (panel narrower)
  const open = visible
  const animStyle: React.CSSProperties = {
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0px) scale(1)' : 'translateY(8px) scale(0.985)',
    transition: 'transform 220ms cubic-bezier(.2,.75,.25,1), opacity 200ms ease',
    willChange: 'transform, opacity',
    maxWidth: 480, // ⬅ smaller panel width
    width: 'calc(100vw - 32px)'
  }

  return createPortal(
    <div
      className="fixed bottom-4 right-4 pointer-events-none"
      style={{ zIndex: visible ? 99999 : -1 }}
      aria-hidden={!open}
    >
      <div
        className="rounded-lg shadow-xl backdrop-blur px-4 py-3 text-white pointer-events-auto"
        style={{
          ...animStyle,
          background: 'linear-gradient(135deg, rgba(17,24,39,.92), rgba(31,41,55,.92))',
          border: '1px solid rgba(255,255,255,.08)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: '#60D394' }}
          />
          <span className="text-xs opacity-80">Side-menu quick switch</span>
        </div>

        <div className="text-xs">
          <div className="mb-1.5 opacity-90">
            <span className="font-semibold">Quick switch</span> — hold{' '}
            <span className="font-semibold">{STATIC_CHORD_LABEL}</span> then press a key, or click a
            pill.
          </div>

          {/* Pills: Home first; text left; hover restored; ellipsis safe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hudItems.map((it) => (
              <button
                key={it.key}
                type="button"
                title={`${it.label} (${it.key})`}
                onClick={() => handlePillClick(it.path)}
                className="
                  group flex items-center justify-start gap-1
                  rounded-md px-3 py-2 text-left
                  border border-white/15 bg-[rgba(255,255,255,.06)]
                  hover:bg-[rgba(255,255,255,.12)] hover:border-white/30
                  transition-transform transition-colors
                  active:translate-y-[1px]
                  focus:outline-none focus:ring-2 focus:ring-white/40
                "
                style={{ minWidth: 220 }}
              >
                <kbd className="rounded px-1.5 shrink-0 bg-white/20 border border-white/30 font-mono">
                  {it.key}
                </kbd>
                <span className="opacity-90 flex-1 min-w-0 truncate text-left">{it.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1 opacity-70">
            <Icon icon="info" size={14} />
            <span>
              Release the keys to cancel, or press <span className="font-semibold">Esc</span>{' '}
              anytime.
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
