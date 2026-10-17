# REQ-05 - Acciones en lote

## Alcance
Entra: borrado en lote, completar en lote y "Clear completed" (solo COMPLETED); validaciones (lista vacia -> 400, id inexistente -> 404 sin cambios parciales); casillas de seleccion en la UI, confirmacion antes de borrar, seleccion que se limpia tras la accion.
Fuera: filtros/orden (otros REQ), deshacer.

## Supuestos / decisiones
- Rutas: `POST /api/v1/tasks/batch/delete`, `POST /api/v1/tasks/batch/complete` (body `{"ids":[...]}`) y `DELETE /api/v1/tasks/completed`. Se usa POST con body para el borrado en lote porque DELETE con body no es fiable en todos los clientes/proxies.
- Los ids duplicados se ignoran (se tratan como un conjunto).
- Todo es `@Transactional`: primero se validan todos los ids y luego se aplica; si falta alguno se lanza `TaskNotFoundException` (404) sin tocar nada.
- Completar en lote sobre una tarea ya COMPLETED es idempotente.
- La seleccion solo contiene tareas visibles en la lista; tras cualquier accion o recarga se descartan ids no visibles.
- Sin cambios de BD. Nota de integracion: si se integra REQ-06, "completar en lote" debe fijar `completedAt` (usar el helper `applyStatus`).

## Historias de usuario
**HU-1** Como usuario, quiero borrar varias tareas a la vez, para limpiar mi lista rapido.
- Dado ids existentes, cuando POST batch/delete, entonces 204 y todas desaparecen.
- Dado `ids` vacio o ausente, entonces 400 con `ErrorResponse`.
- Dado un id inexistente entre los ids, entonces 404 y ninguna tarea se borra.
- Dado la UI, cuando pulso "Delete selected", entonces se pide confirmacion; si cancelo no se borra nada.

**HU-2** Como usuario, quiero completar varias tareas a la vez, para avanzar mas rapido.
- Dado ids existentes, cuando POST batch/complete, entonces 200 con las tareas en COMPLETED.
- Dado un id inexistente, entonces 404 y ninguna cambia.

**HU-3** Como usuario, quiero "Clear completed", para eliminar solo lo terminado.
- Dado tareas de varios estados, cuando DELETE /completed, entonces solo se borran las COMPLETED (204, tambien si no hay ninguna).

**HU-4** Como usuario, quiero seleccionar tareas con casillas, para operar sobre ellas.
- Dado la lista visible, cuando marco casillas o "Select all", entonces el contador refleja la seleccion; tras una accion la seleccion queda vacia.
- Dado cero seleccionadas, entonces los botones de lote para seleccion estan deshabilitados.
