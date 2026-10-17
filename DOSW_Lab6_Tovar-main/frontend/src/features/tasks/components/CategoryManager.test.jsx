import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryManager from './CategoryManager'

const categories = [
  { id: 1, name: 'Home' },
  { id: 2, name: 'Work' },
]

describe('CategoryManager', () => {
  it('lists the categories', () => {
    render(<CategoryManager categories={categories} onAdd={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('shows an empty message when there are no categories', () => {
    render(<CategoryManager categories={[]} onAdd={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('No categories yet.')).toBeInTheDocument()
  })

  it('adds a category with the typed name', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<CategoryManager categories={[]} onAdd={onAdd} onDelete={vi.fn()} />)

    await user.type(screen.getByLabelText('Category name'), 'Study')
    await user.click(screen.getByRole('button', { name: 'Add category' }))

    expect(onAdd).toHaveBeenCalledWith('Study')
  })

  it('shows a validation error and does not add an empty name', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<CategoryManager categories={[]} onAdd={onAdd} onDelete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Add category' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Category name is required')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('deletes a category by id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<CategoryManager categories={categories} onAdd={vi.fn()} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Delete category Work' }))

    expect(onDelete).toHaveBeenCalledWith(2)
  })
})
