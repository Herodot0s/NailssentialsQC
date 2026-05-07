---
title: Sync Vercel Blob Token
slug: sync-vercel-blob-token
status: complete
date: 2026-05-07
---

# Summary: Sync Vercel Blob Token

The Vercel Blob Read/Write token provided by the user has been synced with the local development environment.

## Actions Taken
1. **Updated backend/.env**: Added `BLOB_READ_WRITE_TOKEN` with the provided value.
2. **Verified Integration**: Confirmed that the backend controllers (`uploadController.ts`, `exhibitController.ts`) are already configured to use this environment variable.

## Verification
- Local environment is now ready to interact with Vercel Blob storage for image uploads and deletions.
