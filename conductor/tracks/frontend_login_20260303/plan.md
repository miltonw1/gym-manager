# Implementation Plan: Frontend Authentication - Login & Session Management

## Phase 1: Foundation & API Client
Establish the core types and the centralized Axios instance for backend communication.

- [ ] **Task 1: Define Authentication Types & DTOs**
    - [ ] Create `src/types/auth.types.ts`.
    - [ ] Define `LoginRequest`, `LoginResponse`, and `User` interfaces based on backend DTOs.
- [ ] **Task 2: Configure Centralized Axios Instance**
    - [ ] **Write Tests (Red Phase):** Create `src/lib/api-client.spec.ts` to verify that the Axios instance correctly attaches the `Authorization` header when a token is present in the store (using mocks).
    - [ ] **Implement (Green Phase):** Create `src/lib/api-client.ts` using Axios. Configure a base URL and add an interceptor to pull the token from the Zustand store.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Foundation & API Client' (Protocol in workflow.md)**

## Phase 2: State Management (Zustand Auth Store)
Implement the persistent store to manage user sessions and tokens.

- [ ] **Task 1: Create Auth Store with Persistence**
    - [ ] **Write Tests (Red Phase):** Create `src/store/useAuthStore.spec.ts`. Verify `setAuth`, `logout`, and that state persists correctly.
    - [ ] **Implement (Green Phase):** Create `src/store/useAuthStore.ts` using `zustand` and `persist` middleware (LocalStorage).
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: State Management' (Protocol in workflow.md)**

## Phase 3: Routing & Route Protection
Set up the application routing structure and secure internal pages.

- [ ] **Task 1: Implement ProtectedRoute Wrapper**
    - [ ] **Write Tests (Red Phase):** Create `src/components/auth/ProtectedRoute.spec.tsx`. Verify it renders children if authenticated and redirects to `/login` if not.
    - [ ] **Implement (Green Phase):** Create `src/components/auth/ProtectedRoute.tsx`.
- [ ] **Task 2: Configure Application Routes**
    - [ ] Define routes in `App.tsx` or `src/routes/index.tsx`.
    - [ ] Set up `/login` (public) and a placeholder `/dashboard` (protected).
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Routing & Route Protection' (Protocol in workflow.md)**

## Phase 4: Login UI & Feature Integration
Build the visual login form using shadcn/ui and connect it to the backend.

- [ ] **Task 1: Scaffold UI Components**
    - [ ] Add needed shadcn/ui components: `card`, `input`, `checkbox`, `form`, `label` (button and utils already exist).
- [ ] **Task 2: Implement Login Form Component**
    - [ ] **Write Tests (Red Phase):** Create `src/components/auth/LoginForm.spec.tsx`. Verify form validation (email/password), submission calls the store, and error messages appear.
    - [ ] **Implement (Green Phase):** Build `LoginForm.tsx` with `react-hook-form` and `zod`.
    - [ ] Add password visibility toggle and "Remember Me" checkbox.
    - [ ] Implement inline error handling for invalid credentials.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4: Login UI & Feature Integration' (Protocol in workflow.md)**
