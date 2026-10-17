# REQ-04 - Resumen / estadisticas de tareas

## Alcance
Entra: `GET /api/v1/tasks/summary` (sin chocar con `/{id}`) que devuelve `TaskSummaryResponse` (total, conteo por estado y por prioridad, vencidas, porcentaje completado) y componente `TaskSummary` que se refresca tras crear/editar/borrar.
Fuera: filtros y alertas visuales (REQ-01/02), acciones en lote (REQ-05).

## Supuestos / decisiones
- El resumen siempre cubre TODAS las tareas (no depende de filtros de la lista).
- `byStatus` y `byPriority` incluyen todas las claves de los enums con 0 cuando no hay tareas.
- Vencida: `dueDate` anterior a `LocalDate.now()` del servidor y estado distinto de COMPLETED.
- `completionPercentage` = COMPLETED / total * 100 redondeado a 1 decimal; 0.0 si no hay tareas (sin division por cero).
- Calculo en memoria en `TaskServiceImpl` (consistente con el resto de la app); sin cambios de BD.

## Historias de usuario
**HU-1** Como usuario, quiero ver un resumen de mis tareas, para conocer mi avance de un vistazo.
- Dado 4 tareas (1 COMPLETED), cuando GET summary, entonces `total=4`, `completionPercentage=25.0`.
- Dado tareas con distintos estados/prioridades, entonces los conteos por estado y prioridad coinciden y las claves sin tareas valen 0.
- Dado una tarea vencida no completada y otra completada con fecha pasada, entonces `overdue=1`.
- Dado ninguna tarea, entonces total=0, porcentaje 0.0 y respuesta 200.
- Dado GET `/api/v1/tasks/summary`, entonces no se interpreta "summary" como id (no hay 400/404).

**HU-2** Como usuario, quiero que el resumen se actualice al cambiar mis tareas, para no recargar la pagina.
- Dado el resumen visible, cuando creo, edito, cambio de estado o borro una tarea, entonces el resumen se recarga.
- Dado un fallo de la API, entonces se muestra el error y no se rompe la pagina.
