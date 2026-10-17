export default function TaskBatchActions({
  selectedCount,
  visibleCount,
  onSelectAll,
  onDeleteSelected,
  onCompleteSelected,
  onClearCompleted,
}) {
  return (
    <div className="task-batch" role="group" aria-label="Batch actions">
      <label htmlFor="select-all">
        <input
          id="select-all"
          type="checkbox"
          checked={visibleCount > 0 && selectedCount === visibleCount}
          disabled={visibleCount === 0}
          onChange={(event) => onSelectAll(event.target.checked)}
        />
        {' '}Select all
      </label>
      <span>{selectedCount} selected</span>
      <div className="task-actions">
        <button type="button" disabled={selectedCount === 0} onClick={onCompleteSelected}>
          Complete selected
        </button>
        <button type="button" disabled={selectedCount === 0} onClick={onDeleteSelected}>
          Delete selected
        </button>
        <button type="button" onClick={onClearCompleted}>Clear completed</button>
      </div>
    </div>
  )
}
