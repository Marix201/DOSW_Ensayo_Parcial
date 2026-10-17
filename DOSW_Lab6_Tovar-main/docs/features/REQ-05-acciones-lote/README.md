# REQ-05 - Acciones en lote

## 1. Resumen
Borrar y completar varias tareas a la vez y "Clear completed" (solo COMPLETED), de forma transaccional (todo o nada), con casillas de seleccion limitadas a lo visible, confirmacion para borrar y seleccion que se limpia tras la accion. Cubre HU-1 a HU-4.

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
git checkout -b feature/REQ-05-acciones-lote
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-05-acciones-lote/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-05): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-05-acciones-lote`
2. **Modelo de datos**
   - Archivos: Sin cambios
   - Commit: `git add -` y `git commit -m "(sin commit)"`
3. **Backend**
   - Archivos: `dto/TaskBatchRequest.java` (nuevo, `@NotEmpty ids`), `TaskService(Impl).java` (deleteBatch, completeBatch, deleteCompleted, `@Transactional`), `TaskController.java`
   - Commit: `git add backend/src/main` y `git commit -m "feat(REQ-05): endpoints de lote"`
4. **Pruebas backend**
   - Archivos: `TaskControllerTest.java`, `TaskServiceTest.java`
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-05): pruebas de lote"` y `git push -u origin feature/REQ-05-acciones-lote`
5. **Frontend e integracion**
   - Archivos: `components/TaskBatchActions.jsx` (nuevo), `TaskItem.jsx` y `TaskList.jsx` (checkbox), `hooks/useTasks.js` (removeTasks, completeTasks, clearCompleted), `pages/TasksPage.jsx` (seleccion y window.confirm), `api/taskApi.js` (deleteTasks, completeTasks, deleteCompletedTasks), `index.css` (.task-batch)
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-05): UI de acciones en lote"`
6. **Pruebas frontend**
   - Archivos: `TaskBatchActions.test.jsx` (nuevo), `TaskList.test.jsx`, `TasksPage.test.jsx`
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-05): pruebas UI"` y `git push -u origin feature/REQ-05-acciones-lote`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-05): README"` y `git push -u origin feature/REQ-05-acciones-lote`

## 5. Modelo de datos
Sin cambios de modelo de datos ni scripts SQL.

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| POST | /api/v1/tasks/batch/delete | `{"ids":[1,2]}` | - | 204; 400 (ids vacio/ausente); 404 (algun id no existe, sin cambios) |
| POST | /api/v1/tasks/batch/complete | `{"ids":[1,2]}` | Lista de TaskResponse con status COMPLETED | 200; 400; 404 (sin cambios) |
| DELETE | /api/v1/tasks/completed | - | - | 204 (borra solo COMPLETED; tambien si no hay ninguna) |

Ejemplos:
```bash
curl -X POST http://localhost:8080/api/v1/tasks/batch/delete -H "Content-Type: application/json" -d '{"ids":[1,2]}'
curl -X POST http://localhost:8080/api/v1/tasks/batch/complete -H "Content-Type: application/json" -d '{"ids":[3]}'
curl -X DELETE http://localhost:8080/api/v1/tasks/completed
```

## 7. Conexion back - front
- Sin cambios de URL, CORS ni variables (POST y DELETE ya estaban permitidos en `WebConfig`). `taskApi.js` usa `${BASE_URL}/batch/...` y `${BASE_URL}/completed`.

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
Resultado real: backend 30 pruebas (TaskControllerTest 16 + TaskServiceTest 14) pasan, excluyendo `TodoApplicationTests` que ya fallaba en main (sin PostgreSQL disponible); frontend 22/22 pasan. La atomicidad real (rollback en BD) solo se probo con mocks: se valida que el service no llama a delete/save si falta un id; no se verifico contra PostgreSQL.

## 10. Verificacion manual
- [ ] Marcar varias casillas actualiza "N selected"; "Select all" marca todas las visibles.
- [ ] "Delete selected" pide confirmacion; cancelar no borra.
- [ ] POST batch/delete con ids vacio devuelve 400; con un id inexistente 404 y no se borra ninguna.
- [ ] "Complete selected" deja las tareas en Completed.
- [ ] "Clear completed" borra solo las COMPLETED.
- [ ] Tras cualquier accion la seleccion queda en 0.

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-05-acciones-lote` hacia `main` (`gh pr create --base main --head feature/REQ-05-acciones-lote`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskController`, `TaskService(Impl)` (metodos nuevos en el mismo bloque), `TaskItem.jsx`, `TaskList.jsx`, `useTasks.js`, `TasksPage.jsx`, `TasksPage.test.jsx` (mock de taskApi), `taskApi.js`, `index.css`, `TaskControllerTest`/`TaskServiceTest`. Con REQ-06 integrado: `completeBatch` debe usar `applyStatus` para fijar `completedAt`. Con REQ-03 no hay solape funcional. Integrar despues de REQ-06, REQ-01, REQ-02 y REQ-04.
