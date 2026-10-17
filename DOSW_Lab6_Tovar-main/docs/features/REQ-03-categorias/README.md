# REQ-03 - Categorias de tareas

## 1. Resumen
Entidad `Category` (nombre unico, max. 50), relacion opcional desde `Task`, CRUD en `/api/v1/categories`, selector en `TaskForm`, panel simple de gestion y badge de categoria. Regla documentada y probada: borrar una categoria en uso devuelve 409. Cubre HU-1, HU-2 y HU-3.

Historias de usuario y criterios de aceptacion: [analisis.md](analisis.md). Estructura Jira (no hubo acceso a Jira; sin claves reales): [jira.md](jira.md).

## 2. Prerrequisitos (detectados del repo)
- JDK 21 (`backend/pom.xml`, `java.version`), Maven wrapper (`backend/mvnw`), Spring Boot 4.1.1.
- Node.js 20.19+ o 22.12+, npm; Vite 8, Vitest 4 (`frontend/package.json`).
- PostgreSQL 17 en Docker (`todo_db`, usuario `todo_user`, clave `todo_password`, puerto 5432; ver README raiz).

## 3. Preparar la rama
```bash
git status            # debe estar limpio
git checkout main
git pull
git checkout -b feature/REQ-03-categorias
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-03-categorias/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-03): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-03-categorias`
2. **Modelo de datos**
   - Archivos: `database/003_create_categories.sql`, `entity/CategoryEntity.java` (nuevo), `entity/TaskEntity.java` (@ManyToOne category)
   - Commit: `git add database backend/src/main/java/edu/eci/dosw/todo/entity` y `git commit -m "feat(REQ-03): modelo de categorias"` y `git push -u origin feature/REQ-03-categorias`
3. **Backend**
   - Archivos: `CategoryController/Service/ServiceImpl/Repository`, `dto/CategoryRequest|CategoryResponse`, `exception/CategoryNotFoundException|CategoryConflictException`, `GlobalExceptionHandler.java` (404/409), `TaskRepository.existsByCategoryId`, `TaskCreateRequest|TaskUpdateRequest` (+categoryId), `TaskResponse` (+category), `TaskServiceImpl.java`
   - Commit: `git add backend/src/main` y `git commit -m "feat(REQ-03): CRUD de categorias y asignacion a tareas"`
4. **Pruebas backend**
   - Archivos: `CategoryControllerTest`, `CategoryServiceTest` (nuevos), `TaskControllerTest`, `TaskServiceTest` (constructores de records actualizados + casos de categoria)
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-03): pruebas de categorias"` y `git push -u origin feature/REQ-03-categorias`
5. **Frontend e integracion**
   - Archivos: `components/CategoryManager.jsx` (nuevo), `TaskForm.jsx` (selector Category), `TaskItem.jsx` (badge), `hooks/useTasks.js` (categories, addCategory, removeCategory), `pages/TasksPage.jsx`, `api/taskApi.js` (CATEGORIES_URL derivada de BASE_URL), `index.css`
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-03): UI de categorias"`
6. **Pruebas frontend**
   - Archivos: `CategoryManager.test.jsx` (nuevo), `TaskForm.test.jsx` y `TasksPage.test.jsx` (el payload ahora incluye `categoryId`), `TaskList.test.jsx`
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-03): pruebas UI"` y `git push -u origin feature/REQ-03-categorias`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-03): README"` y `git push -u origin feature/REQ-03-categorias`

## 5. Modelo de datos
Script `database/003_create_categories.sql`: crea `categories(id, name VARCHAR(50) UNIQUE NOT NULL)`, anade `tasks.category_id BIGINT` (nullable, FK a `categories`, con indice). Las tareas existentes quedan sin categoria. Es independiente de `002_add_completed_at.sql` (REQ-06); aplicar en orden numerico. Aplicar: `docker cp database/003_create_categories.sql todo-postgres:/003.sql && docker exec -i todo-postgres psql -U todo_user -d todo_db -f /003.sql`. Revertir: las sentencias comentadas al final del script (DROP INDEX, DROP CONSTRAINT, DROP COLUMN, DROP TABLE).

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| GET | /api/v1/categories | - | Lista de `{id,name}` ordenada por nombre | 200 |
| GET | /api/v1/categories/{id} | - | `{id,name}` | 200, 404 |
| POST | /api/v1/categories | `{"name":"Work"}` | `{id,name}` | 201, 400 (vacio / >50), 409 (nombre duplicado) |
| PUT | /api/v1/categories/{id} | `{"name":"Work"}` | `{id,name}` | 200, 400, 404, 409 |
| DELETE | /api/v1/categories/{id} | - | - | 204, 404, 409 (categoria asignada a tareas) |
| POST/PUT | /api/v1/tasks[/{id}] | ahora acepta `categoryId` (opcional) | TaskResponse con `category:{id,name}` o null | 404 si `categoryId` no existe |

Ejemplos:
```bash
curl -X POST http://localhost:8080/api/v1/categories -H "Content-Type: application/json" -d '{"name":"Work"}'
curl -X POST http://localhost:8080/api/v1/tasks -H "Content-Type: application/json" -d '{"title":"Report","categoryId":1}'
curl -X DELETE http://localhost:8080/api/v1/categories/1   # 409 si esta en uso
```

## 7. Conexion back - front
- Sin cambios en CORS (GET/POST/PUT/DELETE ya permitidos para `/api/**`).
- `frontend/src/api/taskApi.js`: `CATEGORIES_URL = BASE_URL.replace(/\/tasks$/, '/categories')`; con `VITE_API_URL` personalizado debe terminar en `/tasks`.
- `application.properties` mantiene `ddl-auto=validate`: **hay que aplicar el script 003 antes de arrancar el backend**.

## 8. Como ejecutar
```bash
docker start todo-postgres          # o ver README raiz para crearlo
docker cp database/003_create_categories.sql todo-postgres:/003.sql && docker exec -i todo-postgres psql -U todo_user -d todo_db -f /003.sql
cd backend && ./mvnw spring-boot:run    # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## 9. Pruebas
```bash
cd backend && ./mvnw test        # TodoApplicationTests.contextLoads requiere PostgreSQL real
cd backend && ./mvnw test -Dtest='!TodoApplicationTests'   # solo las que no necesitan BD
cd frontend && npm test
```
Resultado real: backend 43 pruebas (TaskControllerTest 9, TaskServiceTest 13, CategoryControllerTest 11, CategoryServiceTest 10) pasan, excluyendo `TodoApplicationTests` que ya fallaba en main (sin PostgreSQL disponible); frontend 23/23 pasan. **No verificado**: el mapeo JPA y el script SQL contra PostgreSQL real (no habia BD ni Docker en el entorno).

## 10. Verificacion manual
- [ ] Crear categoria "Work" (201); repetirla en otra capitalizacion (409).
- [ ] Nombre vacio o de 51 caracteres (400).
- [ ] GET/PUT/DELETE de un id inexistente (404).
- [ ] Asignar la categoria a una tarea: aparece el badge; quitarla con "No category".
- [ ] Borrar una categoria asignada a una tarea (409 y mensaje visible en la UI); tras reasignar la tarea, el borrado funciona.
- [ ] Tareas anteriores a la migracion se ven sin categoria.

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-03-categorias` hacia `main` (`gh pr create --base main --head feature/REQ-03-categorias`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskEntity`, `TaskResponse`, `TaskCreateRequest`, `TaskUpdateRequest` (records con un argumento nuevo al final: REQ-06 anade `completedAt` a `TaskResponse`; resolver conservando ambos), `TaskServiceImpl` (constructor con `CategoryRepository`, `create/update/toResponse`), `GlobalExceptionHandler`, `TaskRepository`, `TaskControllerTest`/`TaskServiceTest` (constructores de records), `TaskForm(.test)`, `TaskItem.jsx`, `useTasks.js`, `TasksPage(.test).jsx`, `taskApi.js`, `index.css`. Script SQL: sin conflicto (003 vs 002). Integrar al final (ultima en el orden recomendado).
