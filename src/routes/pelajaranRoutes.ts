import express from 'express';
import { PelajaranController } from '../controllers/pelajaranController';
import { uploadPelajaran } from '../config/multer';

const router = express.Router();

// DELETE delete Pelajaran by ID
router.delete('/:idPelajaran', PelajaranController.deletePelajaranById);

// POST add Pelajaran with file uploads
router.post('/', uploadPelajaran, PelajaranController.addPelajaran);

// GET PDF Materi by ID
router.get('/:idPelajaran/pdf', PelajaranController.getPdfMateri);

export default router;