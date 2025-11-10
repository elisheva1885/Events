// src/validations/supplier.validation.js
import Joi from 'joi';
import { registerSchema as userSchema } from './auth.validation.js';

// 🔹 סכמה לפריט בתיק עבודות
const portfolioItem = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'קישור בתיק העבודות חייב להיות כתובת אינטרנט תקינה',
    'any.required': 'שדה הקישור בתיק העבודות הוא חובה'
  }),
  title: Joi.string().max(100).allow('', null).messages({
    'string.max': 'כותרת בתיק העבודות לא יכולה להכיל יותר מ-100 תווים'
  })
});

// 🔹 סכמה לתמונת פרופיל
const profileImage = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'כתובת תמונת הפרופיל חייבת להיות תקינה',
    'any.required': 'תמונת הפרופיל היא שדה חובה'
  }),
  alt: Joi.string().max(100).allow('', null).messages({
    'string.max': 'תיאור התמונה לא יכול להכיל יותר מ-100 תווים'
  })
});

// 🔹 סכמה כוללת להרשמת ספק (מורחבת מהסכמה של משתמש)
export const supplierRegisterSchema = userSchema.keys({
  category: Joi.string().required().messages({
    'any.required': 'קטגוריה היא שדה חובה'
  }),

  regions: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.base': 'אזורי פעילות חייבים להיות רשימה של מחרוזות',
    'array.min': 'יש לבחור לפחות אזור אחד',
    'any.required': 'אזורי פעילות הם שדה חובה'
  }),

  kashrut: Joi.string().max(50).allow('', null).messages({
    'string.max': 'שדה הכשרות לא יכול להכיל יותר מ-50 תווים'
  }),

  portfolio: Joi.array().items(portfolioItem).default([]).messages({
    'array.base': 'תיק העבודות חייב להיות מערך תקין'
  }),

  profileImage: profileImage.allow(null).messages({
    'object.base': 'תמונת פרופיל חייבת להיות אובייקט תקין'
  }),

  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'תיאור הספק לא יכול להכיל יותר מ-500 תווים'
  })
});
