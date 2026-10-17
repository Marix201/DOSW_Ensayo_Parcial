# REQ-02 - Ordenamiento y alertas de tareas vencidas

## Alcance
Entra: parametros `sort` y `direction` en `GET /api/v1/tasks` (lista blanca `dueDate`, `priority`, `createdAt`, `title`; `asc`/`desc`), prioridad ordenada por rango LOW<MEDIUM<HIGH, tareas sin `dueDate` siempre al final, 400 con `ErrorResponse` ante valores invalidos, orden por defecto `createdAt desc`, selector de orden en la UI y etiqueta "Overdue".
Fuera: filtros (REQ-01), resumen de vencidas (REQ-04).

## Supuestos / decisiones
- Ordenamiento en memoria en `TaskServiceImpl` (prioridad se guarda como texto; ordenar alfabeticamente seria incorrecto).
- `sort` es sensible a mayusculas (lista blanca exacta); `direction` acepta `asc`/`desc` sin distinguir mayusculas.
- Si se envia `sort` sin `direction` se usa `asc`; si se envia `direction` sin `sort` se ordena por `createdAt`.
- "Overdue" se calcula en el frontend (`isOverdue`): `dueDate` anterior a hoy (fecha local) y estado distinto de COMPLETED. Sin cambios en `TaskResponse` ni BD.

## Historias de usuario
**HU-1** Como usuario, quiero ordenar por fecha limite, prioridad, creacion o titulo, para organizar mi trabajo.
- Dado tareas con prioridades LOW/MEDIUM/HIGH, cuando `sort=priority&direction=desc`, entonces HIGH, MEDIUM, LOW (no alfabetico).
- Dado tareas con y sin dueDate, cuando `sort=dueDate` (asc o desc), entonces las sin fecha quedan al final.
- Dado `sort=foo` o `direction=up`, entonces 400 con `ErrorResponse`.
- Dado ningun parametro, entonces orden `createdAt` descendente.

**HU-2** Como usuario, quiero ver una etiqueta "Overdue" en tareas vencidas, para priorizarlas.
- Dado tarea PENDING/IN_PROGRESS con dueDate pasada, entonces muestra "Overdue".
- Dado tarea COMPLETED con dueDate pasada, entonces no muestra "Overdue".
- Dado tarea sin dueDate o con fecha futura/hoy, entonces no muestra "Overdue".
