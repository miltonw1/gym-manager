# Specification: CRUD para Usuarios

## Overview
Implementar las operaciones básicas de CRUD para la entidad 'User' en el backend de NestJS, siguiendo una arquitectura de servicios y controladores, e incluyendo la gestión de contraseñas.

## Requirements
- Endpoint para crear un usuario con email y contraseña.
- Endpoint para obtener todos los usuarios de un gimnasio (multi-tenant).
- Endpoint para obtener un usuario por ID.
- Endpoint para actualizar email.
- Endpoint para eliminar un usuario.
- Uso de DTOs para entrada y salida de datos.
- Los servicios deben consumir PrismaService.
- Manejo de hashes de contraseñas (bcrypt o similar).

## Data Models (Prisma)
- \User\: id, gymId, email, createdAt.
- \Password\: id, hash, userId.
