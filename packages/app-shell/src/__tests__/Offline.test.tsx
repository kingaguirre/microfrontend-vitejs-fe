import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Offline from '../Offline'

let reloadMock: ReturnType<typeof vi.fn>

describe('Offline component', () => {
  beforeEach(() => {
    // Mock window.innerHeight for consistent styling tests
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })

    // Mock window.location.reload by redefining location entirely
    reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock }
    })
  })

  it('renders the offline icon and title', () => {
    render(<Offline />)
    expect(screen.getByText('📡')).toBeInTheDocument()
    expect(screen.getByText(/You’re Offline/i)).toBeInTheDocument()
  })

  it('displays a random offline message in quotes', () => {
    render(<Offline />)
    const msgEl = screen.getByText((content) => /^“.*”$/.test(content))
    expect(msgEl).toBeInTheDocument()
  })

  it('shows retry instructions', () => {
    render(<Offline />)
    expect(screen.getByText(/We’ll keep retrying in the background/)).toBeInTheDocument()
    expect(screen.getByText(/If you’re still seeing this after a minute/)).toBeInTheDocument()
  })

  it('calls window.location.reload when Retry Now is clicked', () => {
    render(<Offline />)
    fireEvent.click(screen.getByRole('button', { name: /Retry Now/i }))
    expect(reloadMock).toHaveBeenCalled()
  })
})
