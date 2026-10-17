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
  deleteTasks: vi.fn(),
  completeTasks: vi.fn(),
  deleteCompletedTasks: vi.fn(),
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

  const secondTask = { ...sampleTask, id: 2, title: 'Write report' }

  it('deletes the selected tasks after confirmation and clears the selection', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    taskApi.getTasks.mockResolvedValue([sampleTask, secondTask])
    taskApi.deleteTasks.mockResolvedValue(null)

    render(<TasksPage />)
    await user.click(await screen.findByLabelText('Select Read book'))
    await user.click(screen.getByLabelText('Select Write report'))
    expect(screen.getByText('2 selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete selected' }))

    await waitFor(() => expect(taskApi.deleteTasks).toHaveBeenCalledWith([1, 2]))
    expect(await screen.findByText('0 selected')).toBeInTheDocument()
  })

  it('does not delete when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    taskApi.getTasks.mockResolvedValue([sampleTask])

    render(<TasksPage />)
    await user.click(await screen.findByLabelText('Select Read book'))
    await user.click(screen.getByRole('button', { name: 'Delete selected' }))

    expect(taskApi.deleteTasks).not.toHaveBeenCalled()
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('completes the selected tasks', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([sampleTask])
    taskApi.completeTasks.mockResolvedValue([])

    render(<TasksPage />)
    await user.click(await screen.findByLabelText('Select all'))
    await user.click(screen.getByRole('button', { name: 'Complete selected' }))

    await waitFor(() => expect(taskApi.completeTasks).toHaveBeenCalledWith([1]))
  })

  it('clears completed tasks after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    taskApi.getTasks.mockResolvedValue([sampleTask])
    taskApi.deleteCompletedTasks.mockResolvedValue(null)

    render(<TasksPage />)
    await user.click(await screen.findByRole('button', { name: 'Clear completed' }))

    await waitFor(() => expect(taskApi.deleteCompletedTasks).toHaveBeenCalled())
  })

  it('drops from the selection tasks that are no longer visible', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([sampleTask, secondTask])
    taskApi.deleteTask.mockResolvedValue(null)

    render(<TasksPage />)
    await user.click(await screen.findByLabelText('Select Read book'))
    expect(screen.getByText('1 selected')).toBeInTheDocument()

    taskApi.getTasks.mockResolvedValue([secondTask])
    await user.click(screen.getByRole('button', { name: 'Delete Read book' }))

    expect(await screen.findByText('0 selected')).toBeInTheDocument()
  })
})
