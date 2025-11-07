import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);


// 🔹 כניסה עם ספק חיצוני (Google)
router.post('/google', googleLogin);


export default router;
