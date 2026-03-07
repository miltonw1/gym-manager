# Specification: Frontend Dashboard y Gestión de Socios

## Goal
Construir una interfaz moderna y funcional para el Dashboard principal del gimnasio que permita gestionar socios, ver planes y tener indicadores rápidos de facturación y vencimientos.

## Requirements

### Dashboard (Vista Principal)
- **KPI Cards (Indicadores):**
  - **Recaudación Mensual:** Muestra el total facturado en el mes en curso (consumiendo el endpoint `/payments/revenue`).
  - **Vencimientos Próximos:** Muestra el conteo de socios con membresías por vencer en los próximos 7 días (consumiendo `/enrollments/expiring`). El texto debe ser clickable para navegar al detalle.
- **Botón "Agregar Socio":** Abre un modal para crear un nuevo socio (`POST /members`).

### Tabla de Socios (Debajo de KPIs)
- **Listado Paginado:** Muestra todos los socios del gimnasio actual.
- **Buscador:** Filtra por nombre, apellido o DNI en tiempo real.
- **Filtros de Estado:**
  - **Membresía Vencida:** Filtra socios cuya inscripción actual ha expirado.
  - **Inactivos:** Filtra socios sin actividad registrada en los últimos 2 meses.
- **Acciones (Columna extra):**
  - **Botón "Ver" (Ojo):** Abre un modal con el detalle completo del socio.
  - **Botón "Editar" (Lápiz):** Abre un modal para editar la información del socio.

### Gestión de Servicios (Planes)
- Nueva vista o sección para listar los servicios actuales del gimnasio (`GET /plans`).

### Interfaz y UX
- **Modales:** Todas las acciones de crear/editar/ver deben ser componentes que se rendericen en el overlay para evitar cambios de contexto bruscos.
- **Feedback Visual:** Uso de iconos (`lucide-react`) y estilos modernos (Tailwind/Shadcn).
