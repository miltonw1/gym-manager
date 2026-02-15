# Implementation Plan: CRUD para Usuarios

## Phase 1: Estructura Base y DTOs [checkpoint: e451051]
- [x] Task: Crear DTOs para las operaciones de usuario (CreateUserDto, UpdateUserDto, UserResponseDto)
    - [ ] Escribir pruebas unitarias para validación de DTOs (si aplica)
    - [x] Implementar CreateUserDto
    - [x] Implementar UpdateUserDto
    - [x] Implementar UserResponseDto
- [x] Task: Conductor - User Manual Verification 'Estructura Base y DTOs' (Protocol in workflow.md)

## Phase 2: Servicio de Usuarios [checkpoint: 47419ee]
- [x] Task: Implementar UsersService
    - [x] Escribir pruebas unitarias para UsersService (Mocks de Prisma)
    - [x] Implementar método create (incluyendo hash de contraseña)
    - [x] Implementar método findAll (filtrado por gymId)
    - [x] Implementar método findOne
    - [x] Implementar método update
    - [x] Implementar método remove
- [x] Task: Conductor - User Manual Verification 'Servicio de Usuarios' (Protocol in workflow.md)

## Phase 3: Controlador de Usuarios
- [x] Task: Implementar UsersController
    - [x] Escribir pruebas unitarias para UsersController (Mocks de UsersService)
    - [x] Implementar POST /users
    - [x] Implementar GET /users
    - [x] Implementar GET /users/:id
    - [x] Implementar PATCH /users/:id
    - [x] Implementar DELETE /users/:id
- [x] Task: Conductor - User Manual Verification 'Controlador de Usuarios' (Protocol in workflow.md)

## Phase 4: Seguridad y Administración CLI
- [ ] Task: Refactorizar UsersController (Remover POST /users)
- [ ] Task: Crear Script CLI para creación de Gyms y Users Administradores
    - [ ] Implementar lógica de creación de Gym inicial
    - [ ] Implementar lógica de creación de Usuario vinculado al Gym vía CLI
- [ ] Task: Conductor - User Manual Verification 'Administración CLI' (Protocol in workflow.md)
