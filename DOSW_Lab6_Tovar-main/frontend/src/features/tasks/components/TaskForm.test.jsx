import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'

describe('TaskForm', () => {
  it('renders the form fields', () => {
    render(<TaskForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority')).toBeInTheDocument()
    expect(screen.getByLabelText('Due date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('submits the typed title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Title'), 'Study Spring Boot')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Study Spring Boot',
      description: '',
      priority: 'MEDIUM',
      dueDate: null,
      categoryId: null,
    })
  })

  it('shows an error and does not submit when the title is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('loads the task data when editing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const task = {
      id: 1,
      title: 'Read book',
      description: 'Chapter 1',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: '2026-09-30',
    }
    render(<TaskForm initialTask={task} onSubmit={onSubmit} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Title')).toHaveValue('Read book')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Read book',
      description: 'Chapter 1',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: '2026-09-30',
      categoryId: null,
    })
  })

  it('submits the selected category', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TaskForm categories={[{ id: 4, name: 'Work' }]} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Title'), 'Report')
    await user.selectOptions(screen.getByLabelText('Category'), 'Work')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Report',
      description: '',
      priority: 'MEDIUM',
      dueDate: null,
      categoryId: 4,
    })
  })

  it('preselects the category of the task being edited', () => {
    const task = { id: 1, title: 'Read', description: '', status: 'PENDING', priority: 'LOW', dueDate: null, category: { id: 4, name: 'Work' } }
    render(<TaskForm initialTask={task} categories={[{ id: 4, name: 'Work' }]} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Category')).toHaveValue('4')
  })
})
