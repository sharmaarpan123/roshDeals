"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const Responses_1 = require("@/utilities/Responses");
const catchAsync_1 = __importDefault(require("@/utilities/catchAsync"));
const fireBaseStorage_1 = __importDefault(require("../../config/fireBaseStorage"));
(0, app_1.initializeApp)(fireBaseStorage_1.default);
const storage = (0, storage_1.getStorage)();
exports.default = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json((0, Responses_1.errorResponse)({
            message: 'File is required',
        }));
    }
    let storageRef;
    if (req.body.dealId) {
        storageRef = (0, storage_1.ref)(storage, `files/${req.body.dealId}/${req.file.originalname + new Date().getTime()}`);
    }
    else {
        storageRef = (0, storage_1.ref)(storage, `files/${req.file.originalname + new Date().getTime()}`);
    }
    const metadata = {
        contentType: req.file.mimetype,
    };
    const snapshot = await (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
    const downloadURL = await (0, storage_1.getDownloadURL)(snapshot.ref);
    return res.status(200).json((0, Responses_1.successResponse)({
        message: 'file uploaded',
        data: downloadURL,
    }));
});
//# sourceMappingURL=fileUpload.js.map