import { uploadBuffer } from '../config/cloudinary';

export async function uploadPetImageFromBuffer(buffer: Buffer, mimeType: string, ownerId: string): Promise<string> {
  const timestamp = Date.now();
  const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const filename = `${ownerId}_${timestamp}.${extension}`;
  const result = await uploadBuffer(buffer, 'pets', filename, { resource_type: 'image' });
  // result.secure_url is the HTTPS URL to the uploaded image
  return result.secure_url as string;
}

export default { uploadPetImageFromBuffer };
