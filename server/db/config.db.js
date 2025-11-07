import 'dotenv/config';
export const mongoUri = process.env.MONGO_URI;
export const mongoDbName = process.env.MONGO_DB_NAME;
export const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  };
