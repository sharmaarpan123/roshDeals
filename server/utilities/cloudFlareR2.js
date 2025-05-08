// r2Upload.js
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';

// r2Upload.js or r2Client.js
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const s3 = new S3Client({
    region: 'auto', // Required for R2
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export async function uploadToR2(file, key) {
    const fileStream = fs.createReadStream(file.path);

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: 'image/jpeg',
    });

    try {
        const result = await s3.send(command);
        return {
            success: true,
            key,
            result,
            url: `${process.env.R2_BASE_URL}/${key}`,
        };
    } catch (err) {
        console.error('Upload failed:', err);
        return { success: false, error: err };
    }
}

// (Assuming the `s3` client is already configured)
export async function deleteFromR2(key) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    

    try {
        await s3.send(command);

      
        return { success: true };
    } catch (err) {
        console.error('Delete failed:', err);
        return { success: false, error: err };
    }
}
