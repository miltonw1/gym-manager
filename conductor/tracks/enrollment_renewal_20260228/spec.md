# Specification: Membership Renewal (Enrollment Renewal)

## Overview
This track implements a flexible endpoint to renew an existing `Enrollment`. It supports both standard one-month renewals (using the current plan's price) and custom promotional renewals (where duration and price are manually defined by the staff).

## Functional Requirements

### 1. Unified Renewal Endpoint
- **Endpoint:** `POST /enrollments/:id/renew`
- **Controller:** `EnrollmentsController`
- **Service:** `EnrollmentsService.renew(id, dto)`

### 2. Request Data (DTO)
The endpoint accepts an optional body:
- `months` (number, optional): Number of months to add to the membership. Defaults to `1`.
- `amount` (number, optional): The total amount paid. Defaults to the current `Plan.price` if not provided.

### 3. Business Logic
Regardless of whether it's a standard or promo renewal, the logic follows these steps:
1. **Validation:** 
   - Verify the `Enrollment` exists.
   - Fetch the associated `Plan` to get the default price if `amount` is missing.
2. **Date Update:**
   - `startDate`: Set to the current timestamp (`now()`).
   - `endDate`: Calculated by adding `months` to the `startDate` using calendar-aware logic (e.g., `date-fns.addMonths`).
3. **Status Update:**
   - Set `status` to `ACTIVE`.
4. **Payment Creation:**
   - Create a new `Payment` record linked to the `Enrollment`.
   - `amount`: Use the provided value or the default plan price.
   - `paidAt`: Set to `now()`.

### 4. Edge Cases
- **Expired Memberships:** Can be renewed normally; `startDate` becomes today.
- **Active Memberships:** Can be renewed; `startDate` resets to today (as requested, the user "starts over" on the day they pay).
- **Plan Changes:** This endpoint renews the *current* plan. If the user wants a different plan, they should create a new enrollment (outside the scope of this track).

## Acceptance Criteria
- [ ] `POST /enrollments/:id/renew` with empty body successfully renews for 1 month at plan price.
- [ ] `POST /enrollments/:id/renew` with `months: 3` and `amount: 50000` successfully renews for 3 months at the custom price.
- [ ] `Enrollment.startDate` is always updated to the current date.
- [ ] `Enrollment.endDate` correctly handles month lengths (e.g., renewal on Oct 31 -> Nov 30).
- [ ] A `Payment` record is created for every renewal.
- [ ] Returns the updated `Enrollment` with its new `Payment` included.
