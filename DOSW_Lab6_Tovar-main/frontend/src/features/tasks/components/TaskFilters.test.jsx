import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFilters from './TaskFilters'

const emptyFilters = { status: '', priority: '', q: '' }

describe('TaskFilters', () => {
  it('renders the filter controls', () => {
    render(<TaskFilters filters={emptyFilters} onChange={vi.fn()} onClear={vi.fn()} />)

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('reports a changed status', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TaskFilters filters={emptyFilters} onChange={onChange} onClear={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'COMPLETED')

    expect(onChange).toHaveBeenCalledWith({ status: 'COMPLETED', priority: '', q: '' })
  })

  it('reports typed search text', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TaskFilters filters={emptyFilters} onChange={onChange} onClear={vi.fn()} />)

    await user.type(screen.getByLabelText('Search'), 'a')

    expect(onChange).toHaveBeenCalledWith({ status: '', priority: '', q: 'a' })
  })

  it('calls onClear when Clear is pressed', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<TaskFilters filters={emptyFilters} onChange={vi.fn()} onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onClear).toHaveBeenCalled()
  })
})
