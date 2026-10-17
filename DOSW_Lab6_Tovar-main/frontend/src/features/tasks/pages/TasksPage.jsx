import { useState } from 'react'
import TaskBatchActions from '../components/TaskBatchActions'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { useTasks } from '../hooks/useTasks'

const NEXT_STATUS = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
}

export default function TasksPage() {
  const {
    tasks, loading, error, addTask, editTask, removeTask, removeTasks, completeTasks, clearCompleted,
  } = useTasks()
  const [editingTask, setEditingTask] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  // Only tasks currently visible in the list can be part of the selection.
  const visibleSelectedIds = selectedIds.filter((id) => tasks.some((task) => task.id === id))

  function handleToggleSelect(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  function handleSelectAll(checked) {
    setSelectedIds(checked ? tasks.map((task) => task.id) : [])
  }

  async function handleDeleteSelected() {
    if (!window.confirm(`Delete ${visibleSelectedIds.length} selected task(s)?`)) {
      return
    }
    await removeTasks(visibleSelectedIds)
    setSelectedIds([])
  }

  async function handleCompleteSelected() {
    await completeTasks(visibleSelectedIds)
    setSelectedIds([])
  }

  async function handleClearCompleted() {
    if (!window.confirm('Delete all completed tasks?')) {
      return
    }
    await clearCompleted()
    setSelectedIds([])
  }

  async function handleSubmit(payload) {
    if (editingTask) {
      await editTask(editingTask.id, payload)
      setEditingTask(null)
    } else {
      await addTask(payload)
    }
  }

  function handleChangeStatus(task) {
    editTask(task.id, {
      title: task.title,
      description: task.description ?? '',
      status: NEXT_STATUS[task.status],
      priority: task.priority,
      dueDate: task.dueDate,
    })
  }

  return (
    <main className="tasks-page">
      <h1>ToDo Tasks</h1>

      <TaskForm
        key={editingTask ? editingTask.id : 'new'}
        initialTask={editingTask}
        onSubmit={handleSubmit}
        onCancel={() => setEditingTask(null)}
      />

      {loading && <p>Loading tasks...</p>}
      {error && <p role="alert" className="error">{error}</p>}

      <TaskBatchActions
        selectedCount={visibleSelectedIds.length}
        visibleCount={tasks.length}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onCompleteSelected={handleCompleteSelected}
        onClearCompleted={handleClearCompleted}
      />

      <TaskList
        tasks={tasks}
        selectedIds={visibleSelectedIds}
        onToggleSelect={handleToggleSelect}
        onEdit={setEditingTask}
        onDelete={removeTask}
        onChangeStatus={handleChangeStatus}
      />
    </main>
  )
}
