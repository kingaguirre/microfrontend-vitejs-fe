// packages/app-shell/src/NotFound.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-components-lib.eaa'

const QUIPS = [
  'It seems this page took an unexpected detour.',
  'This resource has wandered off—apologies for the inconvenience.',
  'We can’t locate what you’re looking for right now.',
  'It appears this page is missing in action.',
  'This content is currently unavailable. Let’s get you back on track.',
  'Our apologies—this page has slipped through the cracks.',
  'The page you seek has momentarily vanished.',
  'Looks like this URL went on vacation.',
  'We’re experiencing a brief hiccup finding that page.',
  'This section seems to be on an unscheduled break.',
  'Oops—this content missed its stop.',
  'That page took a wrong turn somewhere.',
  'Our compass can’t point us to this location.',
  'This page wandered off into the digital wilderness.',
  'We can’t map this destination right now.',
  'That content has slipped out of view.',
  'Currently, there’s nothing to display here.',
  'This route appears to be under construction.',
  'We’re having trouble fetching that page.',
  'That page is off the grid—let’s steer you home.'
]

export default function NotFound() {
  const navigate = useNavigate()
  const quip = useMemo(() => QUIPS[Math.floor(Math.random() * QUIPS.length)], [])

  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  const shellOverflowRef = useRef<string>('')
  const [inShell, setInShell] = useState(false)

  useEffect(() => {
    // Hide scroll on app shell container if present
    const shell = document.querySelector('.app-shell-main-content') as HTMLElement | null
    if (shell) {
      setInShell(true)
      shellOverflowRef.current = shell.style.overflow
      shell.style.overflow = 'hidden'
    }
    return () => {
      if (shell) {
        shell.style.overflow = shellOverflowRef.current
      }
    }
  }, [])

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      style={{ height: `${height}px` }}
      className={`relative flex items-center justify-center bg-white p-6 overflow-hidden ${inShell ? '-m-4' : ''}`}
    >
      {/* Decorative abstract shapes */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-200 rounded-full opacity-30 transform rotate-45" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-200 rounded-full opacity-30 transform rotate-12" />
      <div className="absolute top-1/2 -right-32 w-40 h-40 bg-green-200 rounded-full opacity-25 transform rotate-90" />
      <div className="absolute bottom-1/3 -left-32 w-44 h-44 bg-pink-200 rounded-full opacity-25 transform rotate-180" />

      <div className="relative max-w-md w-full p-10 rounded-2xl text-center">
        <h1 className="text-7xl font-extrabold text-gray-800 mb-4 animate-pulse">404</h1>
        <p className="text-2xl text-gray-700 mb-2">Page Not Found</p>
        <p className="text-sm text-gray-500 italic mb-8">“{quip}”</p>
        <Button onClick={() => navigate('/')} className="px-8 py-3">
          Return Home
        </Button>
      </div>
    </div>
  )
}
