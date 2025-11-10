// src/validations/request.validation.js
import Joi from 'joi';

// 🔹 ולידציה ליצירת בקשה חדשה לספק
export const createRequestSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'string.base': 'מזהה האירוע חייב להיות מחרוזת',
    'string.empty': 'שדה מזהה האירוע הוא חובה',
    'any.required': 'יש לציין מזהה אירוע'
  }),

  supplierId: Joi.string().required().messages({
    'string.base': 'מזהה הספק חייב להיות מחרוזת',
    'string.empty': 'שדה מזהה הספק הוא חובה',
    'any.required': 'יש לציין מזהה ספק'
  }),

  clientId: Joi.string().required().messages({
    'string.base': 'מזהה הלקוח חייב להיות מחרוזת',
    'string.empty': 'שדה מזהה הלקוח הוא חובה',
    'any.required': 'יש לציין מזהה לקוח'
  }),

  basicEventSummary: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'סיכום האירוע לא יכול להכיל יותר מ-1000 תווים'
  }),

  notesFromClient: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'הערות הלקוח לא יכולות להכיל יותר מ-1000 תווים'
  }),

  expiresAt: Joi.date().greater('now').optional().messages({
    'date.base': 'תאריך תפוגה אינו תקין',
    'date.greater': 'תאריך התפוגה חייב להיות בעתיד'
  })
});

// 🔹 ולידציה לפעולת אישור או דחייה
export const updateRequestStatusSchema = Joi.object({
  action: Joi.string().valid('approve', 'decline').required().messages({
    'any.only': 'הפעולה אינה תקינה. יש לבחור באישור או דחייה',
    'any.required': 'יש לציין פעולה'
  }),

  reason: Joi.string().max(500).allow('', null).messages({
    'string.max': 'הסיבה לא יכולה להכיל יותר מ-500 תווים'
  })
});
