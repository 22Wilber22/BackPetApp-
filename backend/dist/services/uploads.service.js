"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPetImageFromBuffer = uploadPetImageFromBuffer;
const cloudinary_1 = require("../config/cloudinary");
async function uploadPetImageFromBuffer(buffer, mimeType, ownerId) {
    const timestamp = Date.now();
    const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${ownerId}_${timestamp}.${extension}`;
    const result = await (0, cloudinary_1.uploadBuffer)(buffer, 'pets', filename, { resource_type: 'image' });
    // result.secure_url is the HTTPS URL to the uploaded image
    return result.secure_url;
}
exports.default = { uploadPetImageFromBuffer };
