# Jira (sin acceso a Jira: estructura lista para cargar, sin claves reales)
Epica: Mejoras de gestion de tareas (ToDo App). Feature: REQ-05 - Acciones en lote.

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| Todas | Modelo de datos | Datos | Sin cambios de BD | XS |
| HU-1/HU-2 | TaskBatchRequest (@NotEmpty), service.deleteBatch/completeBatch transaccionales | Backend | 204/200/400/404 sin cambios parciales | M |
| HU-3 | service.deleteCompleted + DELETE /completed | Backend | solo COMPLETED | S |
| HU-1..3 | Funciones taskApi + hook (removeTasks, completeTasks, clearCompleted) | Integracion | recarga tras accion | S |
| HU-4 | Checkbox en TaskItem/TaskList, TaskBatchActions, confirmacion | Frontend | seleccion se limpia | M |
| Todas | Pruebas backend y frontend | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
