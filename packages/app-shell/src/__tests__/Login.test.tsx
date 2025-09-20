import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Login from '../Login'

describe('Login component', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    ;(global.fetch as unknown as ReturnType<typeof vi.spyOn>).mockRestore()
  })

  it('calls onLogin with token on successful login', async () => {
    const fakeToken = 'abcdef'
    ;(global.fetch as unknown as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ token: fakeToken })
    })
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(fakeToken)
    })
    expect(screen.queryByText(/Login Error/i)).toBeNull()
  })

  it('shows error alert on failed login', async () => {
    const errorMsg = 'user not found'
    ;(global.fetch as unknown as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ error: errorMsg })
    })
    render(<Login onLogin={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    const alert = await screen.findByText(errorMsg)
    expect(alert).toBeInTheDocument()
  })
})
