// packages/app-shell/src/Offline.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'react-components-lib.eaa'

const OFFLINE_MESSAGES = [
  'Looks like you’re off the grid right now.',
  'Can’t connect to the internet—please check your network.',
  'No connection detected. Let’s get you back online.',
  'You appear to be offline. Hang tight!',
  'Internet is taking a break. We’ll wait with you.',
  'The digital world hit pause—grab a coffee while we reconnect.',
  'Your Wi-Fi’s on vacation. We’ll ping you when it’s back.',
  'This page took an early break. We’ll bring it back ASAP.',
  'Signal lost—time for a stretch.',
  'Offline mode: activated.',
  'No bars, no problem—let’s get you back.',
  'Is airplane mode on? We’re not judging.',
  'Your router is on its lunch break.',
  'This content is hiding—like a ninja.',
  'Data packets are on holiday.',
  'Network ghosted us.',
  'Connection snoozed—wake it up soon.',
  'We’re in offline limbo.',
  'Hang tight—we’ll reconnect you soon.',
  'This page needs a better signal.'
]

export default function Offline() {
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  const shellOverflowRef = useRef<string>('')
  const [inShell, setInShell] = useState(false)
  const message = useRef(
    OFFLINE_MESSAGES[Math.floor(Math.random() * OFFLINE_MESSAGES.length)]
  ).current

  // hide the shell’s scrollbar exactly like your 404 page
  useEffect(() => {
    const shell = document.querySelector('.app-shell-main-content') as HTMLElement | null
    if (shell) {
      setInShell(true)
      shellOverflowRef.current = shell.style.overflow
      shell.style.overflow = 'hidden'
    }
    return () => {
      if (shell) shell.style.overflow = shellOverflowRef.current
    }
  }, [])

  // keep full‐height on resize
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div
      style={{ height: `${height}px` }}
      className={`relative flex items-center justify-center bg-gray-50 p-6 overflow-hidden ${
        inShell ? '-m-4' : ''
      }`}
    >
      {/* re-use your abstract shapes */}
      <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-200 rounded-full opacity-30 transform rotate-45" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-200 rounded-full opacity-30 transform rotate-12" />
      <div className="absolute top-1/2 -right-32 w-40 h-40 bg-green-200 rounded-full opacity-25 transform rotate-90" />
      <div className="absolute bottom-1/3 -left-32 w-44 h-44 bg-pink-200 rounded-full opacity-25 transform rotate-180" />

      <div className="relative max-w-md w-full p-10 rounded-2xl text-center">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">📡</h1>
        <p className="text-2xl text-gray-700 mb-2">You’re Offline</p>
        <p className="text-sm text-gray-500 italic mb-4">“{message}”</p>
        <p className="text-xs text-gray-400 mb-2">
          We’ll keep retrying in the background—no need to refresh.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          If you’re still seeing this after a minute, check your router or VPN.
        </p>
        <Button onClick={() => window.location.reload()} className="px-8 py-3">
          Retry Now
        </Button>
      </div>
    </div>
  )
}
