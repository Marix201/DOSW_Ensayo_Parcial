import TaskItem from './TaskItem'

export default function TaskList({ tasks, selectedIds = [], onToggleSelect, onEdit, onDelete, onChangeStatus }) {
  if (tasks.length === 0) {
    return <p>No tasks yet.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          selected={selectedIds.includes(task.id)}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </ul>
  )
}
