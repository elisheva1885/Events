import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import * as cont from '../controllers/auth.controller.js';

const router = Router();

// router.post('/register', validateBody(registerSchema), register);
// router.post('/login', validateBody(loginSchema), login);

router.post('/register', cont.register);
router.post('/login',cont.login);



// 🔹 כניסה עם ספק חיצוני (Google)
// router.post('/google', googleLogin);


export default router;