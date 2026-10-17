-- REQ-03: task categories.
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT uq_category_name UNIQUE (name)
);

-- Optional relation: existing tasks keep category_id = NULL.
ALTER TABLE tasks ADD COLUMN category_id BIGINT;
ALTER TABLE tasks ADD CONSTRAINT fk_task_category FOREIGN KEY (category_id) REFERENCES categories (id);
CREATE INDEX idx_tasks_category_id ON tasks (category_id);

-- Rollback:
-- DROP INDEX idx_tasks_category_id;
-- ALTER TABLE tasks DROP CONSTRAINT fk_task_category;
-- ALTER TABLE tasks DROP COLUMN category_id;
-- DROP TABLE categories;
