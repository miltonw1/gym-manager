# Implementation Plan: Gestión de Miembros (Socios)

## Phase 1: Módulo Member
- [x] Task: Crear MemberModule, MemberService y MemberController. [b0ad1f9]
- [x] Task: Crear CreateMemberDto y UpdateMemberDto con validaciones. [b0ad1f9]

## Phase 2: Lógica de Negocio
- [x] Task: Implementar `create` con validación de DNI duplicado por gimnasio. [b0ad1f9]
- [x] Task: Implementar `findAll` con filtros básicos (nombre, DNI). [b0ad1f9]
- [x] Task: Implementar `findOne`, `update` y `remove`. [b0ad1f9]

## Phase 3: Pruebas y Seguridad
- [x] Task: Proteger endpoints con `JwtAuthGuard` y `RolesGuard`. [b0ad1f9]
- [ ] Task: Conductor - User Manual Verification 'Socios Funcionando'.
- [x] Task: Actualizar colección de Insomnia. [fe771f8]
