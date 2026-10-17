import { useState } from 'react'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { useTasks } from '../hooks/useTasks'

const NEXT_STATUS = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
}

export default function TasksPage() {
  const { tasks, loading, error, addTask, editTask, changeStatus, removeTask } = useTasks()
  const [editingTask, setEditingTask] = useState(null)

  async function handleSubmit(payload) {
    if (editingTask) {
      await editTask(editingTask.id, payload)
      setEditingTask(null)
    } else {
      await addTask(payload)
    }
  }

  function handleChangeStatus(task) {
    changeStatus(task.id, NEXT_STATUS[task.status])
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

      <TaskList
        tasks={tasks}
        onEdit={setEditingTask}
        onDelete={removeTask}
        onChangeStatus={handleChangeStatus}
      />
    </main>
  )
}
