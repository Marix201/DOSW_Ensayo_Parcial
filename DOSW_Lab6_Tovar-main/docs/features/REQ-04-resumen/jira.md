# Jira (sin acceso a Jira: estructura lista para cargar, sin claves reales)
Epica: Mejoras de gestion de tareas (ToDo App). Feature: REQ-04 - Resumen de tareas.

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| HU-1 | Modelo de datos | Datos | Sin cambios de BD | XS |
| HU-1 | TaskSummaryResponse + service.getSummary + GET /summary | Backend | conteos y % correctos, 0 sin tareas | M |
| HU-2 | getTaskSummary en taskApi + estado summary en useTasks | Integracion | se recarga tras cada cambio | S |
| HU-2 | Componente TaskSummary | Frontend | muestra total, estados, prioridades, vencidas, % | S |
| Todas | Pruebas backend y frontend | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
