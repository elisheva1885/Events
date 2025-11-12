import { Router } from 'express';
import * as cnt from '../controllers/contract.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { connect } from 'mongoose';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createContractSchema } from '../validation/contract.validtion.js';
import { signContractSchema } from '../validation/contract.validtion.js';

const router = Router();

// 🔹 יצירת חוזה חדש
router.post('/contracts', validateBody(createContractSchema),authGuard, createContract);

// 🔹 שליפת חוזה קיים
router.get('/contracts/:id', authenticate, getContract);

// 🔹 חתימה על חוזה
router.post('/contracts/:id/sign',validateBody(signContractSchema), authGuard, signContract);

export default router;