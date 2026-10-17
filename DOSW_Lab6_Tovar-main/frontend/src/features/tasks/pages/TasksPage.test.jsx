import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as taskApi from '../../../api/taskApi'
import TasksPage from './TasksPage'

vi.mock('../../../api/taskApi', () => ({
  getTasks: vi.fn(),
  getTask: vi.fn(),
  getTaskSummary: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

const sampleTask = {
  id: 1,
  title: 'Read book',
  description: 'Chapter 1',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: '2026-09-30',
}

const emptySummary = {
  total: 1,
  byStatus: { PENDING: 1, IN_PROGRESS: 0, COMPLETED: 0 },
  byPriority: { LOW: 0, MEDIUM: 1, HIGH: 0 },
  overdue: 0,
  completionPercentage: 0,
}

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    taskApi.getTaskSummary.mockResolvedValue(emptySummary)
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

  it('shows the summary and refreshes it after deleting a task', async () => {
    const user = userEvent.setup()
    taskApi.getTasks.mockResolvedValue([sampleTask])
    taskApi.deleteTask.mockResolvedValue(null)

    render(<TasksPage />)
    expect(await screen.findByText('Overdue: 0')).toBeInTheDocument()
    expect(taskApi.getTaskSummary).toHaveBeenCalledTimes(1)

    taskApi.getTaskSummary.mockResolvedValue({ ...emptySummary, total: 0, overdue: 3 })
    await user.click(screen.getByRole('button', { name: 'Delete Read book' }))

    expect(await screen.findByText('Overdue: 3')).toBeInTheDocument()
    expect(taskApi.getTaskSummary).toHaveBeenCalledTimes(2)
  })
})
