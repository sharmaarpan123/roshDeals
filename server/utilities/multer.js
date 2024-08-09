import multer from 'multer';
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: 20 * 1024 * 1024,
});
//# sourceMappingURL=multer.js.map
