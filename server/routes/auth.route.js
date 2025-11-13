import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import * as cont from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

// router.post('/register', validateBody(registerSchema), register);
// router.post('/login', validateBody(loginSchema), login);

router.post('/register', validateBody(registerSchema),cont.register);
router.post('/login',validateBody(loginSchema),cont.login);

// Google Auth - קבלת נתונים ישירות מהלקוח (הגרסה המודרנית)
router.post('/google', cont.googleAuth);

<<<<<<< Updated upstream

// 🔹 כניסה עם ספק חיצוני (Google)
// router.post('/google', googleLogin);
=======
// Passport routes (backup - לא בשימוש כרגע)
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { session: false }), cont.googleCallback);
>>>>>>> Stashed changes


export default router;