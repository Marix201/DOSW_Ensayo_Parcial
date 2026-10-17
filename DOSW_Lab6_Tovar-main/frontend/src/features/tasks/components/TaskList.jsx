import TaskItem from './TaskItem'

export default function TaskList({ tasks, hasActiveFilters = false, onEdit, onDelete, onChangeStatus }) {
  if (tasks.length === 0) {
    return <p>{hasActiveFilters ? 'No tasks match the current filters.' : 'No tasks yet.'}</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </ul>
  )
}
