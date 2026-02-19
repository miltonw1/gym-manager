# Specification: Gestión de Miembros (Socios)

## Goal
Implementar el CRUD completo para la gestión de los socios del gimnasio. Los usuarios con rol STAFF o ADMIN podrán registrar, editar, listar y eliminar socios.

## Requirements
- Los socios pertenecen a un gimnasio específico (`gymId`).
- Datos requeridos: Nombre, Apellido, DNI (único por gimnasio), Teléfono, Email.
- Un socio puede estar activo o inactivo.
- Las búsquedas deben ser eficientes por apellido o DNI.

## API Endpoints
- `POST /members`: Crear un nuevo socio.
- `GET /members?gymId=X`: Listar todos los socios de un gimnasio.
- `GET /members/:id?gymId=X`: Ver detalle de un socio.
- `PATCH /members/:id?gymId=X`: Actualizar datos del socio.
- `DELETE /members/:id?gymId=X`: Eliminar un socio (soft delete o cascada).

## Security
- Requiere `JwtAuthGuard`.
- El `gymId` de la petición debe coincidir con el `gymId` del usuario autenticado (a menos que sea ADMIN global).
