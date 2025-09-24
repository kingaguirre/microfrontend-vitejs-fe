// packages/app-shell/src/component/AppShell.tsx
import { useState, useEffect, Suspense, useRef, useLayoutEffect, useMemo } from 'react'
import { useNavigate, useLocation, useOutlet } from 'react-router-dom'
import { AppShell, Loader } from 'react-components-lib.eaa'
import { NOTIFICATIONS, STATIC_SUB_MENUS } from './data'
import { ErrorBoundary } from './ErrorBoundary'
import {
  TranslationProvider,
  usePageStore,
  useSubMenuStore,
  useAlertStore,
  useAllMergedConfigs,
  registerCurrentModule
} from '@app/common'
import './shell.css'
import { RouteLoader } from './RouteLoader'
import Offline from '../Offline'
import { AlertContainer } from './AlertContainer'

const DEFAULT_APP_TITLE = 'TradeXpress'

export default function Shell({
  menuItems,
  onLogout
}: {
  menuItems?: { title: string; path: string }[]
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  // All module configs (e.g., { setup: { config: { menuIcon: '...' } }, ... })
  const allConfigs = useAllMergedConfigs() as Record<
    string,
    { config?: { menuIcon?: string } } | undefined
  >

  // ✅ get all page titles from store (reactive)
  const pageTitlesMap: any = usePageStore((s: any) => s.pageTitles)

  // 1️⃣ initial load flag: show <Offline/> only if they loaded the page offline
  const [initialOnline, setInitialOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  // 2️⃣ dynamic online state for alerts only
  const [isOnline, setIsOnline] = useState(initialOnline)

  // listen to browser events
  useEffect(() => {
    const goOffline = () => setIsOnline(false)
    const goOnline = () => {
      setIsOnline(true)
      // if we started in offline mode, flip back to “online”-render and re-mount AppShell
      if (!initialOnline) {
        setInitialOnline(true)
        // re‐navigate to the current URL to re-instantiate the shell
        navigate(window.location.pathname + window.location.search, { replace: true })
      }
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  // only fire alerts on actual transitions (not on mount)
  const prevOnlineRef = useRef(isOnline)
  useEffect(() => {
    // skip effect on initial render
    if (prevOnlineRef.current === isOnline) {
      prevOnlineRef.current = isOnline
      return
    }

    if (!isOnline) {
      // you went offline
      useAlertStore.setAlert({
        title: 'No Connection',
        content: 'You’ve lost internet access. Some features may not work until you reconnect.',
        color: 'danger',
        icon: 'wifi_off',
        placement: 'bottom-right',
        closeDelay: 10000
      })
    } else {
      // you came back online
      useAlertStore.setAlert({
        title: 'Back Online',
        content: 'You’ve reconnected to the internet. All features are now available.',
        color: 'success',
        icon: 'wifi',
        placement: 'bottom-right',
        closeDelay: 5000
      })
    }

    prevOnlineRef.current = isOnline
  }, [isOnline])

  // derive modulePath & URL-driven title
  const segments = pathname.replace(/^\/|\/$/g, '').split('/')
  const modulePath = segments[0]
  const currentMenuItem = menuItems?.find((m) => m.path === modulePath)
  const urlTitle = currentMenuItem?.title ?? DEFAULT_APP_TITLE
  const urlName = ''

  // read pageTitle / pageName for this modulePath (falls back to URL values)
  const pageTitle = usePageStore((s: any) => s.pageTitles[modulePath] ?? urlTitle)
  const pageName = usePageStore((s: any) => s.pageNames[modulePath] ?? urlName)

  const setPageName: any = usePageStore((s: any) => s.setPageName)
  const setPageTitle: any = usePageStore((s: any) => s.setPageTitle)

  // keep store in sync whenever the URL-derived title/name change
  useEffect(() => {
    setPageName(modulePath, pageName)
    setPageTitle(modulePath, pageTitle)
  }, [modulePath, pageName, pageTitle, setPageName, setPageTitle])

  // 🟢 Make current module available to MFEs BEFORE children mount/fetch
  useLayoutEffect(() => {
    if (!modulePath) return
    registerCurrentModule(modulePath)
  }, [modulePath])

  useEffect(() => {
    document.title = `${pageTitle}${pageName ? ` - ${pageName}` : ''}`
  }, [pageTitle, pageName])

  const highlightMapRef = useRef<WeakMap<HTMLElement, string[]>>(new WeakMap())
  const prevElRef = useRef<HTMLElement | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const DEFAULT_HIGHLIGHT =
    'rounded ring-2 ring-blue-500 shadow-[0_0_12px_4px_rgba(59,130,246,0.6)]'

  useLayoutEffect(() => {
    const params = new URLSearchParams(search)
    const scrollId = params.get('scroll')
    if (!scrollId) return

    const container = document.querySelector<HTMLElement>('.app-shell-main-content')
    if (!container) return

    let observer: MutationObserver | null = null

    const clearHighlight = (el: HTMLElement) => {
      const added = highlightMapRef.current.get(el) || []
      el.classList.remove(...added)
      highlightMapRef.current.delete(el)
    }

    // enhanced scroll+highlight logic with offset control
    const runScroll = (el: HTMLElement) => {
      if (prevElRef.current && prevElRef.current !== el) {
        clearHighlight(prevElRef.current)
      }
      clearHighlight(el)

      // determine offset from top (data-scroll-offset on element)
      const offsetAttr = el.dataset.scrollOffset
      const scrollOffset = offsetAttr ? parseInt(offsetAttr, 10) : 0

      // dimensions
      const elemHeight = el.offsetHeight
      const contHeight = container.clientHeight

      // scroll: if element taller than container, align top; else center with offset
      if (elemHeight > contHeight) {
        container.scrollTo({ top: el.offsetTop - scrollOffset, behavior: 'smooth' })
      } else {
        const centeredTop = el.offsetTop - scrollOffset - (contHeight - elemHeight) / 2
        container.scrollTo({ top: centeredTop, behavior: 'smooth' })
      }

      // apply highlight classes
      const raw = el.dataset.highlightClass
      const disabled = raw === 'none'
      const classesArr = raw && raw !== 'none' ? raw.split(/\s+/) : DEFAULT_HIGHLIGHT.split(/\s+/)

      if (!disabled) {
        const toAdd = classesArr.filter((c) => !el.classList.contains(c))
        el.classList.add(...toAdd)
        highlightMapRef.current.set(el, toAdd)
        prevElRef.current = el
      }

      // cleanup & strip URL
      timeoutRef.current = window.setTimeout(() => {
        if (new URLSearchParams(window.location.search).has('scroll')) {
          if (!disabled) clearHighlight(el)
          prevElRef.current = null
          params.delete('scroll')
          navigate({ search: params.toString() }, { replace: true })
        }
      }, 3000)
    }

    const immediate = container.querySelector<HTMLElement>(`[data-scroll-to-view="${scrollId}"]`)
    if (immediate) {
      runScroll(immediate)
    } else {
      observer = new MutationObserver(() => {
        const el = container.querySelector<HTMLElement>(`[data-scroll-to-view="${scrollId}"]`)
        if (el) {
          runScroll(el)
          observer?.disconnect()
        }
      })
      observer.observe(container, { childList: true, subtree: true })
    }

    return () => {
      observer?.disconnect()
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [pathname, search, navigate])

  useLayoutEffect(() => {
    if (new URLSearchParams(search).has('scroll')) return
    requestAnimationFrame(() => {
      const container = document.querySelector<HTMLElement>('.app-shell-main-content')
      container?.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [pathname])

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('.app-shell-main-content')
    if (!container) return

    const onClick = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null
      // bubble up from the clicked node to see if any ancestor has data-scroll-to-top
      while (el && el !== container) {
        if (el.hasAttribute('data-scroll-to-top')) {
          container.scrollTo({ top: 0, behavior: 'smooth' })
          break
        }
        el = el.parentElement
      }
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  // Main menu icon mapping
  const getIcon = (path: string) => {
    const cfgIcon = allConfigs?.[path]?.config?.menuIcon
    if (cfgIcon && typeof cfgIcon === 'string' && cfgIcon.trim()) return cfgIcon
    switch (path) {
      case 'query':
        return 'cloud_queue'
      case 'toolkit':
        return 'logo-icon'
      default:
        return 'star_rate'
    }
  }

  // read dynamic subMenus from Zustand store
  const dynamicSubMenus = useSubMenuStore((s: any) => s.subMenus)

  /**
   * Merge dynamic and static sub-menus based on menu id
   */
  const buildSideMenuItems = (staticSubMenus?: any[]) => {
    return (
      menuItems?.map((m) => {
        const resolvedTitle = pageTitlesMap?.[m.path] ?? m.title

        // base menu item
        const base = {
          id: m.path,
          icon: getIcon(m.path),
          title: resolvedTitle,
          onClick: () => navigate(`/${m.path}`, { replace: true })
        }
        // get dynamic children if any
        const dynChildren = dynamicSubMenus[m.path] || []
        // find static injection for this menu
        const staticEntry = staticSubMenus?.find((s: any) => s.menu === m.path)
        const staticChildren = staticEntry
          ? staticEntry.subMenu.map((sm: any) => ({
              ...sm,
              onClick: () => sm.onClick(navigate)
            }))
          : []
        // combine: static first, then dynamic
        const children = [...staticChildren, ...dynChildren]
        return children.length > 0 ? { ...base, children } : base
      }) || []
    )
  }

  const sideMenuItems = useMemo(
    () => buildSideMenuItems(STATIC_SUB_MENUS),
    [menuItems, pageTitlesMap, dynamicSubMenus]
  )

  return (
    <TranslationProvider>
      <AppShell
        autoHideHeader={false}
        showMenu={false}
        collapsedMenu={false}
        activeMenu={modulePath}
        sideMenuItems={sideMenuItems}
        pageTitle={pageTitle as any}
        pageName={pageName as any}
        showFooter={false}
        onClickLogo={() => navigate('/', { replace: true })}
        rightIcons={[
          {
            icon: 'logout',
            onClick: handleLogout,
            color: 'primary',
            colorShade: 'darker',
            leftDivider: true,
            text: 'Logout'
          }
        ]}
        profile={{
          name: 'Emmanuel Aguirre',
          userId: '1616610',
          lastLoginTime: '2024-02-20T10:25:24',
          lastProfileUpdate: '10-05-2024',
          dropdownCustomContent: (
            <div style={{ backgroundColor: '#fff' }}>
              <h4>Custom Content</h4>
              <p>This content is fully customizable!</p>
            </div>
          )
        }}
        notifications={{
          notifications: NOTIFICATIONS as any,
          totalNewNotifications: 3,
          onShowAllClick: () => alert('Show all notifications clicked')
        }}
      >
        {/* mount the central AlertContainer */}
        <AlertContainer />

        {initialOnline ? (
          <>
            <RouteLoader />
            <ErrorBoundary>
              <Suspense
                fallback={
                  <Loader size="md" appendTo=".app-shell-main-content" label="Loading page..." />
                }
              >
                <AnimatedContent />
              </Suspense>
            </ErrorBoundary>
          </>
        ) : (
          <Offline />
        )}
      </AppShell>
    </TranslationProvider>
  )
}

function AnimatedContent() {
  const outlet = useOutlet()
  const { pathname } = useLocation()

  // Keep track of what path we last animated on
  const prevPathname = useRef(pathname)

  // What’s currently rendered
  const [content, setContent] = useState<React.ReactNode>(outlet)
  // Which CSS phase we’re in
  const [phase, setPhase] = useState<'fade-in' | 'fade-out'>('fade-in')

  // Only when the *path* changes (not search!), kick off fade-out
  useEffect(() => {
    if (pathname === prevPathname.current) {
      return
    }
    prevPathname.current = pathname
    setPhase('fade-out')
  }, [pathname])

  // After fade-out, swap the content and fade back in
  useEffect(() => {
    if (phase !== 'fade-out') {
      return
    }
    const tid = window.setTimeout(() => {
      setContent(outlet)
      setPhase('fade-in')
    }, 100) // match your CSS transition-duration
    return () => clearTimeout(tid)
  }, [phase, outlet])

  return <div className={`content-wrapper ${phase}`}>{content}</div>
}
