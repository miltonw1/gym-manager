# Implementation Plan: Membership Renewal (Enrollment Renewal)

This plan implements a flexible renewal system for memberships (`Enrollment`), allowing for both standard one-month renewals and custom promotional renewals.

## Phase 1: Infrastructure & Data Structures
This phase focuses on defining the necessary Data Transfer Objects (DTOs) and utility functions for date calculations.

- [ ] Task: Create `RenewEnrollmentDto`
    - Create `src/enrollments/dto/renew-enrollment.dto.ts` with optional `months` and `amount` fields.
    - Ensure proper validation decorators (IsOptional, IsInt, IsNumber, Min).
- [ ] Task: (Optional) Install `date-fns` for robust date handling
    - Run `pnpm add date-fns` to ensure accurate calendar-aware month additions.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Logic Implementation (TDD)
Following the project's TDD workflow, we will implement the renewal logic in the service layer.

- [ ] Task: Write unit tests for `EnrollmentsService.renew`
    - Create/Update `src/enrollments/enrollments.service.spec.ts`.
    - Test Case 1: Standard renewal (no body) uses plan price and adds 1 month.
    - Test Case 2: Custom renewal (promo) uses provided price and months.
    - Test Case 3: Verify `startDate` is reset to today.
    - Test Case 4: Verify a `Payment` record is created.
    - Test Case 5: Verify status is set to `ACTIVE`.
- [ ] Task: Implement `renew` method in `EnrollmentsService`
    - Add the `renew` method to `src/enrollments/enrollments.service.ts`.
    - Logic should use a Prisma `$transaction` to update the enrollment and create the payment.
    - Handle cases where `amount` or `months` are missing by fetching defaults from the plan.
- [ ] Task: Add endpoint to `EnrollmentsController`
    - Implement `POST /enrollments/:id/renew` in `src/enrollments/enrollments.controller.ts`.
    - Ensure it uses `@Param('id', ParseIntPipe)` and `@Body()`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Integration & Final Verification
Final check of the entire flow to ensure data integrity.

- [ ] Task: Verify overall system behavior
    - Run all tests: `npm test`.
    - Ensure no regressions in existing enrollment creation or update logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
