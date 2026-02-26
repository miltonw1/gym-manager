# Implementation Plan: Gestión de Membresías (Planes e Inscripciones)

## Phase 1: Gestión de Servicios (Planes) [checkpoint: 5468310]
- [x] Task: Crear CRUD para la entidad `Service`. 5468310
- [x] Task: Validar que un plan pertenezca al gimnasio del usuario. 5468310

## Phase 2: Gestión de Inscripciones (Enrollments) [checkpoint: efe1eff]
- [x] Task: Implementar lógica de inscripción con encadenamiento automático (`POST /enrollments`). 49b3034
- [x] Task: Lógica de cálculo automático de `endDate` basada en los días del servicio. 49b3034
- [x] Task: Implementar consulta de inscripciones por socio. efe1eff

## Phase 3: Automatización y Reportes [checkpoint: 7294926]
- [x] Task: Crear endpoint `GET /enrollments/expiring` para buscar inscripciones por vencer. 7294926
- [x] Task: Implementar lógica de filtrado por días (default 7 días). 7294926
- [x] Task: Conductor - User Manual Verification 'Membresías Funcionando'. 7294926

## Phase 4: Gestión Financiera (Facturación Mensual) [checkpoint: df3ba9f]
- [x] Task: Implementar endpoint para ver la recaudación acumulada del mes en curso. df3ba9f
- [ ] Task: Crear modelo `MonthlyRevenue` en el schema para históricos.
- [ ] Task: Crear lógica de "Cierre de Mes" (Manual o Automática).
