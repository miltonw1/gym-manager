# Specification: Expiring Members Dashboard View

## Overview
This feature adds a detailed view for "Expiring Members" accessible from the Dashboard. Clicking the "Expiring Members" card will navigate the user to a dedicated table view that lists all members whose memberships are about to expire.

## Functional Requirements
- **Navigation:** Clicking the "Expiring Members" card on the Dashboard navigates to `/dashboard/expiring-members`.
- **Layout:** The view MUST use the `MainLayout` to maintain consistent navigation and branding.
- **Data Source:** Fetch members whose membership status is 'expiring' (already calculated for the dashboard card).
- **Expiring Members Table:**
    - **Columns:**
        - Member Name (First and Last Name)
        - Expiration Date (Formatted Date)
        - Plan Name (e.g., Monthly, Annual)
        - Days Remaining (Countdown, e.g., "3 days left")
    - **Pagination:** Implement frontend pagination (20 members per page).
    - **Search/Filter:** Add a search bar to filter members by name or plan type within this view.
- **Actions:**
    - **Quick Renew:** A button/action to open the existing renewal flow for a specific member.
    - **View Profile:** A link or button to navigate to the detailed member profile.
    - **Search:** A search input to filter the list of expiring members.

## Non-Functional Requirements
- **Consistency:** Use existing `shadcn/ui` table and pagination components for UI consistency.
- **Performance:** Ensure fast loading and smooth frontend pagination.

## Acceptance Criteria
- [ ] Clicking the dashboard card navigates to `/dashboard/expiring-members`.
- [ ] The table displays the correct columns (Name, Expiration Date, Plan, Days Remaining).
- [ ] Search/Filter works as expected on the frontend list.
- [ ] Frontend pagination correctly handles lists larger than 20 items.
- [ ] "Quick Renew" successfully opens the renewal process.
- [ ] "View Profile" navigates to the correct member profile page.

## Out of Scope
- Backend-driven pagination (initially restricted to frontend pagination).
- Bulk renewal operations.
