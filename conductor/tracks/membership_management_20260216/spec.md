# Specification: Gestión de Membresías (Planes e Inscripciones)

## Goal
Permitir que el gimnasio defina sus servicios (planes) e inscriba a los socios en ellos.

## Requirements

### Servicios (Planes)
- Datos: Nombre (ej: "Pase Libre"), Precio, Duración en días.
- Un gimnasio puede tener múltiples planes.

### Inscripciones (Enrollments)
- Conecta un Socio (`Member`) con un Servicio (`Service`).
- Calcula automáticamente la fecha de fin basada en la fecha de inicio y la duración del plan.
- Estado de la inscripción: ACTIVE, EXPIRED, CANCELED.

## API Endpoints

### Services
- `GET /services?gymId=X`: Listar planes disponibles.
- `POST /services`: Crear un nuevo plan (Solo ADMIN del gym).

### Enrollments
- `POST /enrollments`: Inscribir a un socio a un plan.
- `GET /enrollments/member/:memberId`: Ver historial de inscripciones de un socio.
- `GET /enrollments/expiring`: Listar inscripciones próximas a vencer (para recordatorios).
