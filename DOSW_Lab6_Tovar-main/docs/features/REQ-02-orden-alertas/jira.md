# Jira (sin acceso a Jira: estructura lista para cargar, sin claves reales)
Epica: Mejoras de gestion de tareas (ToDo App). Feature: REQ-02 - Orden y alertas.

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| HU-1 | Modelo de datos | Datos | Sin cambios de BD | XS |
| HU-1 | Parametros sort/direction + comparadores en service | Backend | prioridad por rango, nulls al final, default createdAt desc | M |
| HU-1 | TaskQueryException + handler 400 | Backend | ErrorResponse | S |
| HU-1 | Componente TaskSort + estado en useTasks | Frontend | cambia el orden y recarga | M |
| HU-2 | Util isOverdue + etiqueta en TaskItem | Frontend | solo no completadas vencidas | S |
| Todas | taskApi.getTasks(params) | Integracion | query string correcta | S |
| Todas | Pruebas backend y frontend | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
