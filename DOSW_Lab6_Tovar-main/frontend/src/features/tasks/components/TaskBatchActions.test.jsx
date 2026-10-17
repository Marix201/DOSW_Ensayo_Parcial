import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskBatchActions from './TaskBatchActions'

function renderActions(props = {}) {
  const handlers = {
    onSelectAll: vi.fn(),
    onDeleteSelected: vi.fn(),
    onCompleteSelected: vi.fn(),
    onClearCompleted: vi.fn(),
  }
  render(<TaskBatchActions selectedCount={0} visibleCount={2} {...handlers} {...props} />)
  return handlers
}

describe('TaskBatchActions', () => {
  it('disables the selection actions when nothing is selected', () => {
    renderActions()

    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Complete selected' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })

  it('calls the handlers when tasks are selected', async () => {
    const user = userEvent.setup()
    const handlers = renderActions({ selectedCount: 2 })

    await user.click(screen.getByRole('button', { name: 'Delete selected' }))
    await user.click(screen.getByRole('button', { name: 'Complete selected' }))
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))

    expect(handlers.onDeleteSelected).toHaveBeenCalled()
    expect(handlers.onCompleteSelected).toHaveBeenCalled()
    expect(handlers.onClearCompleted).toHaveBeenCalled()
    expect(screen.getByLabelText('Select all')).toBeChecked()
  })

  it('reports select all changes', async () => {
    const user = userEvent.setup()
    const handlers = renderActions()

    await user.click(screen.getByLabelText('Select all'))

    expect(handlers.onSelectAll).toHaveBeenCalledWith(true)
  })
})
