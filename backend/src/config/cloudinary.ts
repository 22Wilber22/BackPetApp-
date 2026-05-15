import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadBuffer(
  buffer: Buffer,
  folder = 'pets',
  filename?: string,
  options?: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export default cloudinary;
