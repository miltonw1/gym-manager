# Implementation Plan: CRUD para Usuarios y Gimnasios

## Phase 1: Estructura Base y DTOs [checkpoint: e451051]
- [x] Task: Crear DTOs para las operaciones de usuario (CreateUserDto, UpdateUserDto, UserResponseDto)
- [x] Task: Conductor - User Manual Verification 'Estructura Base y DTOs'

## Phase 2: Servicio de Usuarios [checkpoint: 47419ee]
- [x] Task: Implementar UsersService
- [x] Task: Conductor - User Manual Verification 'Servicio de Usuarios'

## Phase 3: Controlador de Usuarios [checkpoint: d123abc]
- [x] Task: Implementar UsersController
- [x] Task: Conductor - User Manual Verification 'Controlador de Usuarios'

## Phase 4: CRUD de Gimnasios y Refactorización de Seguridad
- [~] Task: Completar GymsService (findAll, findOne, update, remove)
- [ ] Task: Completar GymsController (GET, PATCH, DELETE)
- [ ] Task: Implementar Guardián de Admin (RolesGuard)
- [ ] Task: Implementar creación de usuarios STAFF por el ADMIN en UsersController
- [ ] Task: Aplicar guardianes a UsersController y GymsController
- [ ] Task: Conductor - User Manual Verification 'Gimnasios y Seguridad'
