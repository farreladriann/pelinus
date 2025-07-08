import express from 'express';
import { KelasController } from '../controllers/kelasController';

const router = express.Router();

// POST add Kelas
router.post('/', KelasController.addKelas);

// DELETE delete Kelas by ID
router.delete('/:idKelas', KelasController.deleteKelas);

export default router;