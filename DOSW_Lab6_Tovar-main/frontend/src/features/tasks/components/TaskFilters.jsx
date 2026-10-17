export default function TaskFilters({ filters, onChange, onClear }) {
  function handleChange(field) {
    return (event) => onChange({ ...filters, [field]: event.target.value })
  }

  return (
    <form className="task-form task-filters" onSubmit={(event) => event.preventDefault()}>
      <h2>Filters</h2>

      <label htmlFor="filter-q">Search</label>
      <input
        id="filter-q"
        type="search"
        value={filters.q}
        placeholder="Title or description"
        onChange={handleChange('q')}
      />

      <label htmlFor="filter-status">Filter by status</label>
      <select id="filter-status" value={filters.status} onChange={handleChange('status')}>
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <label htmlFor="filter-priority">Filter by priority</label>
      <select id="filter-priority" value={filters.priority} onChange={handleChange('priority')}>
        <option value="">All</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <div className="form-actions">
        <button type="button" onClick={onClear}>Clear</button>
      </div>
    </form>
  )
}
