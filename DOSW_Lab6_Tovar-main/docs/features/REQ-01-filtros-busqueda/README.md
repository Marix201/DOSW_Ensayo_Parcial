# REQ-01 - Filtros y busqueda de tareas

## 1. Resumen
Filtra la lista por `status`, `priority` y texto `q` (titulo/descripcion, sin distinguir mayusculas) combinados con AND, con componente `TaskFilters` y boton Clear. Cubre HU-1, HU-2 y HU-3.

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
git checkout -b feature/REQ-01-filtros-busqueda
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-01-filtros-busqueda/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-01): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-01-filtros-busqueda`
2. **Modelo de datos**
   - Archivos: Sin cambios (el filtrado se hace en `TaskServiceImpl`)
   - Commit: `git add -` y `git commit -m "(sin commit)"`
3. **Backend**
   - Archivos: `TaskController.java` (@RequestParam status/priority/q), `TaskService(Impl).java` (findAll con filtros), `GlobalExceptionHandler.java` (MethodArgumentTypeMismatchException -> 400)
   - Commit: `git add backend/src/main` y `git commit -m "feat(REQ-01): filtros en GET /tasks"`
4. **Pruebas backend**
   - Archivos: `TaskControllerTest.java`, `TaskServiceTest.java`
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-01): pruebas de filtros"` y `git push -u origin feature/REQ-01-filtros-busqueda`
5. **Frontend e integracion**
   - Archivos: `components/TaskFilters.jsx` (nuevo), `TaskList.jsx` (mensaje sin resultados), `hooks/useTasks.js` (estado de filtros), `pages/TasksPage.jsx`, `api/taskApi.js` (getTasks(filters) con URLSearchParams), `index.css` (.task-filters)
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-01): UI de filtros"`
6. **Pruebas frontend**
   - Archivos: `TaskFilters.test.jsx` (nuevo), `TaskList.test.jsx`, `TasksPage.test.jsx` (el texto "Pending" ahora tambien esta en el select de filtros: la prueba existente se acoto a `within(listitem)`)
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-01): pruebas de filtros UI"` y `git push -u origin feature/REQ-01-filtros-busqueda`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-01): README"` y `git push -u origin feature/REQ-01-filtros-busqueda`

## 5. Modelo de datos
Sin cambios de modelo de datos ni scripts SQL.

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| GET | /api/v1/tasks | query opcional: `status` (PENDING|IN_PROGRESS|COMPLETED), `priority` (LOW|MEDIUM|HIGH), `q` (texto) | Lista de TaskResponse | 200; 400 `{status:400,message:"Invalid value 'FOO' for parameter 'status'"}` |

Ejemplos:
```bash
curl "http://localhost:8080/api/v1/tasks?status=PENDING&priority=HIGH&q=milk"
curl "http://localhost:8080/api/v1/tasks?status=FOO"   # 400
```

## 7. Conexion back - front
- Sin cambios de URL, CORS ni variables. `frontend/src/api/taskApi.js` sigue usando `VITE_API_URL` o `http://localhost:8080/api/v1/tasks`; solo anade query string.

## 8. Como ejecutar
```bash
docker start todo-postgres          # o ver README raiz para crearlo
# (sin scripts nuevos en esta rama; aplicar 001_create_schema.sql si la BD es nueva)
cd backend && ./mvnw spring-boot:run    # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## 9. Pruebas
```bash
cd backend && ./mvnw test        # TodoApplicationTests.contextLoads requiere PostgreSQL real
cd backend && ./mvnw test -Dtest='!TodoApplicationTests'   # solo las que no necesitan BD
cd frontend && npm test
```
Resultado real: backend 26 pruebas de TaskControllerTest/TaskServiceTest pasan (se excluye `TodoApplicationTests`, que ya fallaba en main por no haber PostgreSQL disponible); frontend 19/19 pasan. No se verifico E2E contra BD real.

## 10. Verificacion manual
- [ ] `?status=PENDING` solo devuelve PENDING.
- [ ] `?status=PENDING&priority=HIGH&q=x` aplica los tres filtros (AND).
- [ ] `q=MILK` encuentra "Buy milk" y descripciones.
- [ ] `?status=FOO` devuelve 400 con ErrorResponse.
- [ ] Clear vacia los filtros y recarga todo.
- [ ] Con filtros sin coincidencias se ve "No tasks match the current filters."; sin tareas y sin filtros, "No tasks yet."

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-01-filtros-busqueda` hacia `main` (`gh pr create --base main --head feature/REQ-01-filtros-busqueda`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskController.findAll`, `TaskService.findAll` y `TaskServiceImpl.findAll` (REQ-02 amplia la misma firma con sort/direction), `GlobalExceptionHandler`, `useTasks.js`, `TasksPage.jsx` (+ `TasksPage.test.jsx`), `TaskList.jsx`, `taskApi.js`, `index.css`, `TaskControllerTest`/`TaskServiceTest` (llamadas a `findAll`). Integrar despues de REQ-06 (REQ-06 anade `completedAt` a TaskResponse: revisar constructores en tests).
