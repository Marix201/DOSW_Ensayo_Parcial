import { describe, it, expect } from 'vitest'
import { isOverdue } from './isOverdue'

const today = new Date(2026, 9, 17) // 2026-10-17 local time

describe('isOverdue', () => {
  it('is true for a pending task with a past due date', () => {
    expect(isOverdue({ status: 'PENDING', dueDate: '2026-10-16' }, today)).toBe(true)
  })

  it('is true for an in-progress task with a past due date', () => {
    expect(isOverdue({ status: 'IN_PROGRESS', dueDate: '2026-01-01' }, today)).toBe(true)
  })

  it('is false for a completed task even with a past due date', () => {
    expect(isOverdue({ status: 'COMPLETED', dueDate: '2026-01-01' }, today)).toBe(false)
  })

  it('is false when the due date is today or in the future', () => {
    expect(isOverdue({ status: 'PENDING', dueDate: '2026-10-17' }, today)).toBe(false)
    expect(isOverdue({ status: 'PENDING', dueDate: '2026-12-01' }, today)).toBe(false)
  })

  it('is false when there is no due date', () => {
    expect(isOverdue({ status: 'PENDING', dueDate: null }, today)).toBe(false)
  })
})
