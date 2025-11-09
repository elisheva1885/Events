import mongoose from 'mongoose';
import { AppError } from './error.middleware.js';

export default (paramName = 'id') => (req, _res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, `Invalid ObjectId in param '${paramName}'`);
  }
  next();
};
