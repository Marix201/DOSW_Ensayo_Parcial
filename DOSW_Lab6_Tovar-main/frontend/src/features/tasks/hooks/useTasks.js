import { useCallback, useEffect, useState } from 'react'
import * as taskApi from '../../../api/taskApi'

const EMPTY_FILTERS = { status: '', priority: '', q: '' }

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await taskApi.getTasks(filters))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const addTask = useCallback(
    async (task) => {
      try {
        await taskApi.createTask(task)
        await loadTasks()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadTasks],
  )

  const editTask = useCallback(
    async (id, task) => {
      try {
        await taskApi.updateTask(id, task)
        await loadTasks()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadTasks],
  )

  const removeTask = useCallback(
    async (id) => {
      try {
        await taskApi.deleteTask(id)
        await loadTasks()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadTasks],
  )

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return { tasks, loading, error, filters, setFilters, clearFilters, loadTasks, addTask, editTask, removeTask }
}
