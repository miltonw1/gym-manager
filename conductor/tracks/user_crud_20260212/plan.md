# Implementation Plan: CRUD para Usuarios

## Phase 1: Estructura Base y DTOs [checkpoint: e451051]
- [x] Task: Crear DTOs para las operaciones de usuario (CreateUserDto, UpdateUserDto, UserResponseDto)
    - [ ] Escribir pruebas unitarias para validación de DTOs (si aplica)
    - [x] Implementar CreateUserDto
    - [x] Implementar UpdateUserDto
    - [x] Implementar UserResponseDto
- [x] Task: Conductor - User Manual Verification 'Estructura Base y DTOs' (Protocol in workflow.md)

## Phase 2: Servicio de Usuarios
- [x] Task: Implementar UsersService
    - [x] Escribir pruebas unitarias para UsersService (Mocks de Prisma)
    - [x] Implementar método create (incluyendo hash de contraseña)
    - [x] Implementar método findAll (filtrado por gymId)
    - [x] Implementar método findOne
    - [x] Implementar método update
    - [x] Implementar método remove
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
