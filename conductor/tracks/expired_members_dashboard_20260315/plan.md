# Implementation Plan: Dashboard and Expired Members View

This plan outlines the steps to implement the new "Expired Members" dashboard card and dedicated view, following the pattern of the "Expiring Members" feature.

## Phase 1: Backend - Data Access for Expired Members
- [x] Task: Update `MembersService` to include a method for fetching expired members (last 30 days). 5bed976
    - [x] Write unit tests in `members.service.spec.ts` for `findExpiredMembers`.
    - [x] Implement `findExpiredMembers` using Prisma (filter: `endDate < now` AND `endDate >= now - 30 days`).
- [ ] Task: Expose the expired members data via `MembersController`.
    - [ ] Write unit tests in `members.controller.spec.ts` for `getExpiredMembers`.
    - [ ] Implement `GET /members/expired` endpoint.
- [x] Task: Update `MembersService` to include a method for counting expired members. 5bed976
    - [x] Write unit tests for `countExpiredMembers`.
    - [x] Implement `countExpiredMembers`.
    - [ ] Expose via `GET /members/expired/count`.
- [ ] Task: Conductor - User Manual Verification 'Backend Expired Members API' (Protocol in workflow.md)

## Phase 2: Frontend - API Service and Types
- [ ] Task: Define types for Expired Member data in `src/types/members.types.ts` (if needed) or reuse existing ones.
- [ ] Task: Update `members.service.ts` to include methods for fetching expired members and their count.
    - [ ] Add `getExpiredMembers` and `getExpiredMembersCount`.
- [ ] Task: Conductor - User Manual Verification 'Frontend API Service' (Protocol in workflow.md)

## Phase 3: Frontend - Dashboard Card
- [ ] Task: Create or update the dashboard component to include the "Expired Members" card.
    - [ ] Use `shadcn/ui` Card component.
    - [ ] Implement the count fetching logic using the new service method.
    - [ ] Ensure the card links to `/expired-members`.
    - [ ] Apply "Expired" visual theme (e.g., Red colors).
- [ ] Task: Conductor - User Manual Verification 'Dashboard Card Integration' (Protocol in workflow.md)

## Phase 4: Frontend - Expired Members Page
- [ ] Task: Create `ExpiredMembersPage.tsx`.
    - [ ] Implement the table with columns: Name/DNI, Expiration Date, Plan Name, and Actions (Renew).
    - [ ] Implement search/filter logic by Name or DNI.
    - [ ] Add the "Renew" button functionality (triggering the existing renewal flow).
- [ ] Task: Register the new route `/expired-members` in `App.tsx`.
- [ ] Task: Write tests for `ExpiredMembersPage.tsx` using Vitest and React Testing Library.
- [ ] Task: Conductor - User Manual Verification 'Expired Members View' (Protocol in workflow.md)

## Phase 5: Final Verification and Cleanup
- [ ] Task: Perform a full end-to-end check of the flow: Dashboard -> Expired Members List -> Renewal.
- [ ] Task: Verify responsive design for the new components.
- [ ] Task: Ensure all tests pass and coverage is >80%.
- [ ] Task: Conductor - User Manual Verification 'Full Feature Delivery' (Protocol in workflow.md)
