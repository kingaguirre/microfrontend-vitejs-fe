// packages/app-shell/src/hooks/useSideMenuChord.ts
import { useEffect, useMemo, useRef, useState } from 'react'

/** A single keyboard chord to arm the side-menu selector */
export type OpenerChord = {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  /**
   * Command/Cmd key (macOS). Default is `false` so we *avoid*
   * colliding with OS shortcuts. Set to true only if you really want it.
   */
  meta?: boolean
  /** Use KeyboardEvent.code (e.g. "Period", "Semicolon", "Slash", "KeyK") */
  code: KeyboardEvent['code']
}

export type SideMenuRoutes = {
  /** Acknowledgment Work Desk */
  a?: string
  /** Transaction Work Desk */
  t?: string
  /** Txn Enquiry */
  e?: string
  /** Setup */
  s?: string
  /** Home (or anything you like) */
  h?: string
}

type Options = {
  /** Open the side menu (called when the opener chord is pressed) */
  openMenu: () => void
  /** Close the side menu (usually on disarm) */
  closeMenu: () => void
  /** Whether the menu is currently open */
  isMenuOpen: boolean
  /** Navigate helper (react-router navigate or your own) */
  navigate: (path: string) => void

  /**
   * Which chord(s) arm the quick selector.
   * Default: Ctrl+Shift+Period (safer on macOS; avoids Spelling & Grammar Cmd+Shift+;)
   */
  openers?: OpenerChord[]

  /**
   * Letter -> route mapping while armed and the modifiers remain held.
   * Defaults shown below; override as you wish.
   */
  routes?: SideMenuRoutes

  /**
   * If true, releasing any required modifier (Ctrl/Shift/Meta/Alt)
   * disarms and (optionally) closes the menu. Default true.
   */
  autoCloseOnDisarm?: boolean

  /** When autoCloseOnDisarm triggers, also close the menu. Default true. */
  closeMenuOnDisarm?: boolean
}

const DEFAULT_OPENERS: OpenerChord[] = [
  // Ctrl+Shift+Period
  { ctrl: true, shift: true, meta: false, code: 'Period' }
]

const DEFAULT_ROUTES: Required<SideMenuRoutes> = {
  a: '/ackworkdesk',
  t: '/txnworkdesk',
  e: '/txnenquiry',
  s: '/setup',
  h: '/'
}

function eqBool(a?: boolean, b?: boolean) {
  return !!a === !!b
}

export function useSideMenuChord({
  openMenu,
  closeMenu,
  isMenuOpen,
  navigate,
  openers = DEFAULT_OPENERS,
  routes = DEFAULT_ROUTES,
  autoCloseOnDisarm = true,
  closeMenuOnDisarm = true
}: Options) {
  const [isArmed, setIsArmed] = useState(false)

  // Keep the latest options in refs for stable event handlers
  const isArmedRef = useRef(isArmed)
  const isMenuOpenRef = useRef(isMenuOpen)
  const routesRef = useRef(routes)
  const openersRef = useRef(openers)

  useEffect(() => {
    isArmedRef.current = isArmed
  }, [isArmed])

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen
  }, [isMenuOpen])

  useEffect(() => {
    routesRef.current = routes
  }, [routes])

  useEffect(() => {
    openersRef.current = openers
  }, [openers])

  const openerMatch = useMemo(() => {
    return (e: KeyboardEvent) =>
      openersRef.current.some(
        (o) =>
          eqBool(o.ctrl, e.ctrlKey) &&
          eqBool(o.shift, e.shiftKey) &&
          eqBool(o.alt, e.altKey) &&
          eqBool(o.meta, e.metaKey) &&
          e.code === o.code
      )
  }, [])

  // Helper: are all required modifiers still held while armed?
  const modifiersHeld = (e: KeyboardEvent) => {
    // Use the *first* opener as the canonical set of required modifiers.
    // If you want per-opener behavior, you can expand this logic.
    const o = openersRef.current[0] || {}
    return (
      eqBool(o.ctrl, e.ctrlKey) &&
      eqBool(o.shift, e.shiftKey) &&
      eqBool(o.alt, e.altKey) &&
      eqBool(o.meta, e.metaKey)
    )
  }

  // Normalize letter key from KeyboardEvent (KeyA -> 'a', etc.)
  const letterFromCode = (code: string): string | null => {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase()
    return null
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 1) Arm with the opener chord
      if (openerMatch(e)) {
        e.preventDefault()
        e.stopPropagation()

        if (!isMenuOpenRef.current) openMenu()
        setIsArmed(true)
        return
      }

      // 2) If armed, and modifiers are still held, allow quick selection by letter
      if (isArmedRef.current && modifiersHeld(e)) {
        const letter = letterFromCode(e.code)
        if (!letter) return

        const r = routesRef.current
        const map: Record<string, string | undefined> = {
          a: r.a,
          t: r.t,
          e: r.e,
          s: r.s,
          h: r.h
        }

        const target = map[letter]
        if (target) {
          e.preventDefault()
          e.stopPropagation()
          navigate(target)
          // Optional: disarm after a successful jump
          setIsArmed(false)
          if (closeMenuOnDisarm) closeMenu()
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      // If we’re armed and the user released any required modifier, disarm
      if (isArmedRef.current && autoCloseOnDisarm && !modifiersHeld(e)) {
        setIsArmed(false)
        if (closeMenuOnDisarm) closeMenu()
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true } as any)
      window.removeEventListener('keyup', onKeyUp, { capture: true } as any)
    }
  }, [openMenu, closeMenu, navigate, openerMatch, autoCloseOnDisarm, closeMenuOnDisarm])

  return { isArmed }
}

export default useSideMenuChord
