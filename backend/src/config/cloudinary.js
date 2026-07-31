import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadToCloudinary(buffer, folder = 'incidents') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `anginat/${folder}`,
                resource_type: 'auto',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'webp'],
                max_bytes: 10 * 1024 * 1024,
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                } else if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                } else {
                    reject(new Error('Cloudinary upload returned no result'));
                }
            }
        );

        uploadStream.end(buffer);
    });
}

export async function deleteFromCloudinary(publicId) {
    await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
