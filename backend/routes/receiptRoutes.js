import express from 'express';
import { analyzeReceipt } from '../controllers/receiptController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('receipt'), analyzeReceipt);

export default router;
