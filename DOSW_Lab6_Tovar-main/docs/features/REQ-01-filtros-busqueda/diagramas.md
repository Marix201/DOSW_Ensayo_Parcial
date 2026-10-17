# Diagramas REQ-01
No existian diagramas previos en main: versiones minimas en Mermaid.

## C4 Contexto (sin cambios)
```mermaid
C4Context
  Person(user, "Usuario")
  System(todo, "ToDo App", "SPA React + API REST Spring Boot")
  SystemDb(db, "PostgreSQL", "tasks")
  Rel(user, todo, "Usa")
  Rel(todo, db, "JDBC")
```
## C4 Contenedores (sin cambios estructurales; GET /api/v1/tasks acepta query params)
```mermaid
C4Container
  Container(spa, "Frontend", "React + Vite")
  Container(api, "Backend", "Spring Boot", "GET /api/v1/tasks?status&priority&q")
  ContainerDb(db, "PostgreSQL", "tasks")
  Rel(spa, api, "JSON/HTTP")
  Rel(api, db, "JPA")
```
## C4 Componentes (frontend)
```mermaid
flowchart LR
  TasksPage --> TaskFilters
  TasksPage --> TaskForm
  TasksPage --> TaskList --> TaskItem
  TasksPage --> useTasks --> taskApi
```
## Clases
```mermaid
classDiagram
  class TaskController { findAll(status, priority, q) }
  class TaskService { <<interface>> findAll(TaskStatus, TaskPriority, String) }
  class GlobalExceptionHandler { handleTypeMismatch() }
  TaskController --> TaskService
  TaskServiceImpl ..|> TaskService
  TaskServiceImpl --> TaskRepository
```
ER: sin cambios.
