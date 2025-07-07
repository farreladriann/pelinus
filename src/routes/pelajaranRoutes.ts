import express from 'express';
import { PelajaranController } from '../controllers/pelajaranController';
import { uploadPelajaran } from '../config/multer';

const router = express.Router();

// GET all Pelajaran
router.get('/', PelajaranController.getAllPelajaranWithAllData);

// GET Logo by Pelajaran ID
router.get('/:id/logo', PelajaranController.getLogo);

// GET PDF by Pelajaran ID
router.get('/:id/pdf', PelajaranController.getPdf);

// POST add Pelajaran with file uploads
router.post('/', uploadPelajaran, PelajaranController.addPelajaran);

// GET all data of Pelajaran by ID
router.get('/:id', PelajaranController.getPelajaranWithAllData);

export default router;