# Implementation Plan: Frontend Dashboard y Gestión de Socios

## Phase 1: Backend Support (Pagination & Search)
- [~] Task: Actualizar `MembersService` y `MembersController` para soportar paginación (`skip`, `take`).
- [ ] Task: Implementar búsqueda global (nombre, apellido, DNI) en `GET /members`.
- [ ] Task: Agregar filtros de estado (Active/Expired) en el listado de socios.

## Phase 2: Dashboard Layout & KPI Cards
- [ ] Task: Crear componentes de `Card` para KPI (Revenue & Expiring).
- [ ] Task: Implementar fetch para el endpoint `/payments/revenue` y mostrar recaudación.
- [ ] Task: Implementar fetch para `/enrollments/expiring`, contar resultados y mostrar indicador.

## Phase 3: Tabla de Socios & Búsqueda
- [ ] Task: Crear componente `MembersTable` con soporte de paginación.
- [ ] Task: Implementar buscador de socios en la cabecera de la tabla.
- [ ] Task: Agregar filtros de "Membresía Vencida" e "Inactivos".

## Phase 4: CRUD de Socios (Modales)
- [ ] Task: Crear modal `AddMemberModal` para crear nuevos socios.
- [ ] Task: Implementar botón de "Agregar Socio" en el Dashboard.
- [ ] Task: Crear modales `ViewMemberModal` y `EditMemberModal`.
- [ ] Task: Agregar columna de acciones (Iconos Ojo/Lápiz) en la tabla de socios.

## Phase 5: Gestión de Servicios (Planes)
- [ ] Task: Crear vista de `PlansPage` para listar servicios del gimnasio.
- [ ] Task: Registrar ruta de planes en `App.tsx`.
