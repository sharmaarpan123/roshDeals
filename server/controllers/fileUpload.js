import fs from 'fs';
import { errorResponse, successResponse } from '../utilities/Responses.js';
import catchAsync from '../utilities/catchAsync.js';
import { uploadToR2 } from '../utilities/cloudFlareR2.js';

export default catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(
            errorResponse({
                message: 'File is required',
            }),
        );
    }

    const dealId = req?.body?.dealId;

    const file = req.file;
    let key;
    const isDevMode = process.env.DEV === 'true';

    if (dealId) {
        if (isDevMode) {
            key = `images/dev/dealId=${dealId}${Date.now()}-${file.originalname}`;
        } else {
            key = `images/dealId=${dealId}${Date.now()}-${file.originalname}`;
        }
    } else {
        if (isDevMode) {
            key = `images/dev/${Date.now()}-${file.originalname}`;
        } else {
            key = `images/${Date.now()}-${file.originalname}`;
        }
    }

    console.log(key , "key---------------")

    const uploadResult = await uploadToR2(file, key);

    fs.unlinkSync(file.path);

    if (uploadResult.success) {
        return res.status(200).json(
            successResponse({
                message: 'file uploaded',
                data: uploadResult.url,
            }),
        );
    } else {
        errorResponse({
            message: 'File uploading failed',
        });
    }
});
