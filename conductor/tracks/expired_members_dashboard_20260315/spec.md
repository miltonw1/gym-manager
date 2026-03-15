# Specification: Dashboard and Expired Members View

## Overview
This track aims to implement a new dashboard card and a dedicated view for "Expired Members," mirroring the existing "Expiring Members" functionality. This will allow gym owners to quickly identify members whose memberships have recently lapsed and facilitate their renewal.

## Functional Requirements

### 1. Dashboard Integration
- **Expired Members Card:**
  - Create a new card in the dashboard showing the total count of "Expired Members."
  - Visual style should mimic the "Expiring Members" card but with a distinct "Expired" theme (e.g., using a red color scheme for status/icons).
  - Clicking the card must redirect the user to the `/expired-members` route.

### 2. Expired Members View (`/expired-members`)
- **Member Table:**
  - Display a table of members whose memberships have expired within the last 30 days.
  - Columns:
    - Member Name and DNI.
    - Expiration Date (the `endDate` from their last enrollment).
    - Plan Name.
    - Quick Actions: A "Renew" button.
- **Business Logic (Filtering):**
  - **Condition:** `endDate < current_date` AND `endDate >= (current_date - 30 days)`.
  - Members with `endDate` older than 30 days are considered "Inactive" and should not appear in this specific view.
- **Search & Filter:**
  - Include a search bar to filter the table by Member Name or DNI.
- **Quick Renewal:**
  - The "Renew" button should trigger the renewal flow (mimicking the existing enrollment process).

### 3. Backend API Support
- Ensure or create an endpoint to fetch the count and list of expired members specifically following the "last 30 days" logic.

## Non-Functional Requirements
- **Consistency:** UI components (cards, tables, buttons) must follow the project's existing design system using Tailwind CSS and shadcn/ui.
- **Performance:** Filtering logic should be efficient at the database level (Prisma).

## Acceptance Criteria
- [ ] Dashboard shows an "Expired Members" card with a correct count.
- [ ] Clicking the card navigates to `/expired-members`.
- [ ] The `/expired-members` page displays only members who expired in the last 30 days.
- [ ] The table includes Name/DNI, Expiration Date, Plan, and a "Renew" button.
- [ ] The search bar correctly filters the table.
- [ ] The "Renew" button initiates the renewal process.

## Out of Scope
- Management of "Inactive" members (those expired > 30 days ago).
- Bulk email/SMS notifications for expired members (this might be a future track).
