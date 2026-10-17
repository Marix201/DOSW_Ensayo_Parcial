import { useCallback, useEffect, useState } from 'react'
import * as taskApi from '../../../api/taskApi'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await taskApi.getTasks())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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

  const removeTasks = useCallback(
    async (ids) => {
      try {
        await taskApi.deleteTasks(ids)
        await loadTasks()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadTasks],
  )

  const completeTasks = useCallback(
    async (ids) => {
      try {
        await taskApi.completeTasks(ids)
        await loadTasks()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadTasks],
  )

  const clearCompleted = useCallback(async () => {
    try {
      await taskApi.deleteCompletedTasks()
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }, [loadTasks])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return { tasks, loading, error, loadTasks, addTask, editTask, removeTask, removeTasks, completeTasks, clearCompleted }
}
