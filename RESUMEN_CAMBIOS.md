# Resumen de Cambios para Estudiantes - TaskFlow

Este documento resume las mejoras y cambios técnicos implementados en el proyecto TaskFlow para mejorar la seguridad, el rendimiento y la experiencia de usuario.

## 1. Autenticación y Seguridad Avanzada

### Silent Refresh con Cola de Peticiones (Mecanismo Robustecido)
Se ha mejorado el `axiosClient.js` para manejar la expiración del token de acceso de forma invisible para el usuario:
- **Interceptor de Respuestas:** Ahora detecta errores 401 (Token expirado) y 403 (Token inválido).
- **Mecanismo de Cola (Queue):** Si se disparan múltiples peticiones simultáneas cuando el token expira, solo se realiza una llamada de "refresh". Las demás peticiones se encolan y se ejecutan automáticamente una vez obtenido el nuevo token.
- **Cierre de Sesión Global:** Si el token de refresco también expira, el sistema invoca automáticamente la función de `logout` del `AuthContext`, limpiando el estado de la aplicación sin recargar la página bruscamente.

### Validación de Sesión Remota (SID)
Se ha implementado una capa extra de seguridad en el backend:
- El `accessToken` ahora incluye un `sid` (Session ID).
- El middleware de autenticación verifica en cada petición si ese `sid` sigue existiendo en la base de datos (tabla `refresh_tokens`).
- **Beneficio:** Esto permite revocar sesiones inmediatamente desde el servidor (por ejemplo, si un usuario cierra sesión o si un administrador fuerza la salida), invalidando el token de acceso incluso antes de que expire.

### Sistema de Roles
- Se añadió la columna `role` a la tabla de usuarios (por defecto 'user').
- El rol se incluye en el payload del JWT para que el frontend pueda tomar decisiones de interfaz rápidamente.
- Implementación de `RoleGuard` en el frontend para proteger rutas específicas (ej. `/admin`).

## 2. Optimizaciones en el Frontend (React)

### Uso de `useCallback`
Se han envuelto los manejadores de eventos y funciones de los hooks (`useTasks.js`) y componentes (`HomePage.jsx`) en `useCallback`.
- **Por qué:** Esto evita que las funciones se vuelvan a crear en cada renderizado, lo cual es crítico cuando estas funciones se pasan como "props" a componentes hijos que usan `React.memo`, mejorando significativamente el rendimiento.

### Estructura de Rutas y Navegación
- Se agregaron nuevas páginas: `AdminDashboard` y `ProfilePage`.
- Se organizaron las rutas en `App.jsx` diferenciando entre Rutas Públicas, Rutas Protegidas y Rutas de Administrador.
- **Header dinámico:** El menú de navegación ahora muestra opciones según el estado de autenticación y el rol del usuario (ej. el botón "Admin" solo es visible para administradores).

### Lógica de Búsqueda Mejorada
- Se optimizó el componente `TaskSearchById` para manejar actualizaciones en tiempo real. Ahora utiliza un sistema de "triggers" con marcas de tiempo para refrescar la información de una tarea específica sin afectar el rendimiento global de la aplicación.

## 3. Mejoras en el Backend (Node.js & Postgres)

### Queries SQL Robustas
- En `taskController.js`, la actualización de tareas ahora usa casting explícito (`::task_status`, `::task_priority`) para asegurar la compatibilidad con los tipos ENUM de Postgres.
- Se mejoró la lógica de `COALESCE` para manejar correctamente strings vacíos o valores undefined enviados desde el frontend.

### Gestión de Tiempos
- Se migró el cálculo de expiración de tokens al motor de base de datos usando `CURRENT_TIMESTAMP + INTERVAL '1 hour'`, evitando discrepancias de zona horaria entre el servidor de aplicaciones y la base de datos.

## 4. Configuración de Red y Despliegue
- **Soporte Multi-Origen (CORS):** El backend ahora permite configurar múltiples URLs en `FRONTEND_URL` separadas por comas. Esto permite que la aplicación funcione simultáneamente en `localhost` y en IPs de red local (ej. `172.26.4.3`).
- **Configuración de Host (Backend):** Se añadió la variable `HOST` al archivo `.env` para permitir especificar en qué interfaz de red debe escuchar el servidor (por defecto `0.0.0.0` para mayor compatibilidad).
- **Acceso Externo (Frontend):** Se configuró Vite (`vite.config.js`) con `server: { host: true }`. Esto permite que el frontend sea accesible desde otros dispositivos en la misma red usando la IP de la máquina (ej. `http://172.26.4.3:5173`).
- **Conectividad Inteligente (Frontend):** Se mejoró el `axiosClient.js` con una lógica de detección dinámica. Si no se especifica una URL de API en el `.env`, el sistema detecta automáticamente si el usuario accede mediante una IP (ej. `172.26.4.3`) y ajusta la conexión al servidor de API en la misma IP, facilitando las pruebas sin cambiar configuraciones.
- **Variables de Entorno Flexibles:** Se actualizaron los archivos `.env` del frontend para facilitar el cambio de la `VITE_API_URL` cuando sea necesario un control manual.

## 5. Cambios en Base de Datos
- **Archivo `database.sql`:** Actualizado para incluir la columna `role` en la tabla `users`.
- **Archivo `.env.template`:** Actualizado con ejemplos de claves secretas más seguras y configuraciones recomendadas.

---
*Nota: Asegúrate de ejecutar `npm run install-all` y actualizar tu base de datos con el nuevo archivo `database.sql` para aplicar estos cambios.*
