import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskSummary from './TaskSummary'

const summary = {
  total: 4,
  byStatus: { PENDING: 3, IN_PROGRESS: 0, COMPLETED: 1 },
  byPriority: { LOW: 1, MEDIUM: 2, HIGH: 1 },
  overdue: 2,
  completionPercentage: 25,
}

describe('TaskSummary', () => {
  it('shows totals, counts and completion percentage', () => {
    render(<TaskSummary summary={summary} />)

    expect(screen.getByText('Pending: 3')).toBeInTheDocument()
    expect(screen.getByText('Completed: 1')).toBeInTheDocument()
    expect(screen.getByText('Medium priority: 2')).toBeInTheDocument()
    expect(screen.getByText('Overdue: 2')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('shows zeros when there are no tasks', () => {
    render(
      <TaskSummary
        summary={{
          total: 0,
          byStatus: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 },
          byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
          overdue: 0,
          completionPercentage: 0,
        }}
      />,
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Overdue: 0')).toBeInTheDocument()
  })

  it('renders nothing while the summary is not loaded', () => {
    const { container } = render(<TaskSummary summary={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
