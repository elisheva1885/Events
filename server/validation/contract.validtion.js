// src/validations/contract.validation.js
import Joi from 'joi';

// 🔹 סכמת ולידציה לחתימה
const signatureSubSchema = Joi.object({
  party: Joi.string()
    .valid('client', 'supplier')
    .required()
    .messages({
      'any.required': 'שדה party הוא חובה',
      'any.only': 'ערך לא תקין ל-party (client / supplier בלבד)'
    }),

  at: Joi.date()
    .default(() => new Date(), 'תאריך ברירת מחדל')
    .messages({
      'date.base': 'תאריך החתימה לא תקין'
    }),

  signatureMeta: Joi.object()
    .unknown(true)
    .messages({
      'object.base': 'signatureMeta חייב להיות אובייקט תקין'
    })
});

// 🔹 סכמת ולידציה לתוכנית תשלומים
const paymentPlanSubSchema = Joi.object({
  dueDate: Joi.date().required().messages({
    'any.required': 'תאריך יעד לתשלום הוא שדה חובה',
    'date.base': 'תאריך יעד לתשלום לא תקין'
  }),

  amount: Joi.number().positive().required().messages({
    'any.required': 'סכום התשלום הוא שדה חובה',
    'number.base': 'סכום התשלום חייב להיות מספר',
    'number.positive': 'סכום התשלום חייב להיות גדול מאפס'
  }),

  status: Joi.string()
    .valid('pending', 'paid', 'overdue')
    .default('pending')
    .messages({
      'any.only': 'סטטוס תשלום לא תקין (pending, paid, overdue בלבד)'
    }),

  receiptUrl: Joi.string().uri().optional().messages({
    'string.uri': 'כתובת הקבלה אינה תקינה'
  })
});

// 🔹 סכמת ולידציה ליצירת חוזה
export const createContractSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'any.required': 'מזהה האירוע הוא שדה חובה',
    'string.base': 'מזהה האירוע חייב להיות מחרוזת'
  }),

  supplierId: Joi.string().required().messages({
    'any.required': 'מזהה הספק הוא שדה חובה',
    'string.base': 'מזהה הספק חייב להיות מחרוזת'
  }),

  clientId: Joi.string().required().messages({
    'any.required': 'מזהה הלקוח הוא שדה חובה',
    'string.base': 'מזהה הלקוח חייב להיות מחרוזת'
  }),

  fileUrl: Joi.string().uri().required().messages({
    'any.required': 'כתובת הקובץ היא שדה חובה',
    'string.uri': 'כתובת הקובץ אינה תקינה'
  }),

  signatures: Joi.array()
    .items(signatureSubSchema)
    .default([])
    .messages({
      'array.base': 'שדה signatures חייב להיות מערך תקין'
    }),

  status: Joi.string()
    .valid('draft', 'awaiting_sign', 'active', 'completed', 'cancelled')
    .default('draft')
    .messages({
      'any.only': 'סטטוס לא תקין (draft, awaiting_sign, active, completed, cancelled בלבד)'
    }),

  paymentPlan: Joi.array()
    .items(paymentPlanSubSchema)
    .default([])
    .messages({
      'array.base': 'שדה paymentPlan חייב להיות מערך תקין'
    })
});

// 🔹 סכמת ולידציה לחתימה על חוזה
export const signContractSchema = Joi.object({
  party: Joi.string()
    .valid('client', 'supplier')
    .required()
    .messages({
      'any.required': 'חובה לציין את הצד החותם (client / supplier)',
      'any.only': 'ערך לא תקין לשדה party (client / supplier בלבד)'
    }),

  signatureMeta: Joi.object()
    .unknown(true)
    .required()
    .messages({
      'any.required': 'חובה לספק נתוני meta לחתימה',
      'object.base': 'signatureMeta חייב להיות אובייקט תקין'
    })
});
