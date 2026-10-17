function toLocalDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// A task is overdue when it is not completed and its due date is before today.
export function isOverdue(task, today = new Date()) {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false
  }
  return task.dueDate < toLocalDateString(today)
}
