// src/validations/payment.validation.js
import Joi from 'joi';

// 🔹 סכמת ולידציה להוספת תשלום חדש
export const createPaymentSchema = Joi.object({
  amount: Joi.number().required().positive().messages({
    'number.base': 'הסכום חייב להיות מספר',
    'number.positive': 'הסכום חייב להיות גדול מאפס',
    'any.required': 'שדה הסכום הוא חובה'
  }),

  dueDate: Joi.date().required().min('now').messages({
    'date.base': 'תאריך יעד אינו תקין',
    'date.min': 'תאריך היעד חייב להיות עתידי',
    'any.required': 'תאריך היעד הוא שדה חובה'
  }),

  method: Joi.string()
    .valid('cash', 'bank_transfer', 'check', 'other')
    .optional()
    .messages({
      'any.only': 'אמצעי התשלום לא תקין. אפשרויות: מזומן, העברה בנקאית, צ׳ק או אחר'
    }),

  documentUrl: Joi.string().uri().optional().messages({
    'string.uri': 'כתובת המסמך חייבת להיות תקינה'
  }),

  status: Joi.string()
    .valid('pending', 'paid', 'overdue')
    .default('pending')
    .messages({
      'any.only': 'סטטוס התשלום לא תקין. אפשרויות: pending, paid, overdue'
    })
});

// 🔹 סכמת ולידציה לעדכון תשלום קיים
export const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive().optional().messages({
    'number.base': 'הסכום חייב להיות מספר',
    'number.positive': 'הסכום חייב להיות גדול מאפס'
  }),

  dueDate: Joi.date().min('now').optional().messages({
    'date.base': 'תאריך יעד אינו תקין',
    'date.min': 'תאריך היעד חייב להיות עתידי'
  }),

  paidAt: Joi.date().optional().messages({
    'date.base': 'תאריך התשלום אינו תקין'
  }),

  method: Joi.string()
    .valid('cash', 'bank_transfer', 'check', 'other')
    .optional()
    .messages({
      'any.only': 'אמצעי התשלום לא תקין. אפשרויות: מזומן, העברה בנקאית, צ׳ק או אחר'
    }),

  documentUrl: Joi.string().uri().optional().messages({
    'string.uri': 'כתובת המסמך חייבת להיות תקינה'
  }),

  status: Joi.string()
    .valid('pending', 'paid', 'overdue')
    .optional()
    .messages({
      'any.only': 'סטטוס התשלום לא תקין. אפשרויות: pending, paid, overdue'
    })
})
  .min(1)
  .messages({
    'object.min': 'חייב לספק לפחות שדה אחד לעדכון'
  });
