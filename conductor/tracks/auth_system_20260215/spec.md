# Specification: Sistema de Autenticación (JWT)

## Overview
Implementar un sistema de autenticación robusto utilizando JSON Web Tokens (JWT) y Passport.js para asegurar los endpoints del backend y permitir el acceso basado en roles.

## Requirements
- Endpoint `POST /auth/login` que valide email y contraseña.
- Generación de JWT firmado con una clave secreta.
- Implementación de `JwtStrategy` para validar el token en cada petición.
- Integración de `JwtAuthGuard` con el `RolesGuard` existente.
- Retorno de información básica del usuario y el token al iniciar sesión.

## Data Models (Prisma)
- Utiliza el modelo `User` y `Password` existentes.
