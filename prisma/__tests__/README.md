# Prisma Test Suites

- Integrity checks use existence queries and sets, not unsupported "relation is null" filters, to avoid Prisma validation errors.
- Tests validate behavior and data quality; they are not loosened to just pass.

Run:
- npm run test:schema
- npm run test:seed
- npm run test:all

---
Complete Testing Workflow
bash
# 1. Fresh start
npm run prisma:migrate:reset

# 2. First seed
npm run db:seed

# 3. Verify in UI
npm run prisma:studio

# 4. Test idempotency (re-run seed)
npm run db:seed

# 5. Run validation
npm run db:validate  # or use one of the direct methods above