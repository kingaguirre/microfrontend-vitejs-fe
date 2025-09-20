// src/components/RouteLoader.tsx
import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader } from 'react-components-lib.eaa'

export function RouteLoader() {
  const { pathname } = useLocation()

  // remember which paths we've fully loaded
  const loadedPaths = useRef<Set<string>>(new Set())

  // visible & progress state
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  // interval ID ref
  const intervalRef = useRef<number>(null)

  // 1) on path change: if unseen, start loading bar
  useEffect(() => {
    if (loadedPaths.current.has(pathname)) {
      // already loaded before → no loader
      setVisible(false)
      setProgress(100)
      return
    }

    // new page: show bar, reset to 0
    setVisible(true)
    setProgress(0)
    // slowly trickle up to 80%
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 80))
    }, 200)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [pathname])

  // 2) when the page actually mounts, complete the bar
  //    we wait for a microtick so child renders first
  useEffect(() => {
    if (!visible) return
    // delay ensures the new content has a chance to paint
    const doneTimer = window.setTimeout(() => {
      // finish bar
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      setProgress(100)
      // hide after a brief moment
      window.setTimeout(() => setVisible(false), 200)
      // mark this path as “loaded”
      loadedPaths.current.add(pathname)
    }, 50)

    return () => window.clearTimeout(doneTimer)
  }, [pathname, visible])

  // render nothing if not visible
  if (!visible) return null

  // position absolutely at top—adjust as needed
  return <Loader type="line" value={progress} appendTo=".app-shell-main-content" />
}
