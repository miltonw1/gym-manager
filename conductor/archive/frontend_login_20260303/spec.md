# Specification: Frontend Authentication - Login & Session Management

## Overview
Implement a secure and user-friendly login system for the Gym Manager frontend using React, shadcn/ui, Zustand, and Axios. This track focuses on the initial authentication flow, state persistence, and route protection.

## Functional Requirements
- **Login Form:**
  - A centered `Card` component containing `Email` and `Password` inputs.
  - A `Password` visibility toggle (eye icon).
  - A `Remember Me` checkbox (persists session preference).
  - A `Forgot Password` link (placeholder/styled only for now).
- **Authentication Flow:**
  - Submit credentials to the backend `POST /auth/login` endpoint.
  - **Inline Error Feedback:** Display specific error messages directly below the input fields for invalid credentials or server errors.
- **State Management:**
  - Use **Zustand** with the `persist` middleware to store the JWT and user profile in `LocalStorage`.
- **Route Protection:**
  - Implement a `ProtectedRoute` wrapper component to prevent unauthenticated access to internal routes (e.g., `/dashboard`).
  - Redirect unauthenticated users to `/login`.
- **API Integration:**
  - Create a centralized **Axios instance** with an interceptor that automatically attaches the `Authorization: Bearer <token>` header to all outgoing requests if a token exists.

## Non-Functional Requirements
- **Responsive Design:** The login card must be perfectly centered and look great on both desktop and mobile devices.
- **Type Safety:** Ensure all DTOs and store states are fully typed with TypeScript.
- **Security:** Ensure the JWT is handled securely and only stored in LocalStorage if the user is authenticated.

## Acceptance Criteria
- [ ] Users can log in with valid credentials and are redirected to the dashboard.
- [ ] Users see inline error messages when entering incorrect credentials.
- [ ] The user session survives a page refresh (via LocalStorage).
- [ ] Accessing a protected route while logged out redirects the user to `/login`.
- [ ] All API calls automatically include the Bearer token after a successful login.

## Out of Scope
- Actual implementation of the "Forgot Password" functionality (backend/email service).
- User registration (sign-up) flow.
- Advanced MFA (Multi-Factor Authentication).
