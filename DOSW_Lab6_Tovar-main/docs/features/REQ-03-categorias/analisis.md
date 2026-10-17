# REQ-03 - Categorias de tareas

## Alcance
Entra: entidad `CategoryEntity` (nombre unico, max. 50), relacion opcional many-to-one desde `TaskEntity`, CRUD en `/api/v1/categories`, asignar categoria al crear/editar tareas (`categoryId`), selector en `TaskForm`, gestion simple de categorias y badge en `TaskItem`, script `database/003_create_categories.sql`.
Fuera: filtrar tareas por categoria (no pedido), colores/iconos.

## Reglas de negocio y decisiones
- Nombre obligatorio, se recorta (trim), max. 50 caracteres, unico sin distinguir mayusculas (tambien `UNIQUE` en BD). Duplicado -> 409.
- Id de categoria inexistente (en `/categories/{id}` o como `categoryId` de una tarea) -> 404.
- **Borrar una categoria en uso -> 409** (`Category with id N is assigned to tasks and cannot be deleted`). No se reasignan ni se borran tareas en cascada: el usuario debe reasignarlas antes. Probado en `CategoryServiceTest` y `CategoryControllerTest`.
- `categoryId` es opcional en create/update; `null` quita la categoria. Las tareas existentes quedan sin categoria (`category_id` NULL).
- `TaskResponse` incluye `category: {id, name}` (o `null`). Cambia la firma de los records `TaskCreateRequest`, `TaskUpdateRequest` y `TaskResponse` (se actualizaron las pruebas existentes).
- Numeracion SQL fija: REQ-06 usa `002_add_completed_at.sql`, esta rama usa `003_create_categories.sql` (independiente de 002: solo toca `categories` y `tasks.category_id`).

## Historias de usuario
**HU-1** Como usuario, quiero crear, renombrar y borrar categorias, para organizar mis tareas.
- Dado un nombre valido, cuando POST /categories, entonces 201 con id y nombre.
- Dado un nombre vacio o de mas de 50 caracteres, entonces 400.
- Dado un nombre ya existente (cualquier capitalizacion), entonces 409.
- Dado un id inexistente en GET/PUT/DELETE, entonces 404.
- Dado una categoria asignada a tareas, cuando DELETE, entonces 409 y no se borra.

**HU-2** Como usuario, quiero asignar una categoria a una tarea, para clasificarla.
- Dado un categoryId valido, cuando creo/edito una tarea, entonces la respuesta incluye la categoria y el item muestra su badge.
- Dado `categoryId` null u omitido, entonces la tarea queda sin categoria.
- Dado un categoryId inexistente, entonces 404 y no se guarda la tarea.

**HU-3** Como usuario, quiero gestionar categorias desde la pagina, para no usar herramientas externas.
- Dado el panel "Categories", cuando agrego un nombre, entonces aparece en la lista y en el selector del formulario.
- Dado un error del servidor (p. ej. 409), entonces se muestra el mensaje.
