// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'
import { Button, Icon } from 'react-components-lib.eaa'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode }
interface State {
  hasError: boolean
  error: Error | null
  componentStack: string
}

const TAKEAWAYS = [
  'Well, this is awkward—reload or return home, and we’ll pick up right where we left off.',
  'Looks like the page took a coffee break; hit reload or head home to get things brewing again.',
  'Our wires got crossed—refresh or go home and let’s straighten them out together.',
  'Something tripped us up—reload the page or return home to get back in business.',
  'We hit a little bump—feel free to reload or go home and we’ll smooth things over.',
  'Whoops, that didn’t go as planned—reload or head back home to continue smoothly.',
  'This page stumbled—refresh here or go home, and we’ll get you back on your way.',
  'Our apologies—this page lost its footing. Reload or return home to regain balance.',
  'That went sideways—reload or head home, and we’ll steer you back on course.',
  'Our bad! Reload or click home, and let’s resume without the hiccups.',
  'Well, that was unexpected—hit reload or return home to keep moving forward.',
  'This page took a detour—refresh or go home and we’ll guide you back on track.',
  'It seems we hit a snag—reload or return home and let’s get you up and running.',
  'Oops, we lost the plot—reload or head home to continue the story.',
  'This page hit a snag—refresh or click home to glide past the glitch.',
  'We encountered turbulence—hit reload or return home for a smooth landing.',
  'Looks like the gremlins struck—reload or go home and we’ll shoo them away.',
  'This page went off-script—refresh or return home to get back in the show.',
  'Our circuit fizzled—reload or head home and we’ll restore the power.',
  'We just had a hiccup—reload the page or return home to settle things down.'
]

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, componentStack: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, info: React.ErrorInfo) {
    // Keep component stack for "Copy details"; do NOT log anything (console stays clean).
    this.setState({ componentStack: info?.componentStack || '' })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  handleCopy = () => {
    const e = this.state.error
    const details = [
      e?.name ? `Name: ${e.name}` : '',
      e?.message ? `Message: ${e.message}` : '',
      e?.stack ? `Stack:\n${e.stack}` : '',
      this.state.componentStack ? `Component stack:\n${this.state.componentStack}` : ''
    ].filter(Boolean).join('\n\n')

    navigator?.clipboard?.writeText?.(details).catch(() => {})
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const e = this.state.error
    const randomTakeaway = TAKEAWAYS[Math.floor(Math.random() * TAKEAWAYS.length)]
    const when = new Date().toLocaleString()
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'

    return (
      <div className="container mx-auto bg-red-50 border-2 border-red-500 shadow-lg rounded-lg p-6 my-4 space-y-4">
        <h2 className="text-xl font-semibold text-red-800 flex items-center gap-2">
          <Icon icon="error" /> Oops! Something went wrong.
        </h2>

        {/* Message */}
        <div className="relative bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
          <button
            onClick={this.handleCopy}
            title="Copy error details"
            className="absolute top-2 right-2 p-1 hover:bg-red-200 rounded"
          >
            <Icon icon="file_copy" size="sm" />
          </button>
          <div className="overflow-x-auto p-4 font-mono whitespace-pre-wrap break-words">
            <pre className="m-0">{e?.message || 'An unexpected error occurred.'}</pre>
          </div>
        </div>

        {/* Diagnostics chips */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs text-red-800">
            <Icon icon="access_time" size="sm" /> {when}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs text-red-800">
            <Icon icon="link" size="sm" /> {path}
          </span>
          {e?.name && (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs text-red-800">
              <Icon icon="bug_report" size="sm" /> {e.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={this.handleReload} className="w-full sm:w-auto">
            <Icon icon="refresh" /> Try again
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="link" className="w-full sm:w-auto">
              <Icon icon="home" /> Return Home
            </Button>
          </Link>
        </div>

        {/* Prominent developer note (no invalid nesting) */}
        <div className="rounded-lg border border-red-400 bg-white px-4 py-3 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-800">
            <Icon icon="computer" />
            <span className="underline underline-offset-4">
              Developer note: full stack trace is available in the browser console
            </span>
          </div>
        </div>

        {/* Footer text only */}
        <p className="text-center text-xs italic text-gray-700">
          {randomTakeaway}
        </p>
      </div>
    )
  }
}
