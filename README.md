# TaskFlow - Extensión del Proyecto Base

## Estudiante

**Nombre:** José Santos David Vega Acosta

## Descripción

Este proyecto corresponde a una ampliación del sistema **TaskFlow**, desarrollado para la materia de Programación Web.

Sobre la base del proyecto original se implementaron nuevas funcionalidades para mejorar la organización y administración de tareas, incorporando tanto cambios en el **backend** como en el **frontend**.

Las principales funcionalidades agregadas son:

* **Gestión de Categorías:** permite crear categorías personalizadas para clasificar tareas.
* **Gestión de Subtareas:** permite dividir una tarea en actividades más pequeñas y marcar su estado de completado.
* **Gestión de Proyectos:** permite agrupar tareas dentro de proyectos independientes para una mejor organización.

Todas las funcionalidades implementan operaciones CRUD (Crear, Consultar, Actualizar y Eliminar), validaciones, autenticación mediante JWT y su integración completa con la interfaz web.

---

# Funcionalidades implementadas

## 1. Categorías

Se agregó una entidad para administrar categorías de tareas.

Características:

* Crear categorías.
* Listar categorías del usuario autenticado.
* Editar categorías existentes.
* Eliminar categorías.
* Asociar categorías a tareas mediante una relación muchos a muchos.
* Evitar nombres duplicados para un mismo usuario.

## 2. Subtareas

Se incorporó un sistema de subtareas asociado a cada tarea.

Características:

* Crear subtareas para una tarea.
* Obtener el listado de subtareas.
* Editar subtareas.
* Marcar subtareas como completadas o pendientes.
* Eliminar subtareas.

Cada subtarea pertenece a una única tarea.

## 3. Proyectos

Se implementó una entidad para administrar proyectos.

Características:

* Crear proyectos.
* Listar proyectos del usuario.
* Modificar proyectos.
* Eliminar proyectos.
* Asociar tareas a un proyecto de forma opcional.

Cada proyecto pertenece al usuario autenticado.

---

# Estructura de las nuevas tablas

## Tabla `categories`

| Campo      | Tipo                 |
| ---------- | -------------------- |
| id         | SERIAL (PK)          |
| name       | VARCHAR(100)         |
| color      | VARCHAR(20)          |
| user_id    | INTEGER (FK → users) |
| created_at | TIMESTAMP            |

Además, existe un índice único para impedir categorías duplicadas por usuario.

---

## Tabla `task_categories`

Tabla intermedia para representar la relación muchos a muchos entre tareas y categorías.

| Campo       | Tipo                      |
| ----------- | ------------------------- |
| task_id     | INTEGER (FK → tasks)      |
| category_id | INTEGER (FK → categories) |

Su clave primaria está compuesta por `(task_id, category_id)`.

---

## Tabla `subtasks`

| Campo      | Tipo                 |
| ---------- | -------------------- |
| id         | SERIAL (PK)          |
| task_id    | INTEGER (FK → tasks) |
| title      | VARCHAR(255)         |
| completed  | BOOLEAN              |
| created_at | TIMESTAMP            |

Cada subtarea pertenece a una tarea.

---

## Tabla `projects`

| Campo       | Tipo                 |
| ----------- | -------------------- |
| id          | SERIAL (PK)          |
| name        | VARCHAR(150)         |
| description | TEXT                 |
| color       | VARCHAR(20)          |
| user_id     | INTEGER (FK → users) |
| created_at  | TIMESTAMP            |
| updated_at  | TIMESTAMP            |

Cada proyecto pertenece a un usuario.

---

## Modificación de la tabla `tasks`

Se añadió el campo:

| Campo      | Tipo                    |
| ---------- | ----------------------- |
| project_id | INTEGER (FK → projects) |

Esto permite asociar opcionalmente una tarea a un proyecto.

---

# Endpoints incorporados

## Categorías

* `GET /api/categories — Obtener TODAS las categorías del usuario`
* `GET /api/categories/:id — Obtener UNA categoría por su ID`
* `POST /api/categories — Crear una NUEVA categoría`
* `PUT /api/categories/:id — Actualizar una categoría existente`
* `DELETE /api/categories/:id — Eliminar una categoría`

---

## Subtareas

* `GET /api/tasks/:taskId/subtasks — Obtener subtareas de una tarea`
* `POST /api/tasks/:taskId/subtasks — Crear una subtarea`
* `POST /api/tasks/:taskId/subtasks/bulk — Crear varias subtareas a la vez`
* `PUT /api/subtasks/:id — Actualizar una subtarea`
* `DELETE /api/subtasks/:id — Eliminar una subtarea`

---

## Proyectos

* `GET /api/projects — Obtener todos los proyectos del usuario`
* `GET /api/projects/:id — Obtener un proyecto por ID`
* `POST /api/projects — Crear un proyecto`
* `PUT /api/projects/:id — Actualizar un proyecto`
* `DELETE /api/projects/:id — Eliminar un proyecto`
* `GET /api/projects/:id/tasks — Obtener tareas de un proyecto`

---

# Seguridad

Las rutas protegidas requieren autenticación mediante **JSON Web Token (JWT)**.

El backend incorpora:

* Validación del usuario autenticado.
* Manejo de errores mediante respuestas HTTP apropiadas.
* Protección de recursos para que cada usuario solo pueda acceder a su propia información.
* Validaciones de datos antes de realizar operaciones sobre la base de datos.

---

# Tecnologías utilizadas

## Backend

* Node.js
* Express.js
* PostgreSQL
* JSON Web Token (JWT)

## Frontend

* React
* Vite
* Axios

---

# Instalación y ejecución

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

## 2. Instalar dependencias

```bash
npm run install-all
```

o instalar las dependencias de `backend` y `frontend` por separado.

## 3. Configurar la base de datos

Crear una base de datos PostgreSQL e importar el script:

```
backend/database.sql
```

Además, configurar las variables de entorno necesarias para la conexión a la base de datos y la autenticación.

## 4. Ejecutar el proyecto

Desde la raíz:

```bash
npm run dev
```

Este comando inicia simultáneamente el backend y el frontend.

---

# Resumen

La solución amplía el proyecto original incorporando un sistema completo de **Categorías**, **Subtareas** y **Proyectos**, con integración entre frontend y backend, persistencia en PostgreSQL, autenticación mediante JWT y operaciones CRUD completas para cada nueva funcionalidad.
