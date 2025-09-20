import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Home from '../../pages/index'

// Mock out the real demo components so we can assert they render
vi.mock('@components/demo/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  )
}))
vi.mock('@components/demo/About', () => ({
  default: () => <div data-testid="about-page">About Page</div>
}))

describe('Home Page', () => {
  it('renders the Layout wrapper and the AboutPage inside it', () => {
    render(<Home />)
    // Layout wrapper should be in the document
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    // AboutPage should render inside Layout
    expect(screen.getByTestId('about-page')).toBeInTheDocument()
  })
})
