---
title: Sync Vercel Blob Token
slug: sync-vercel-blob-token
status: in-progress
date: 2026-05-07
---

# Plan: Sync Vercel Blob Token

The user has provided a new Vercel Blob Read/Write token. This needs to be added to the project's environment variables to enable file uploads (exhibits, profile pictures, etc.).

## Steps

1. **Update .env Files**: Add `BLOB_READ_WRITE_TOKEN` to `backend/.env`.
2. **Commit and Push**: Commit the change and push to trigger a re-build on Vercel.

## Verification
- [ ] `backend/.env` contains the new token.
- [ ] Vercel deployment has the token available (user will verify functionality).
