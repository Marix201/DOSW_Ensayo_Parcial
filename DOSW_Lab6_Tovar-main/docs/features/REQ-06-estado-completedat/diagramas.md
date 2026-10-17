# Diagramas REQ-06
No existian diagramas previos en el repo: se crean versiones minimas en Mermaid (base para las demas ramas).

## C4 - Contexto
```mermaid
C4Context
  Person(user, "Usuario", "Gestiona tareas")
  System(todo, "ToDo App", "SPA React + API REST Spring Boot")
  SystemDb(db, "PostgreSQL", "Tabla tasks")
  Rel(user, todo, "Usa")
  Rel(todo, db, "JDBC")
```

## C4 - Contenedores (sin cambios estructurales; se anade el endpoint PATCH)
```mermaid
C4Container
  Person(user, "Usuario")
  Container(spa, "Frontend", "React + Vite", "src/features/tasks, src/api/taskApi.js")
  Container(api, "Backend", "Spring Boot", "/api/v1/tasks (+ PATCH /{id}/status)")
  ContainerDb(db, "PostgreSQL", "tasks (+ completed_at)")
  Rel(user, spa, "HTTP")
  Rel(spa, api, "JSON/HTTPS, CORS GET POST PUT PATCH DELETE")
  Rel(api, db, "JPA")
```
Nivel Componentes: TaskController -> TaskService(Impl) -> TaskRepository; WebConfig (CORS). Sin componentes nuevos.

## Clases
```mermaid
classDiagram
  class TaskEntity {
    Long id
    String title
    String description
    TaskStatus status
    TaskPriority priority
    LocalDate dueDate
    LocalDateTime createdAt
    LocalDateTime completedAt
  }
  class TaskStatusUpdateRequest { TaskStatus status }
  class TaskResponse { ...; LocalDateTime completedAt }
  class TaskService { <<interface>> updateStatus(Long, TaskStatusUpdateRequest) TaskResponse }
  TaskController --> TaskService
  TaskServiceImpl ..|> TaskService
  TaskServiceImpl --> TaskRepository
  TaskRepository --> TaskEntity
```

## ER
```mermaid
erDiagram
  tasks { bigint id PK
    varchar title
    varchar description
    varchar status
    varchar priority
    date due_date
    timestamp created_at
    timestamp completed_at "nuevo, nullable" }
```
