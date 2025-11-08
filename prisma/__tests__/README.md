# Prisma Test Suites

- Integrity checks use existence queries and sets, not unsupported "relation is null" filters, to avoid Prisma validation errors.
- Tests validate behavior and data quality; they are not loosened to just pass.

Run:
- npm run test:schema
- npm run test:seed
- npm run test:all