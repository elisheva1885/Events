// src/validations/user.validation.js
import Joi from 'joi';

// 🔹 ולידציה לעדכון פרטי משתמש (updateMe)
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.base': 'שם המשתמש חייב להיות מחרוזת',
    'string.min': 'שם המשתמש חייב להכיל לפחות 2 תווים',
    'string.max': 'שם המשתמש לא יכול להכיל יותר מ-100 תווים'
  }),

  email: Joi.string().email().optional().messages({
    'string.email': 'כתובת האימייל אינה תקינה',
    'string.base': 'כתובת האימייל חייבת להיות מחרוזת'
  }),

  phone: Joi.string()
    .pattern(/^0\d{8,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'מספר הטלפון חייב להיות תקין (9–10 ספרות ומתחיל ב-0)',
      'string.base': 'מספר הטלפון חייב להיות מחרוזת'
    }),

  password: Joi.string().min(6).max(128).optional().messages({
    'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים',
    'string.max': 'הסיסמה לא יכולה להכיל יותר מ-128 תווים'
  }),

  role: Joi.string().valid('admin', 'user', 'supplier').optional().messages({
    'any.only': 'תפקיד לא תקין. האפשרויות הן: admin, user, supplier'
  })
})
  .min(1)
  .messages({
    'object.min': 'יש לספק לפחות שדה אחד לעדכון'
  });

// 🔹 ולידציה להצגת פרטי המשתמש (getMe) — אין גוף בקשה, לכן לא נדרש Schema.
