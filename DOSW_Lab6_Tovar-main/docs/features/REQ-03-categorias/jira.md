# Jira (sin acceso a Jira: estructura lista para cargar, sin claves reales)
Epica: Mejoras de gestion de tareas (ToDo App). Feature: REQ-03 - Categorias.

| Historia | Tarea | Capa | Terminado cuando | Est. |
|---|---|---|---|---|
| HU-1/HU-2 | Script 003 (categories + tasks.category_id) y CategoryEntity/relacion en TaskEntity | Datos | script aplica y revierte | M |
| HU-1 | CategoryRepository, CategoryService(Impl), CategoryController, excepciones y handlers 404/409 | Backend | CRUD y reglas | L |
| HU-2 | categoryId en TaskCreate/UpdateRequest, category en TaskResponse | Backend | asigna/quita categoria | M |
| HU-2/HU-3 | taskApi (categorias), useTasks, selector en TaskForm, badge en TaskItem | Frontend | visible y editable | M |
| HU-3 | Componente CategoryManager | Frontend | crear/borrar con errores visibles | M |
| Todas | Pruebas backend y frontend (y ajuste de pruebas existentes por cambio de records) | Pruebas | suites verdes | M |
| Todas | Diagramas y README | Docs | publicados | S |
