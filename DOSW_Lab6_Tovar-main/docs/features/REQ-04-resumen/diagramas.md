# Diagramas REQ-04
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
## C4 Contenedores (nuevo endpoint)
```mermaid
C4Container
  Container(spa, "Frontend", "React + Vite")
  Container(api, "Backend", "Spring Boot", "GET /api/v1/tasks/summary")
  ContainerDb(db, "PostgreSQL", "tasks")
  Rel(spa, api, "JSON/HTTP")
  Rel(api, db, "JPA")
```
## C4 Componentes (frontend)
```mermaid
flowchart LR
  TasksPage --> TaskSummary
  TasksPage --> TaskForm
  TasksPage --> TaskList --> TaskItem
  TasksPage --> useTasks --> taskApi
```
## Clases
```mermaid
classDiagram
  class TaskSummaryResponse {
    long total
    Map~TaskStatus,Long~ byStatus
    Map~TaskPriority,Long~ byPriority
    long overdue
    double completionPercentage
  }
  class TaskController { getSummary() }
  class TaskService { <<interface>> getSummary() TaskSummaryResponse }
  TaskController --> TaskService
  TaskServiceImpl ..|> TaskService
  TaskService ..> TaskSummaryResponse
```
ER: sin cambios.
