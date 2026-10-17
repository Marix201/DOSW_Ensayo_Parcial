# Diagramas REQ-05
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
## C4 Contenedores (nuevos endpoints de lote)
```mermaid
C4Container
  Container(spa, "Frontend", "React + Vite")
  Container(api, "Backend", "Spring Boot", "POST /tasks/batch/delete, POST /tasks/batch/complete, DELETE /tasks/completed")
  ContainerDb(db, "PostgreSQL", "tasks")
  Rel(spa, api, "JSON/HTTP")
  Rel(api, db, "JPA (transaccion)")
```
## C4 Componentes (frontend)
```mermaid
flowchart LR
  TasksPage --> TaskBatchActions
  TasksPage --> TaskForm
  TasksPage --> TaskList --> TaskItem
  TasksPage --> useTasks --> taskApi
```
## Clases
```mermaid
classDiagram
  class TaskBatchRequest { List~Long~ ids }
  class TaskController { deleteBatch() completeBatch() deleteCompleted() }
  class TaskService { <<interface>> deleteBatch(ids) completeBatch(ids) deleteCompleted() }
  TaskController --> TaskService
  TaskController ..> TaskBatchRequest
  TaskServiceImpl ..|> TaskService
  TaskServiceImpl --> TaskRepository
```
ER: sin cambios.
