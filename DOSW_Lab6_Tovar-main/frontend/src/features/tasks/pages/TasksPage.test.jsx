import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as taskApi from '../../../api/taskApi'
import TasksPage from './TasksPage'

vi.mock('../../../api/taskApi', () => ({
  getTasks: vi.fn(),
  getTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

const sampleTask = {
  id: 1,
  title: 'Read book',
  description: 'Chapter 1',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: '2026-09-30',
}

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    taskApi.getCategories.mockResolvedValue([])
  })

  it('shows a loading message while the tasks are loading', () => {
    taskApi.getTasks.mockReturnValue(new Promise(() => {}))

    render(<TasksPage />)

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('shows the tasks returned by the API', async () => {
    taskApi.getTasks.mockResolvedValue([sampleTask])

    render(<TasksPage />)

    expect(await screen.findByText('Read book')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows an error when the API fails', async () => {
    taskApi.getTasks.mockRejectedValue(new Error('Network error'))

    render(<TasksPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  })

  it('creates a task from the form', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([])
    taskApi.createTask.mockResolvedValue({ id: 5 })

    render(<TasksPage />)

    await user.type(screen.getByLabelText('Title'), 'New task')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: 'New task',
        description: '',
        priority: 'MEDIUM',
        dueDate: null,
        categoryId: null,
      }),
    )
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([sampleTask])
    taskApi.deleteTask.mockResolvedValue(null)

    render(<TasksPage />)

    await user.click(await screen.findByRole('button', { name: 'Delete Read book' }))

    await waitFor(() => expect(taskApi.deleteTask).toHaveBeenCalledWith(1))
  })

  it('changes the status of a task', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([sampleTask])
    taskApi.updateTask.mockResolvedValue({ ...sampleTask, status: 'IN_PROGRESS' })

    render(<TasksPage />)

    await user.click(await screen.findByRole('button', { name: 'Change status of Read book' }))

    await waitFor(() =>
      expect(taskApi.updateTask).toHaveBeenCalledWith(1, {
        title: 'Read book',
        description: 'Chapter 1',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: '2026-09-30',
      }),
    )
  })

  it('lists, creates and deletes categories', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([])
    taskApi.getCategories.mockResolvedValue([{ id: 1, name: 'Home' }])
    taskApi.createCategory.mockResolvedValue({ id: 2, name: 'Work' })
    taskApi.deleteCategory.mockResolvedValue(null)

    render(<TasksPage />)
    expect(await screen.findByRole('button', { name: 'Delete category Home' })).toBeInTheDocument()

    taskApi.getCategories.mockResolvedValue([{ id: 1, name: 'Home' }, { id: 2, name: 'Work' }])
    await user.type(screen.getByLabelText('Category name'), 'Work')
    await user.click(screen.getByRole('button', { name: 'Add category' }))

    await waitFor(() => expect(taskApi.createCategory).toHaveBeenCalledWith('Work'))
    expect(await screen.findByRole('button', { name: 'Delete category Work' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete category Home' }))
    await waitFor(() => expect(taskApi.deleteCategory).toHaveBeenCalledWith(1))
  })

  it('shows the server error when a category cannot be deleted', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([])
    taskApi.getCategories.mockResolvedValue([{ id: 1, name: 'Home' }])
    taskApi.deleteCategory.mockRejectedValue(
      new Error('Category with id 1 is assigned to tasks and cannot be deleted'),
    )

    render(<TasksPage />)
    await user.click(await screen.findByRole('button', { name: 'Delete category Home' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot be deleted')
  })
})
