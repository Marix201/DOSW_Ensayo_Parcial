# REQ-01 - Filtros y busqueda de tareas

## Alcance
Entra: parametros opcionales `status`, `priority`, `q` en `GET /api/v1/tasks` combinados con AND; 400 con `ErrorResponse` si `status`/`priority` son invalidos; componente `TaskFilters` con boton "Clear"; mensaje distinto cuando no hay resultados por filtros.
Fuera: orden, paginacion, categorias.

## Supuestos / decisiones
- Filtrado en memoria en `TaskServiceImpl` (el volumen de una ToDo app es pequeno; es testeable sin BD y evita problemas de parametros nulos en consultas JPQL/PostgreSQL). No requiere cambios de BD.
- `q` se busca en titulo y descripcion, sin distinguir mayusculas, por subcadena; `q` vacio o en blanco se ignora.
- Los filtros se aplican al escribir/seleccionar (sin boton "Apply").

## Historias de usuario
**HU-1** Como usuario, quiero filtrar por estado y prioridad, para ver solo lo relevante.
- Dado tareas con distintos estados, cuando `GET /tasks?status=PENDING`, entonces solo las PENDING.
- Dado `status=PENDING&priority=HIGH`, entonces solo las que cumplen ambos.
- Dado `status=FOO`, entonces 400 con `ErrorResponse`.

**HU-2** Como usuario, quiero buscar texto en titulo o descripcion, para encontrar una tarea rapido.
- Dado una tarea "Buy Milk", cuando `q=milk`, entonces aparece (sin distinguir mayusculas).
- Dado `q` que coincide solo con la descripcion, entonces aparece.
- Dado `q` en blanco, entonces se devuelven todas.

**HU-3** Como usuario, quiero limpiar los filtros y distinguir "sin tareas" de "sin resultados".
- Dado filtros activos, cuando pulso Clear, entonces se vacian y se recarga la lista completa.
- Dado filtros activos sin coincidencias, entonces se muestra "No tasks match the current filters." (y "No tasks yet." si no hay filtros).
