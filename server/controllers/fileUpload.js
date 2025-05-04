import { initializeApp } from 'firebase/app';
import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytesResumable,
} from 'firebase/storage';
import { errorResponse, successResponse } from '../utilities/Responses.js';
import catchAsync from '../utilities/catchAsync.js';
import fireBaseStorage from '../../config/fireBaseStorage.js';
import { uploadToR2 } from '../utilities/cloudFlareR2.js';
import fs from "fs";
initializeApp(fireBaseStorage);
const storage = getStorage();
export default catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(
            errorResponse({
                message: 'File is required',
            }),
        );
    }

    // cloudflare flare start

    // const file = req.file;
    // const key = `images/${Date.now()}-${file.originalname}`;

    // const uploadResult = await uploadToR2(file.path, key);

    // // Clean up local file
    // fs.unlinkSync(file.path);

    // if (uploadResult.success) {
    //     return res.status(200).json(
    //         successResponse({
    //             message: 'file uploaded',
    //             data: uploadResult.url,
    //         }),
    //     );
    // } else {
    //     errorResponse({
    //         message: 'File uploading failed',
    //     });
    // }

    // cloudflare flare end

    let storageRef;
    if (req.body.dealId) {
        storageRef = ref(
            storage,
            `files/${req.body.dealId}/${req.file.originalname + new Date().getTime()}`,
        );
    } else {
        storageRef = ref(
            storage,
            `files/${req.file.originalname + new Date().getTime()}`,
        );
    }
    const metadata = {
        contentType: req.file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata,
    );
    const downloadURL = await getDownloadURL(snapshot.ref);

    return res.status(200).json(
        successResponse({
            message: 'file uploaded',
            data: downloadURL,
        }),
    );
});
//# sourceMappingURL=fileUpload.js.map
