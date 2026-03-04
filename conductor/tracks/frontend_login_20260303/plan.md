# Implementation Plan: Frontend Authentication - Login & Session Management

## Phase 1: Foundation & API Client [checkpoint: d515bf2]
Establish the core types and the centralized Axios instance for backend communication.

- [x] **Task 1: Define Authentication Types & DTOs** d515bf2
    - [x] Create `src/types/auth.types.ts`.
    - [x] Define `LoginRequest`, `LoginResponse`, and `User` interfaces based on backend DTOs.
- [x] **Task 2: Configure Centralized Axios Instance** d515bf2
    - [x] **Write Tests (Red Phase):** Create `src/lib/api-client.spec.ts` to verify that the Axios instance correctly attaches the `Authorization` header when a token is present in the store (using mocks).
    - [x] **Implement (Green Phase):** Create `src/lib/api-client.ts` using Axios. Configure a base URL and add an interceptor to pull the token from the Zustand store.
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Foundation & API Client' (Protocol in workflow.md)** d515bf2

## Phase 2: State Management (Zustand Auth Store) [checkpoint: 402ef8c]
Implement the persistent store to manage user sessions and tokens.

- [x] **Task 1: Create Auth Store with Persistence** 402ef8c
    - [x] **Write Tests (Red Phase):** Create `src/store/useAuthStore.spec.ts`. Verify `setAuth`, `logout`, and that state persists correctly.
    - [x] **Implement (Green Phase):** Create `src/store/useAuthStore.ts` using `zustand` and `persist` middleware (LocalStorage).
- [x] **Task: Conductor - User Manual Verification 'Phase 2: State Management' (Protocol in workflow.md)** 402ef8c

## Phase 3: Routing & Route Protection [checkpoint: 47c8f6b]
Set up the application routing structure and secure internal pages.

- [x] **Task 1: Implement ProtectedRoute Wrapper** 47c8f6b
    - [x] **Write Tests (Red Phase):** Create `src/components/auth/ProtectedRoute.spec.tsx`. Verify it renders children if authenticated and redirects to `/login` if not.
    - [x] **Implement (Green Phase):** Create `src/components/auth/ProtectedRoute.tsx`.
- [x] **Task 2: Configure Application Routes** 47c8f6b
    - [x] Define routes in `App.tsx` or `src/routes/index.tsx`.
    - [x] Set up `/login` (public) and a placeholder `/dashboard` (protected).
- [x] **Task: Conductor - User Manual Verification 'Phase 3: Routing & Route Protection' (Protocol in workflow.md)** 47c8f6b

## Phase 4: Login UI & Feature Integration [checkpoint: 788b35c]
Build the visual login form using shadcn/ui and connect it to the backend.

- [x] **Task 1: Scaffold UI Components** 788b35c
    - [x] Add needed shadcn/ui components: `card`, `input`, `checkbox`, `form`, `label` (button and utils already exist).
- [x] **Task 2: Implement Login Form Component** 788b35c
    - [x] **Write Tests (Red Phase):** Create `src/components/auth/LoginForm.spec.tsx`. Verify form validation (email/password), submission calls the store, and error messages appear.
    - [x] **Implement (Green Phase):** Build `LoginForm.tsx` with `react-hook-form` and `zod`.
    - [x] Add password visibility toggle and "Remember Me" checkbox.
    - [x] Implement inline error handling for invalid credentials.
- [x] **Task: Conductor - User Manual Verification 'Phase 4: Login UI & Feature Integration' (Protocol in workflow.md)** 788b35c
