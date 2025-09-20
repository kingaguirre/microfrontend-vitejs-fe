import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import QueryHome from '../../pages/index'

// Mock ModuleLink so we can inspect the `to` props without worrying about routing prefixes
vi.mock('@components/ModuleLink', () => ({
  default: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a data-testid="module-link" href={to}>
      {children}
    </a>
  )
}))

// Mock Card to expose its `title` prop
vi.mock('@components/demo/Card', () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <div data-testid="card-title">{title}</div>
      {children}
    </div>
  )
}))

// Mock StateViewer to make it easy to assert its presence
vi.mock('@components/demo/StateViewer', () => ({
  StateViewer: () => <div data-testid="state-viewer">StateViewer</div>,
  __esModule: true
}))

describe('QueryHome page', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <QueryHome />
      </MemoryRouter>
    )
  })

  it('renders the breadcrumb Home link', () => {
    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders the Card with title "Query Module"', () => {
    expect(screen.getByTestId('card-title')).toHaveTextContent('Query Module')
  })

  it('renders the StateViewer component', () => {
    expect(screen.getByTestId('state-viewer')).toBeInTheDocument()
  })

  it('renders two ModuleLink instances with correct `to` props', () => {
    const links = screen.getAllByTestId('module-link')
    expect(links).toHaveLength(2)

    // first link goes to GraphQL demo
    expect(links[0]).toHaveAttribute('href', '/graphql-demo')
    // second link goes to React Query demo
    expect(links[1]).toHaveAttribute('href', '/tanstack-react-query-demo')
  })
})
