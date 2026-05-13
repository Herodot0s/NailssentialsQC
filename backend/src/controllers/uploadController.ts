import { Request, Response } from 'express';
import busboy from 'busboy';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Accepts multipart form-data with file field
 * Returns { success: true, data: { url: string } }
 */
export const uploadFile = async (req: Request, res: Response) => {
  console.log('Upload request received');

  const bb = busboy({
    headers: req.headers,
    limits: { files: 1, fileSize: 10 * 1024 * 1024 },
  });

  let fileFound = false;
  let responseSent = false;

  bb.on('file', (_name, file, info) => {
    fileFound = true;
    console.log('File detected:', info.filename, info.mimeType);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'nailssentials',
        resource_type: 'auto',
      },
      (error, result) => {
        if (responseSent) return;
        responseSent = true;

        if (error) {
          console.error('Cloudinary Error:', error);
          return res.status(500).json({ success: false, message: error.message });
        }

        console.log('Cloudinary Success:', result?.secure_url);
        return res.json({
          success: true,
          data: { url: result?.secure_url },
        });
      },
    );

    file.pipe(uploadStream);
  });

  bb.on('close', () => {
    console.log('Busboy close event');
    setTimeout(() => {
      if (!fileFound && !responseSent) {
        responseSent = true;
        res.status(400).json({ success: false, message: 'No file found in request' });
      }
    }, 500);
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ success: false, message: 'Upload stream error' });
    }
  });

  req.pipe(bb);
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

    // Extract public ID from Cloudinary URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `nailssentials/${fileName.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);

    return res.json({ success: true, message: 'File deleted from Cloudinary' });
  } catch (error: unknown) {
    console.error('Delete error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return res.status(500).json({
      success: false,
      message,
    });
  }
};
