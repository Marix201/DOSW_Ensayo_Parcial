import { useCallback, useEffect, useState } from 'react'
import * as taskApi from '../../../api/taskApi'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

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

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await taskApi.getCategories())
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const addCategory = useCallback(
    async (name) => {
      try {
        await taskApi.createCategory(name)
        await loadCategories()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadCategories],
  )

  const removeCategory = useCallback(
    async (id) => {
      try {
        await taskApi.deleteCategory(id)
        await loadCategories()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadCategories],
  )

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
    loadCategories()
  }, [loadTasks, loadCategories])

  return { tasks, loading, error, categories, addCategory, removeCategory, loadTasks, addTask, editTask, removeTask }
}
