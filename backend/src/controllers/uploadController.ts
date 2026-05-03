import { Request, Response } from 'express';
import busboy from 'busboy';
import { put, del } from '@vercel/blob';
import { Readable } from 'stream';

/**
 * POST /api/upload
 * Accepts multipart form-data with file field
 * Returns { success: true, data: { url: string } }
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const bb = busboy({ headers: req.headers, limits: { fileSize: 4 * 1024 * 1024 } });
    let filename = '';
    let mimeType = '';
    let fileStream: NodeJS.ReadableStream | null = null;

    bb.on('file', (_name, file, info) => {
      filename = info.filename;
      mimeType = info.mimeType;
      fileStream = file;
    });

    bb.on('close', async () => {
      if (!fileStream) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      if (!mimeType?.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Only image files are allowed' });
      }

      const blob = await put(filename || 'upload.png', fileStream as Readable, {
        access: 'public',
        contentType: mimeType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      const allowedPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/;
      if (!allowedPattern.test(blob.url)) {
        await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        return res.status(400).json({
          success: false,
          message: 'Invalid profile picture URL. Only Vercel Blob URLs are allowed.',
        });
      }

      return res.json({
        success: true,
        data: { url: blob.url },
      });
    });

    req.pipe(bb);
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