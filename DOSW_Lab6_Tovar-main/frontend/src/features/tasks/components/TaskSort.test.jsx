import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskSort from './TaskSort'

const sort = { sort: 'createdAt', direction: 'desc' }

describe('TaskSort', () => {
  it('shows the current sort field and direction', () => {
    render(<TaskSort sort={sort} onChange={vi.fn()} />)

    expect(screen.getByLabelText('Sort by')).toHaveValue('createdAt')
    expect(screen.getByLabelText('Direction')).toHaveValue('desc')
  })

  it('reports a changed sort field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TaskSort sort={sort} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText('Sort by'), 'priority')

    expect(onChange).toHaveBeenCalledWith({ sort: 'priority', direction: 'desc' })
  })

  it('reports a changed direction', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TaskSort sort={sort} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText('Direction'), 'asc')

    expect(onChange).toHaveBeenCalledWith({ sort: 'createdAt', direction: 'asc' })
  })
})
