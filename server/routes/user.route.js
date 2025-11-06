import { Router } from 'express';
import { authenticate, getProfile , authenticate , updateProfile } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getProfile);

router.patch('/me', authenticate, updateProfile);