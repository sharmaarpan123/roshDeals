import multer from 'multer';
export const upload = multer({
    // storage: multer.memoryStorage(),
    dest: "uploads/",
    limits: 4 * 1024 * 1024,
});
//# sourceMappingURL=multer.js.map
