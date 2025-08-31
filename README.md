# niunmango-app

Este es un proyecto de monorepo para una aplicación de finanzas personales. Contiene dos directorios principales: frontend (Next.js) y backend (Node.js con Express y Prisma).

## Estructura de Directorios

    finanz-app/

    ├── frontend/
    │ ├── pages/
    │ │ ├── api/
    │ │ └── index.jsx
    │ ├── public/
    │ ├── styles/
    │ └── package.json
    └── backend/
    ├── prisma/
    │ └── schema.prisma
    ├── node_modules/
    ├── package.json
    └── index.js

## Primeros Pasos

1.  Clona el repositorio y navega al directorio del proyecto.

2.  Configuración del Backend

    Navega al directorio backend e instala las dependencias:

        cd backend

        npm install

    Luego, configura tu base de datos PostgreSQL y las variables de entorno para Prisma. El archivo schema.prisma define la estructura de las tablas Transaction y Budget.

3.  Configuración del Frontend

    Navega al directorio frontend e instala las dependencias:

        cd frontend

        npm install

4.  Ejecución del Proyecto

    En el directorio backend, ejecuta el servidor:

        npm start

    En el directorio frontend, inicia el servidor de desarrollo de Next.js:

        npm run dev

    La aplicación estará disponible en http://localhost:3000.
