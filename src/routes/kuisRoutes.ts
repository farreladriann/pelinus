import express from 'express';
import { KuisController } from '../controllers/kuisController';

const router = express.Router();

// POST add Kuis
router.post('/', KuisController.addKuis);

// DELETE delete Kuis by ID
router.delete('/:idKuis', KuisController.deleteKuis);

export default router;