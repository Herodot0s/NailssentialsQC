---
title: Fix Prisma Datasource URL
slug: fix-prisma-datasource-url
status: in-progress
date: 2026-05-07
---

# Plan: Fix Prisma Datasource URL

The Vercel build failed because the `schema.prisma` file is missing the `url` argument in the `datasource db` block.

## Steps

1. **Update schema.prisma**: Add `url = env("DATABASE_URL")` to the `db` datasource block.
2. **Commit and Push**: Commit the fix and push to the new repository to trigger a re-build.

## Verification
- [ ] Vercel build succeeds (checked by user).
- [ ] `backend/prisma/schema.prisma` contains the `url` field.
