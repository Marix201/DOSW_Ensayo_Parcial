const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export default function TaskSummary({ summary }) {
  if (!summary) {
    return null
  }

  return (
    <section className="task-summary" aria-label="Task summary">
      <h2>Summary</h2>
      <p>
        <strong>{summary.total}</strong> tasks, <strong>{summary.completionPercentage}%</strong> completed
      </p>
      <div>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key} className="badge">{label}: {summary.byStatus[key] ?? 0}</span>
        ))}
      </div>
      <div>
        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
          <span key={key} className="badge">{label} priority: {summary.byPriority[key] ?? 0}</span>
        ))}
        <span className="badge badge-overdue">Overdue: {summary.overdue}</span>
      </div>
    </section>
  )
}
