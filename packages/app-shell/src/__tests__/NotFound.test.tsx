import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NotFound from '../NotFound'

// Mock the navigate function from react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

describe('NotFound component', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    // Ensure a consistent window.innerHeight for snapshot stability
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  })

  it('renders the 404 heading and page title', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument()
  })

  it('displays a random quip in quotes', () => {
    render(<NotFound />)
    const quipEl = screen.getByText((content) => /^“.*”$/.test(content))
    expect(quipEl).toBeInTheDocument()
  })

  it('calls navigate to home when the button is clicked', () => {
    render(<NotFound />)
    fireEvent.click(screen.getByRole('button', { name: /Return Home/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
