# Implementation Plan: Gestión de Membresías (Planes e Inscripciones)

## Phase 1: Gestión de Servicios (Planes)
- [~] Task: Crear CRUD para la entidad `Service`.
- [ ] Task: Validar que un plan pertenezca al gimnasio del usuario.

## Phase 2: Gestión de Inscripciones (Enrollments)
- [ ] Task: Implementar lógica de inscripción (`POST /enrollments`).
- [ ] Task: Lógica de cálculo automático de `endDate` basada en los días del servicio.
- [ ] Task: Implementar consulta de inscripciones por socio.

## Phase 3: Automatización y Reportes
- [ ] Task: Crear endpoint `GET /enrollments/expiring` para buscar inscripciones por vencer.
- [ ] Task: Implementar lógica de filtrado por días (default 7 días).
- [ ] Task: Conductor - User Manual Verification 'Membresías Funcionando'.

## Phase 4: Gestión Financiera (Facturación Mensual)
- [ ] Task: Crear modelo `MonthlyRevenue` en el schema para históricos.
- [ ] Task: Implementar endpoint para ver la recaudación acumulada del mes en curso.
- [ ] Task: Crear lógica de "Cierre de Mes" (Manual o Automática).
