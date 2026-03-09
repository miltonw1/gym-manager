# Plan: Expiring Members Dashboard View

## Phase 1: Frontend Routing and Navigation
- [x] Task: Create the `ExpiringMembersPage` component structure.
    - [x] Create `gym-manager-frontend/src/pages/ExpiringMembersPage.tsx`.
    - [x] Add basic layout using `MainLayout`.
- [x] Task: Configure routing for the new page.
    - [x] Add `/dashboard/expiring-members` route in `gym-manager-frontend/src/App.tsx`.
- [x] Task: Update Dashboard Card to navigate to the new route.
    - [x] Locate the "Expiring Members" card in `DashboardPage.tsx`.
    - [x] Add navigation logic (e.g., `useNavigate` from `react-router-dom`) on click.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Frontend Routing and Navigation' (Protocol in workflow.md)

## Phase 2: Data Fetching and Table Implementation
- [x] Task: Implement data fetching for expiring members.
    - [x] Update `members.service.ts` to include a method for fetching expiring members (or reuse existing logic if possible).
- [x] Task: Create the Expiring Members Table component.
    - [x] Use `shadcn/ui` table components.
    - [x] Implement columns: Member Name, Expiration Date, Plan Name, Days Remaining.
- [x] Task: Implement Frontend Pagination.
    - [x] Add logic to slice the member list into pages of 20.
    - [x] Add pagination controls (Next/Previous).
- [x] Task: Implement Search and Filtering.
    - [x] Add a search input above the table.
    - [x] Implement client-side filtering by name and plan.
- [x] Task: Write unit tests for `ExpiringMembersPage` and its filtering/pagination logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Data Fetching and Table Implementation' (Protocol in workflow.md)

## Phase 3: Actions and Integration
- [ ] Task: Implement "View Profile" action.
    - [ ] Add a button/link in each row to navigate to `/members/:id`.
- [ ] Task: Implement "Quick Renew" action.
    - [ ] Integrate with the existing renewal flow (likely a modal or navigation to a renewal page).
- [ ] Task: Final UI Polish and Mobile Responsiveness.
    - [ ] Ensure the table is responsive on smaller screens.
    - [ ] Verify consistent styling with the rest of the app.
- [ ] Task: Write integration tests for the "Quick Renew" and "View Profile" actions.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Actions and Integration' (Protocol in workflow.md)
