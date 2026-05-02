import { Request, Response } from 'express';
import { put, del } from '@vercel/blob';

/**
 * POST /api/upload
 * Accepts JSON body with base64Data, filename, and mimeType
 * Returns { success: true, data: { url: string } }
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { base64Data, filename, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No file data provided. Send base64Data.' });
    }

    // Validate mime type
    if (!mimeType?.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files are allowed' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Vercel Blob
    const blob = await put(filename || 'upload.png', buffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.json({
      success: true,
      data: { url: blob.url },
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return res.status(500).json({
      success: false,
      message,
    });
  }
};

/**
 * DELETE /api/upload
 * Expects JSON body with { url: string } to delete
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'File URL required' });
    }

    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });

    return res.json({ success: true, message: 'File deleted' });
  } catch (error: unknown) {
    console.error('Delete error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return res.status(500).json({
      success: false,
      message,
    });
  }
};
