# Jira (no hay acceso a Jira en la sesion: estructura lista para cargar; no hay claves reales)

Epica: Mejoras de gestion de tareas (ToDo App) - compartida por REQ-01..REQ-06
Feature: REQ-06 - Estado directo y completedAt

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| HU-1 PATCH de estado | Columna completed_at + script 002 | Datos | script aplica y revierte | S |
| HU-1 | TaskStatusUpdateRequest, service.updateStatus, controller PATCH | Backend | 200/400/404 | M |
| HU-3 | Anadir PATCH en WebConfig | Backend | CORS permite PATCH | XS |
| HU-1 | updateTaskStatus en taskApi + useTasks.changeStatus | Frontend | boton usa PATCH | S |
| HU-2 completedAt | Logica de coherencia en create/update/patch | Backend | tests unitarios verdes | S |
| HU-2 | "Completed on" en TaskItem | Frontend | visible solo si completedAt | XS |
| Todas | Pruebas backend/frontend, ajustar TasksPage.test | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
