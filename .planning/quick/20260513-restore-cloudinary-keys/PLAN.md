# Plan: Restore Cloudinary API Keys

Restore deleted Cloudinary credentials to the backend `.env` file to fix image uploading functionality.

## Context
Cloudinary keys were previously present but appear to have been deleted. Historical logs confirm the credentials.

## Steps
1. Update `backend/.env` with:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_URL`
2. Verify `backend/src/controllers/uploadController.ts` configuration.
3. Verify functionality.

## Verification
- Check `.env` file content.
