-- REQ-06: completion timestamp for tasks.
ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP;

-- Existing completed tasks have no real completion date; created_at is used as an approximation.
UPDATE tasks SET completed_at = created_at WHERE status = 'COMPLETED' AND completed_at IS NULL;

-- Rollback:
-- ALTER TABLE tasks DROP COLUMN completed_at;
