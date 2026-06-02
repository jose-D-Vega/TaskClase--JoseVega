# TaskFlow System

Este proyecto utiliza una arquitectura de microservicios con un Backend (Node.js/Express) y un Frontend (React/Vite).

## Requisitos Previos

- Node.js instalado
- Base de Datos PostgreSQL configurada (ver `backend/.env`)

## Inicio Rápido

Para levantar ambos servicios (Backend y Frontend) simultáneamente con un solo comando:

```bash
npm run dev
```

Este comando utiliza `concurrently` para gestionar ambos procesos en una sola terminal, etiquetando los logs para facilitar la depuración:
- **[BACKEND]**: Logs del servidor API (Puerto 4000)
- **[FRONTEND]**: Logs del cliente Vite (Puerto 5173)

## Instalación

Si es la primera vez que clonas el proyecto, puedes instalar todas las dependencias con:

```bash
npm run install-all
```

## Estructura del Proyecto

- `/backend`: API REST y conexión a base de datos.
- `/frontend`: Interfaz de usuario Cyberpunk.
