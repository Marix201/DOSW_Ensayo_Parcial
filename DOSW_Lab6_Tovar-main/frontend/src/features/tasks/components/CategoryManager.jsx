import { useState } from 'react'

export default function CategoryManager({ categories, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setValidationError('Category name is required')
      return
    }
    setValidationError('')
    await onAdd(name.trim())
    setName('')
  }

  return (
    <section className="task-form category-manager" aria-label="Categories">
      <h2>Categories</h2>

      <form className="form-actions" onSubmit={handleSubmit}>
        <label htmlFor="category-name">Category name</label>
        <input
          id="category-name"
          type="text"
          value={name}
          maxLength={50}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Add category</button>
      </form>
      {validationError && <p role="alert" className="error">{validationError}</p>}

      {categories.length === 0 ? (
        <p>No categories yet.</p>
      ) : (
        <ul className="task-list">
          {categories.map((category) => (
            <li key={category.id} className="task-item">
              <span>{category.name}</span>
              <button
                type="button"
                aria-label={`Delete category ${category.name}`}
                onClick={() => onDelete(category.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
