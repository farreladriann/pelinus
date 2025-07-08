import express from 'express';
import { CacheController } from '../controllers/cacheController';

const router = express.Router();

router.get('/', CacheController.getAll);

export default router;