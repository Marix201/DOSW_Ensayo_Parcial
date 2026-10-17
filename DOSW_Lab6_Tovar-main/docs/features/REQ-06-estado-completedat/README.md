# REQ-06 - Cambio de estado directo y completedAt

## 1. Resumen
Permite cambiar el estado con `PATCH /api/v1/tasks/{id}/status` (body solo `status`) y registra `completedAt` al completar. Cubre HU-1, HU-2 y HU-3.

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
git checkout -b feature/REQ-06-estado-completedat
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-06-estado-completedat/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-06): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-06-estado-completedat`
2. **Modelo de datos**
   - Archivos: `database/002_add_completed_at.sql`, `TaskEntity.java` (campo completedAt)
   - Commit: `git add database backend` y `git commit -m "feat(REQ-06): ..."`
3. **Backend**
   - Archivos: `TaskStatusUpdateRequest.java` (nuevo), `TaskResponse.java`, `TaskService(Impl).java`, `TaskController.java`, `WebConfig.java` (anade PATCH)
   - Commit: `git add backend` y `git commit -m "feat(REQ-06): PATCH de estado y completedAt"`
4. **Pruebas backend**
   - Archivos: `TaskControllerTest.java`, `TaskServiceTest.java`
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-06): pruebas backend"` y `git push -u origin feature/REQ-06-estado-completedat`
5. **Frontend e integracion**
   - Archivos: `frontend/src/api/taskApi.js` (updateTaskStatus), `hooks/useTasks.js` (changeStatus), `pages/TasksPage.jsx`, `components/TaskItem.jsx` ("Completed on")
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-06): UI de estado y completedAt"`
6. **Pruebas frontend**
   - Archivos: `TasksPage.test.jsx` (ajustada para usar updateTaskStatus), `TaskList.test.jsx`
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-06): pruebas frontend"` y `git push -u origin feature/REQ-06-estado-completedat`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-06): README"` y `git push -u origin feature/REQ-06-estado-completedat`

## 5. Modelo de datos
Script `database/002_add_completed_at.sql`: `ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP;` (nullable, compatible hacia atras) y backfill de tareas COMPLETED con `created_at` (aproximacion). Aplicar: `docker cp database/002_add_completed_at.sql todo-postgres:/002.sql && docker exec -i todo-postgres psql -U todo_user -d todo_db -f /002.sql`. Revertir: `ALTER TABLE tasks DROP COLUMN completed_at;`.

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| PATCH | /api/v1/tasks/{id}/status | `{"status":"COMPLETED"}` | TaskResponse (con `completedAt`) | 200, 400 (status ausente/invalido), 404 |
| GET/POST/PUT | /api/v1/tasks... | sin cambios | TaskResponse ahora incluye `completedAt` | sin cambios |

Ejemplos:
```bash
curl -X PATCH http://localhost:8080/api/v1/tasks/1/status -H "Content-Type: application/json" -d '{"status":"COMPLETED"}'
```

## 7. Conexion back - front
- `backend/.../config/WebConfig.java`: `allowedMethods("GET","POST","PUT","DELETE","OPTIONS")` pasa a incluir `"PATCH"` (sin esto el navegador bloquea el preflight).
- `frontend/src/api/taskApi.js`: nueva funcion `updateTaskStatus` sobre la misma `BASE_URL` (`VITE_API_URL` o `http://localhost:8080/api/v1/tasks`). Sin cambios de proxy ni variables.

## 8. Como ejecutar
```bash
docker start todo-postgres          # o ver README raiz para crearlo
docker cp database/002_add_completed_at.sql todo-postgres:/002.sql && docker exec -i todo-postgres psql -U todo_user -d todo_db -f /002.sql
cd backend && ./mvnw spring-boot:run    # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## 9. Pruebas
```bash
cd backend && ./mvnw test        # TodoApplicationTests.contextLoads requiere PostgreSQL real
cd backend && ./mvnw test -Dtest='!TodoApplicationTests'   # solo las que no necesitan BD
cd frontend && npm test
```
Resultado real en esta rama: backend 30 pruebas, 29 pasan, 1 falla (`TodoApplicationTests.contextLoads`, ya fallaba en main: no hay PostgreSQL/Docker disponible en el entorno); frontend 14/14 pasan. No se verifico el flujo E2E contra BD real.

## 10. Verificacion manual
- [ ] PATCH a IN_PROGRESS devuelve 200 y refleja el estado.
- [ ] PATCH sin body valido devuelve 400; id inexistente 404.
- [ ] Al completar una tarea aparece "Completed on AAAA-MM-DD".
- [ ] Al reabrirla desaparece el texto y `completedAt` es null.
- [ ] Desde el navegador (5173) el boton "Change status" funciona sin error CORS.

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-06-estado-completedat` hacia `main` (`gh pr create --base main --head feature/REQ-06-estado-completedat`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskController`, `TaskServiceImpl`, `TaskEntity`, `TaskResponse` (record: otras ramas que construyan TaskResponse/tests deberan anadir el argumento `completedAt`), `TaskService`, `taskApi.js`, `useTasks.js`, `TasksPage.jsx`, `TasksPage.test.jsx`, `TaskControllerTest`, `TaskServiceTest`. Esta rama debe integrarse primero.
