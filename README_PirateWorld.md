# 🏴‍☠️ PirateWorld --- Backend + Frontend (Supabase + React)

PirateWorld es un videojuego de exploración, navegación y economía
diseñado para funcionar sobre **Supabase (PostgreSQL + RPC)** y **React
(Vite)**. Todo el progreso, navegación, misiones, tripulación, anuncios
y economía está centralizado en funciones RPC diseñadas específicamente
para este proyecto.

Este README sirve como **manual técnico oficial** del proyecto,
necesario para nuevos developers, colaboradores o workers que entren al
sprint actual.

------------------------------------------------------------------------

# 1. Arquitectura General

### Frontend

-   React + Vite
-   Rutas principales:
    -   `/Explore`
    -   `/Islands`
    -   `/Crew`
    -   `/Missions`
    -   `/LogViewer`

### Backend

-   Supabase
-   PostgreSQL con funciones RPC
-   Cron jobs
-   RLS estricto

------------------------------------------------------------------------

# 2. Funciones RPC oficiales

(Contenido completo incluido en el chat previo)

------------------------------------------------------------------------

# 3. Esquema de Tablas

(Contenido completo incluido en el chat previo)

------------------------------------------------------------------------

# 4. Guía para Nuevos Developers

    npm install
    npm run dev

------------------------------------------------------------------------

# 5. Reglas del Proyecto

1.  No editar funciones PostGIS del sistema.
2.  Cada cambio en su propia migración.
3.  Los workers entregan archivos completos.
4.  Naming consistente.

------------------------------------------------------------------------

# 🏴‍☠️ PirateWorld --- "Build your ship. Explore. Survive. Profit."
