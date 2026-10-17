# Diagramas REQ-02
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
## C4 Contenedores (sin cambios estructurales)
```mermaid
C4Container
  Container(spa, "Frontend", "React + Vite")
  Container(api, "Backend", "Spring Boot", "GET /api/v1/tasks?sort&direction")
  ContainerDb(db, "PostgreSQL", "tasks")
  Rel(spa, api, "JSON/HTTP")
  Rel(api, db, "JPA")
```
## C4 Componentes (frontend)
```mermaid
flowchart LR
  TasksPage --> TaskSort
  TasksPage --> TaskForm
  TasksPage --> TaskList --> TaskItem --> isOverdue
  TasksPage --> useTasks --> taskApi
```
## Clases
```mermaid
classDiagram
  class TaskController { findAll(sort, direction) }
  class TaskService { <<interface>> findAll(String sort, String direction) }
  class TaskQueryException
  class GlobalExceptionHandler { handleTaskQuery() }
  TaskController --> TaskService
  TaskServiceImpl ..|> TaskService
  TaskServiceImpl ..> TaskQueryException
  GlobalExceptionHandler ..> TaskQueryException
```
ER: sin cambios.
