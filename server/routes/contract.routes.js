import { Router } from 'express';
import { createContract, getContract, signContract } from '../controllers/contract.controller';
import { authenticate, authGuard } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createContractSchema } from '../validation/ontract.validtion';
import { signContractSchema } from '../validation/contract.validtion';

const router = Router();

// 🔹 יצירת חוזה חדש
router.post('/contracts', validateBody(createContractSchema),authGuard, createContract);

// 🔹 שליפת חוזה קיים
router.get('/contracts/:id', authGuard, getContract);

// 🔹 חתימה על חוזה
router.post('/contracts/:id/sign',validateBody(signContractSchema), authGuard, signContract);

export default router;