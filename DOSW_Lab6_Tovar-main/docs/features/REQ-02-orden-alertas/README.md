# REQ-02 - Ordenamiento y alertas de tareas vencidas

## 1. Resumen
Ordena la lista con `sort`/`direction` (lista blanca `dueDate`, `priority`, `createdAt`, `title`; prioridad por rango LOW<MEDIUM<HIGH, sin dueDate al final, default `createdAt desc`) y muestra la etiqueta "Overdue" en tareas no completadas vencidas. Cubre HU-1 y HU-2.

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
git checkout -b feature/REQ-02-orden-alertas
```

## 4. Paso a paso de implementacion
1. **Analisis, Jira y diagramas**
   - Archivos: `docs/features/REQ-02-orden-alertas/{analisis,jira,diagramas}.md`
   - Commit: `git add docs` y `git commit -m "docs(REQ-02): analisis, Jira y diagramas"` y `git push -u origin feature/REQ-02-orden-alertas`
2. **Modelo de datos**
   - Archivos: Sin cambios (ordenamiento en `TaskServiceImpl`)
   - Commit: `git add -` y `git commit -m "(sin commit)"`
3. **Backend**
   - Archivos: `TaskController.java` (sort/direction), `TaskService(Impl).java` (comparadores), `exception/TaskQueryException.java` (nuevo), `GlobalExceptionHandler.java` (400)
   - Commit: `git add backend/src/main` y `git commit -m "feat(REQ-02): orden en GET /tasks"`
4. **Pruebas backend**
   - Archivos: `TaskControllerTest.java`, `TaskServiceTest.java`
   - Commit: `git add backend/src/test` y `git commit -m "test(REQ-02): pruebas de orden"` y `git push -u origin feature/REQ-02-orden-alertas`
5. **Frontend e integracion**
   - Archivos: `components/TaskSort.jsx` (nuevo), `utils/isOverdue.js` (nuevo), `TaskItem.jsx` (badge Overdue), `hooks/useTasks.js` (estado sort), `pages/TasksPage.jsx`, `api/taskApi.js` (getTasks(params)), `index.css` (.task-sort, .badge-overdue)
   - Commit: `git add frontend/src` y `git commit -m "feat(REQ-02): UI de orden y Overdue"`
6. **Pruebas frontend**
   - Archivos: `TaskSort.test.jsx`, `utils/isOverdue.test.js` (nuevos), `TaskList.test.jsx`, `TasksPage.test.jsx`
   - Commit: `git add frontend/src` y `git commit -m "test(REQ-02): pruebas UI"` y `git push -u origin feature/REQ-02-orden-alertas`
7. **README**
   - Archivos: este archivo
   - Commit: `git add docs` y `git commit -m "docs(REQ-02): README"` y `git push -u origin feature/REQ-02-orden-alertas`

## 5. Modelo de datos
Sin cambios de modelo de datos ni scripts SQL.

## 6. API
| Metodo | Ruta | Request | Response | Codigos |
|---|---|---|---|---|
| GET | /api/v1/tasks | query opcional: `sort` (dueDate|priority|createdAt|title), `direction` (asc|desc) | Lista de TaskResponse ordenada | 200; 400 `{status:400,message:"Invalid sort field 'foo'. Allowed: ..."}` |

Ejemplos:
```bash
curl "http://localhost:8080/api/v1/tasks?sort=priority&direction=desc"
curl "http://localhost:8080/api/v1/tasks?sort=foo"   # 400
```

## 7. Conexion back - front
- Sin cambios de URL, CORS ni variables. `frontend/src/api/taskApi.js` solo anade query string a `BASE_URL`.

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
Resultado real: backend 27 pruebas (TaskControllerTest 11 + TaskServiceTest 16) pasan, excluyendo `TodoApplicationTests` que ya fallaba en main (sin PostgreSQL disponible); frontend 23/23 pasan. No se verifico E2E contra BD real.

## 10. Verificacion manual
- [ ] Sin parametros: mas recientes primero.
- [ ] `sort=priority&direction=desc`: HIGH, MEDIUM, LOW.
- [ ] `sort=dueDate` en asc y desc: las tareas sin fecha quedan al final.
- [ ] `sort=foo` o `direction=up` devuelven 400.
- [ ] Tarea PENDING con fecha pasada muestra "Overdue"; COMPLETED no.
- [ ] Cambiar los selectores "Sort by"/"Direction" recarga la lista.

## 11. Diagramas actualizados
[diagramas.md](diagramas.md) (Mermaid; main no tenia diagramas previos, se crearon versiones minimas).

## 12. Problemas comunes
- Puerto 5432/8080/5173 ocupado: detener el proceso que lo usa o cambiar el puerto.
- `Unable to determine Dialect` / fallo de conexion: la base no esta levantada (`docker start todo-postgres`).
- `Schema-validation: missing column/table`: falta aplicar el script SQL de esta rama (`ddl-auto=validate`).
- Error CORS en el navegador: el backend solo permite el origen `http://localhost:5173`.

## 13. Integracion
- Abrir PR de `feature/REQ-02-orden-alertas` hacia `main` (`gh pr create --base main --head feature/REQ-02-orden-alertas`).
- Numeracion fija de scripts SQL: REQ-06 -> `002_add_completed_at.sql`, REQ-03 -> `003_create_categories.sql`.
- Orden de merge recomendado: REQ-06, REQ-01, REQ-02, REQ-04, REQ-05, REQ-03.
- Conflictos esperados: `TaskController.findAll`, `TaskService.findAll` y `TaskServiceImpl.findAll` (firma `findAll(sort, direction)` vs `findAll(status, priority, q)` de REQ-01: al integrar ambas la firma final debe combinar los cinco parametros), `GlobalExceptionHandler`, `useTasks.js`, `TasksPage.jsx`, `TasksPage.test.jsx`, `taskApi.js` (`getTasks` es identico en REQ-01 y REQ-02), `TaskItem.jsx`, `index.css`, `TaskControllerTest`/`TaskServiceTest`. Integrar despues de REQ-06 y REQ-01.
