# Implementation Plan: CRUD para Usuarios

## Phase 1: Estructura Base y DTOs
- [x] Task: Crear DTOs para las operaciones de usuario (CreateUserDto, UpdateUserDto, UserResponseDto)
    - [ ] Escribir pruebas unitarias para validaci�n de DTOs (si aplica)
    - [x] Implementar CreateUserDto
    - [x] Implementar UpdateUserDto
    - [x] Implementar UserResponseDto
- [ ] Task: Conductor - User Manual Verification 'Estructura Base y DTOs' (Protocol in workflow.md)

## Phase 2: Servicio de Usuarios
- [ ] Task: Implementar UsersService
    - [ ] Escribir pruebas unitarias para UsersService (Mocks de Prisma)
    - [ ] Implementar m�todo create (incluyendo hash de contrase�a)
    - [ ] Implementar m�todo findAll (filtrado por gymId)
    - [ ] Implementar m�todo findOne
    - [ ] Implementar m�todo update
    - [ ] Implementar m�todo remove
- [ ] Task: Conductor - User Manual Verification 'Servicio de Usuarios' (Protocol in workflow.md)

## Phase 3: Controlador de Usuarios
- [ ] Task: Implementar UsersController
    - [ ] Escribir pruebas unitarias para UsersController (Mocks de UsersService)
    - [ ] Implementar POST /users
    - [ ] Implementar GET /users
    - [ ] Implementar GET /users/:id
    - [ ] Implementar PATCH /users/:id
    - [ ] Implementar DELETE /users/:id
- [ ] Task: Conductor - User Manual Verification 'Controlador de Usuarios' (Protocol in workflow.md)
