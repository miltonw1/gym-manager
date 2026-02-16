# Implementation Plan: Sistema de Autenticación (JWT)

## Phase 1: Configuración de Módulo Auth
- [ ] Task: Crear AuthModule, AuthService y AuthController
- [ ] Task: Configurar JwtModule con clave secreta y tiempo de expiración
- [ ] Task: Implementar lógica de validación de usuario en AuthService (bcrypt compare)

## Phase 2: Estrategia de Passport y Login
- [ ] Task: Implementar LocalStrategy para validación inicial (email/password)
- [ ] Task: Implementar JwtStrategy para validación de tokens
- [ ] Task: Implementar endpoint `POST /auth/login` en AuthController
- [ ] Task: Conductor - User Manual Verification 'Login Funcional'

## Phase 3: Integración Global de Seguridad
- [ ] Task: Implementar JwtAuthGuard global o por controlador
- [ ] Task: Refactorizar RolesGuard para extraer el usuario del token validado
- [ ] Task: Probar flujo completo: Login -> Obtener Token -> Acceder a Gyms (Admin)
- [ ] Task: Conductor - User Manual Verification 'Seguridad Completa'
