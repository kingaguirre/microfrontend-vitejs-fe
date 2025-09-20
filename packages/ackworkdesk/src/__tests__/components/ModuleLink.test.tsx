import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ModuleLink from '@components/ModuleLink'
import moduleConfig from '@components/../module.config.json'

describe('ModuleLink', () => {
  const moduleName = moduleConfig.moduleName

  it('prefixes the `to` prop with a leading slash and module name', () => {
    render(
      <MemoryRouter>
        <ModuleLink to="foo/bar">Go!</ModuleLink>
      </MemoryRouter>
    )

    // should become `/${moduleName}/foo/bar`
    const link = screen.getByRole('link', { name: 'Go!' })
    expect(link).toHaveAttribute('href', `/${moduleName}/foo/bar`)
  })

  it('preserves a leading slash in `to` but still prefixes the module name', () => {
    render(
      <MemoryRouter>
        <ModuleLink to="/baz">Baz!</ModuleLink>
      </MemoryRouter>
    )

    // should become `/${moduleName}/baz`
    const link = screen.getByRole('link', { name: 'Baz!' })
    expect(link).toHaveAttribute('href', `/${moduleName}/baz`)
  })

  it('passes through extra props (e.g. className, aria-label)', () => {
    render(
      <MemoryRouter>
        <ModuleLink to="test" className="my-link" aria-label="Test link">
          Test
        </ModuleLink>
      </MemoryRouter>
    )
    const link = screen.getByLabelText('Test link')
    expect(link).toHaveClass('my-link')
    expect(link).toHaveTextContent('Test')
  })
})
