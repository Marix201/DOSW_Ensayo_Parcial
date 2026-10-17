# Diagramas REQ-03
No existian diagramas previos en main: versiones minimas en Mermaid.

## C4 Contexto (sin cambios)
```mermaid
C4Context
  Person(user, "Usuario")
  System(todo, "ToDo App", "SPA React + API REST Spring Boot")
  SystemDb(db, "PostgreSQL", "tasks, categories")
  Rel(user, todo, "Usa")
  Rel(todo, db, "JDBC")
```
## C4 Contenedores (nuevo recurso /api/v1/categories y tabla categories)
```mermaid
C4Container
  Container(spa, "Frontend", "React + Vite")
  Container(api, "Backend", "Spring Boot", "/api/v1/tasks, /api/v1/categories")
  ContainerDb(db, "PostgreSQL", "tasks, categories")
  Rel(spa, api, "JSON/HTTP")
  Rel(api, db, "JPA")
```
## C4 Componentes (backend y frontend)
```mermaid
flowchart LR
  subgraph Backend
    CategoryController --> CategoryService --> CategoryRepository
    TaskController --> TaskService --> TaskRepository
    TaskService --> CategoryRepository
    CategoryService --> TaskRepository
  end
  subgraph Frontend
    TasksPage --> CategoryManager
    TasksPage --> TaskForm
    TasksPage --> TaskList --> TaskItem
    TasksPage --> useTasks --> taskApi
  end
```
## Clases
```mermaid
classDiagram
  class CategoryEntity { Long id; String name }
  class TaskEntity { Long id; String title; ...; CategoryEntity category }
  class CategoryRequest { String name }
  class CategoryResponse { Long id; String name }
  class TaskCreateRequest { ...; Long categoryId }
  class TaskUpdateRequest { ...; Long categoryId }
  class TaskResponse { ...; CategoryResponse category }
  class CategoryConflictException
  class CategoryNotFoundException
  TaskEntity "*" --> "0..1" CategoryEntity
  CategoryServiceImpl --> CategoryRepository
  CategoryServiceImpl --> TaskRepository
  TaskServiceImpl --> CategoryRepository
  TaskResponse --> CategoryResponse
```
## ER
```mermaid
erDiagram
  categories ||--o{ tasks : "category_id (opcional)"
  categories { bigint id PK
    varchar name UK "max 50" }
  tasks { bigint id PK
    varchar title
    bigint category_id FK "nuevo, nullable" }
```
