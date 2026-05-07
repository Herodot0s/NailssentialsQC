---
title: Fix Prisma Datasource URL
slug: fix-prisma-datasource-url
status: complete
date: 2026-05-07
commit: 6172d5f
---

# Summary: Fix Prisma Datasource URL

The Vercel build failed due to a missing `url` argument in the Prisma `datasource` block. This has been corrected.

## Actions Taken
1. **Identified Root Cause**: Vercel logs showed `Error: Argument "url" is missing in data source block "db"`.
2. **Patched schema.prisma**: Added `url = env("DATABASE_URL")` to the `datasource db` block in `backend/prisma/schema.prisma`.
3. **Pushed Fix**: Committed the change and pushed to both the phase branch and `main` on the new repository.

## Verification
- The file `backend/prisma/schema.prisma` now correctly references `env("DATABASE_URL")`.
- A new Vercel build has been triggered automatically.
