import multer from 'multer';
import path from 'path';
export const upload = multer({
    // storage: multer.memoryStorage(),
    dest: process.env.DEV === "true" ? path.join('/tmp', 'uploads') : "uploads/",
    // dest: path.join('/tmp', 'uploads'),
    limits: 4 * 1024 * 1024,
});
//# sourceMappingURL=multer.js.map
