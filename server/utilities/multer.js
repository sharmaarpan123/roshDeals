import multer from 'multer';
export const upload = multer({
    // storage: multer.memoryStorage(),
    // dest: "uploads/",
    dest: path.join('/tmp', 'uploads'),
    limits: 4 * 1024 * 1024,
});
//# sourceMappingURL=multer.js.map
