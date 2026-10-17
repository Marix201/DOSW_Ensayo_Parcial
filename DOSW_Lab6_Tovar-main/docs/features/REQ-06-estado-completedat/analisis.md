# REQ-06 - Cambio de estado directo y fecha de finalizacion (completedAt)

## Alcance
Entra: endpoint `PATCH /api/v1/tasks/{id}/status`, campo `completedAt` en `tasks`, coherencia de `completedAt` en create/update/patch, CORS para PATCH, boton "Change status" usando el PATCH, texto "Completed on ..." en `TaskItem`, script `database/002_add_completed_at.sql`.
Fuera: filtros, orden, categorias, resumen y lote (otros REQ).

## Supuestos
- `completedAt` se fija con `LocalDateTime.now()` solo al pasar de un estado distinto de COMPLETED a COMPLETED; si ya estaba COMPLETED se conserva.
- Al salir de COMPLETED se pone en `null`.
- Tareas COMPLETED existentes se rellenan con `created_at` en la migracion (valor aproximado, la fecha real se desconoce).
- `create` siempre crea en PENDING, por tanto `completedAt = null`.

## Historias de usuario
**HU-1** Como usuario, quiero cambiar el estado de una tarea con una sola llamada, para no reenviar todos sus campos.
- Dado una tarea PENDING, cuando hago PATCH status=IN_PROGRESS, entonces responde 200 y la tarea tiene ese estado.
- Dado un body sin status o con valor invalido, entonces 400 ErrorResponse.
- Dado un id inexistente, entonces 404 ErrorResponse.

**HU-2** Como usuario, quiero ver cuando se completo una tarea, para llevar registro de mi avance.
- Dado una tarea no completada, cuando pasa a COMPLETED, entonces `completedAt` queda con la fecha/hora actual y la UI muestra "Completed on <fecha>".
- Dado una tarea COMPLETED, cuando cambia a otro estado, entonces `completedAt` es null y no se muestra el texto.
- Dado un PUT con status COMPLETED (o que saca de COMPLETED), entonces `completedAt` es coherente igual que en el PATCH.

**HU-3** Como desarrollador frontend, quiero que CORS permita PATCH, para que el navegador pueda llamar al endpoint.
- Dado una peticion desde http://localhost:5173, cuando se envia PATCH, entonces no es bloqueada por CORS.
