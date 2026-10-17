# REQ-04 - Resumen / estadisticas de tareas

## 1. Resumen
Endpoint `GET /api/v1/tasks/summary` con total, conteo por estado y prioridad, vencidas (excluye completadas) y porcentaje completado (0.0 sin tareas) y componente `TaskSummary` que se refresca tras crear/editar/borrar. Cubre HU-1 y HU-2.

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
git checkout -b feature/REQ-04-resumen
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-04-resumen/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-04): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-04-resumen`
2. **Modelo de datos**
   - Archivos: Sin cambios (calculo en `TaskServiceImpl`)
   - Commit: `git add -` y `git commit -m "(sin commit)"`
3. **Backend**
   - Archivos: `dto/TaskSummaryResponse.java` (nuevo), `TaskService(Impl).java` (getSummary), `TaskController.java` (GET /summary declarado antes de /{id})
   - Commit: `git add backend/src/main` y `git commit -m "feat(REQ-04): endpoint de resumen"`
4. **Pruebas backend**
   - Archivos: `TaskControllerTest.java`, `TaskServiceTest.java`
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-04): pruebas de resumen"` y `git push -u origin feature/REQ-04-resumen`
5. **Frontend e integracion**
   - Archivos: `components/TaskSummary.jsx` (nuevo), `api/taskApi.js` (getTaskSummary), `hooks/useTasks.js` (summary se recarga dentro de loadTasks), `pages/TasksPage.jsx`, `index.css` (.task-summary, .badge-overdue)
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-04): UI de resumen"`
6. **Pruebas frontend**
   - Archivos: `TaskSummary.test.jsx` (nuevo), `TasksPage.test.jsx` (mock de getTaskSummary y prueba de refresco)
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-04): pruebas UI"` y `git push -u origin feature/REQ-04-resumen`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-04): README"` y `git push -u origin feature/REQ-04-resumen`

## 5. Modelo de datos
Sin cambios de modelo de datos ni scripts SQL.

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| GET | /api/v1/tasks/summary | - | `{total, byStatus:{PENDING,IN_PROGRESS,COMPLETED}, byPriority:{LOW,MEDIUM,HIGH}, overdue, completionPercentage}` | 200 |

Ejemplos:
```bash
curl http://localhost:8080/api/v1/tasks/summary
```

## 7. Conexion back - front
- Sin cambios de URL, CORS ni variables. `frontend/src/api/taskApi.js`: nueva `getTaskSummary()` sobre `${BASE_URL}/summary`.

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
Resultado real: backend 22 pruebas (TaskControllerTest 10 + TaskServiceTest 12) pasan, excluyendo `TodoApplicationTests` que ya fallaba en main (sin PostgreSQL disponible); frontend 17/17 pasan. No se verifico E2E contra BD real.

## 10. Verificacion manual
- [ ] Con 4 tareas y 1 completada: total 4 y 25%.
- [ ] Sin tareas: total 0 y 0% sin errores.
- [ ] Una tarea vencida pendiente cuenta en Overdue; una completada con fecha pasada no.
- [ ] GET /summary no responde 400/404 por confundirse con un id.
- [ ] Crear, editar, cambiar estado o borrar actualiza el resumen sin recargar la pagina.

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-04-resumen` hacia `main` (`gh pr create --base main --head feature/REQ-04-resumen`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskController`, `TaskService(Impl)` (anaden metodos en el mismo bloque), `useTasks.js` (loadTasks y return), `TasksPage.jsx`, `TasksPage.test.jsx` (mock de taskApi y beforeEach), `taskApi.js`, `index.css` (.badge-overdue se define igual en REQ-02: resolver dejando una sola copia), `TaskControllerTest`/`TaskServiceTest`. Integrar despues de REQ-06, REQ-01 y REQ-02.
