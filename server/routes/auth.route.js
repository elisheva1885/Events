import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import { login, register } from '../services/auth.service.js';

const router = Router();

// router.post('/register', validateBody(registerSchema), register);
// router.post('/login', validateBody(loginSchema), login);

router.post('/register', register);
router.post('/login',login);


// 🔹 כניסה עם ספק חיצוני (Google)
// router.post('/google', googleLogin);


export default router;