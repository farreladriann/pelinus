import multer from 'multer';
import createHttpError from 'http-errors';

// Configure storage
const storage = multer.memoryStorage(); // Store files in memory as Buffer

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file types
    if (file.fieldname === 'logo') {
        // Only allow images for logo
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg'
        ) {
            cb(null, true);
        } else {
            cb(createHttpError(400, 'Logo harus berupa file gambar (jpg, png, gif, etc.)'));
        }
    } else if (file.fieldname === 'filePdfMateri') {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(createHttpError(400, 'File materi harus berupa PDF'));
        }
    } else {
        cb(createHttpError(400, 'Field tidak dikenal'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 2 // Maximum 2 files
    }
});

export const uploadPelajaran = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'filePdfMateri', maxCount: 1 }
]);