export default function TaskSort({ sort, onChange }) {
  function handleChange(field) {
    return (event) => onChange({ ...sort, [field]: event.target.value })
  }

  return (
    <div className="task-form task-sort">
      <label htmlFor="sort-field">Sort by</label>
      <select id="sort-field" value={sort.sort} onChange={handleChange('sort')}>
        <option value="createdAt">Created</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>

      <label htmlFor="sort-direction">Direction</label>
      <select id="sort-direction" value={sort.direction} onChange={handleChange('direction')}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  )
}
