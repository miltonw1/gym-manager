# Implementation Plan: Mercado Pago Checkout & Subscription Billing (Fix)

## Context

Mercado Pago Checkout Pro payments were credited (money debited) but the subscription
stayed `PENDING` and days were never added, and there was no redirect back to the site.

**Root cause:** both `back_urls` (redirect) and `notification_url` (webhook) pointed to
`localhost`. Mercado Pago explicitly disallows local domains in `back_urls` and cannot
reach `localhost` for webhooks. As a result the confirmation (webhook or auto-verify)
never reached the backend, so `activateSubscription` never ran.

**Fix:** expose the backend via ngrok for the webhook, point `back_urls` at a public
backend `return` endpoint that redirects the browser back to the local frontend, add
`auto_return`, and add a reconciliation endpoint so stuck `PENDING` purchases get
credited. Also clean up the test `PENDING` subscriptions.

## Configuration

- `MERCADO_PAGO_WEBHOOK_URL="https://fretted-exception-unclip.ngrok-free.dev/subscriptions/webhook"`
- `PUBLIC_BACKEND_URL="https://fretted-exception-unclip.ngrok-free.dev"` (new)
- `FRONTEND_URL="http://localhost:5173"` (unchanged, final redirect target)

> Note: the ngrok URL changes on each restart. Only `MERCADO_PAGO_WEBHOOK_URL` and
> `PUBLIC_BACKEND_URL` need updating in `.env`.

## Tasks

- [x] Task: Delete `PENDING` subscriptions (test data cleanup)
- [ ] Task: Update `.env` with ngrok webhook URL + `PUBLIC_BACKEND_URL`
- [ ] Task: Update `MercadoPagoService.createPreference`
  - `back_urls` now target `${PUBLIC_BACKEND_URL}/subscriptions/return`.
  - Add `auto_return: 'approved'` for automatic redirect.
- [ ] Task: Add `GET /subscriptions/return` endpoint
  - Reads `status` and `subscriptionId`, `res.redirect()` to
    `${FRONTEND_URL}/billing/result?status=...&subscriptionId=...`.
- [ ] Task: Add `POST /subscriptions/reconcile` endpoint
  - Finds the gym's `PENDING` subscriptions and verifies each against Mercado Pago,
    crediting days when `approved`.
- [ ] Task: Frontend `/billing` calls `reconcile` on mount
- [ ] Task: Rebuild backend + frontend, run tests
- [ ] Task: End-to-end check (pay with test card -> auto redirect -> auto verify)
