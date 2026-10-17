# Jira (sin acceso a Jira: estructura lista para cargar, sin claves reales)
Epica: Mejoras de gestion de tareas (ToDo App). Feature: REQ-01 - Filtros y busqueda.

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| HU-1/HU-2 | Modelo de datos | Datos | Sin cambios de BD (documentado) | XS |
| HU-1/HU-2 | Parametros status/priority/q en controller y filtrado en service | Backend | AND, case-insensitive | M |
| HU-1 | Handler de MethodArgumentTypeMismatchException -> 400 | Backend | ErrorResponse | S |
| HU-3 | Componente TaskFilters + estado de filtros en useTasks | Frontend | Clear funciona | M |
| HU-3 | Mensaje de "sin resultados" en TaskList | Frontend | texto distinto | XS |
| Todas | taskApi.getTasks(filters) | Integracion | query string correcta | S |
| Todas | Pruebas backend y frontend | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
