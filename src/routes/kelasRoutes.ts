import express from 'express';
import { KelasController } from '../controllers/kelasController';

const router = express.Router();

// GET all Kelas
router.get('/', KelasController.getAllKelas);

// POST add Kelas
router.post('/', KelasController.addKelas);

export default router;