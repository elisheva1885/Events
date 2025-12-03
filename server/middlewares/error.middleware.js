// AppError - שגיאה עסקית מובנית; errorHandler - מטפל שגיאות גלובלי
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
  }
}


export function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err);


  // אם זו שגיאה עסקית שלנו
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  // Duplicate key – Mongo
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate key', fields: err.keyValue });
  }

  // Validation – Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.errors });
  }

  // ברירת מחדל
  const status = err.statusCode || 500;
  return res.status(status).json({
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
