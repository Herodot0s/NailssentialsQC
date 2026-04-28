import { Router } from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController';

const router = Router();

// POST /api/upload - Handle file uploads (expects base64Data in body)
router.post('/', uploadFile);

// DELETE /api/upload - Delete an uploaded file (expects { url } in body)
router.delete('/', deleteFile);

export default router;
