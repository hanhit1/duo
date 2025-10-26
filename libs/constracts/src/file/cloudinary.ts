import { v2 as cloudinary } from 'cloudinary';
import { err, ok } from 'neverthrow';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (buffer: Buffer, filename: string) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'duo', resource_type: 'image', public_id: filename },
        (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload failed: ' + error.message));
          } else {
            resolve(result);
          }
        },
      );

      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });

    return ok({
      url: (result as any).secure_url,
    });
  } catch (error: any) {
    return err({
      message: 'Failed to upload image',
      details: error.message,
    });
  }
};
