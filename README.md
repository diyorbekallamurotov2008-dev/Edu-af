# Edu-AF — Education Center ERP/CRM

Web-based ERP/CRM for education centers: students, groups, schedule, attendance, payments, and automatic absent SMS.

## Stack
- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL
- Session auth (NextAuth compatible models)
- SMS abstraction (Mock + HTTP provider adapter)
- Redis-ready architecture for queue worker

## 1) ER diagram / data model
See `docs/architecture.md` (Mermaid ER and business workflow).

## 2) Routes / pages list
See `docs/architecture.md` section **Route/Page Map**.

## 3) Database migrations
```bash
npm install
cp .env.example .env
npx prisma migrate dev --name erp_init
npm run prisma:seed
```

## 4) Backend endpoints (MVP)
- `GET/POST /api/v1/students`
- `POST /api/v1/attendance`
- `GET/POST /api/v1/payments`

OpenAPI spec: `docs/openapi.yaml`.

## 5) Frontend pages
Current repository includes existing Next.js pages; ERP page map and planned pages are documented in `docs/architecture.md`.

## 6) Attendance -> SMS workflow
Implemented in `lib/erp/attendance-service.ts`:
- save attendance
- detect ABSENT
- render template variables
- enforce idempotency (`lesson + student + recipient`)
- queue log + send via provider
- status lifecycle: `PENDING -> SENT|RETRYING|FAILED`

## 7) Tests
```bash
npm test
```
Included tests cover:
- SMS provider behavior
- attendance -> sms trigger and idempotency logic
- role-based permission checks

## 8) Docker run
```bash
docker compose up --build
```

## Environment variables
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eduaf?schema=public`
- `AUTH_SECRET=...`
- `AUTH_URL=http://localhost:3000`
- `SMS_PROVIDER_NAME=mock`
- `SMS_API_URL=`
- `SMS_API_KEY=`
- `SMS_SENDER_ID=EDUAF`

## SMS provider settings model (`settings`)
- `provider_name`
- `api_url`
- `api_key/secret`
- `sender_id`
- `test_mode`

This keeps provider integration pluggable for local telecom/A2P channels.
