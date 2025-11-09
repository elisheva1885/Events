import mongoose from 'mongoose';
import { mongoUri, mongoDbName, mongoOptions } from './config.db.js';
let isConnected = false;

export async function connectMongo() {
  if (isConnected) return mongoose.connection;
  mongoose.connection.on('connected', () => console.log('[Mongo] connected'));
  mongoose.connection.on('error', (e) => console.error('[Mongo] error', e));
  mongoose.connection.on('disconnected', () => console.warn('[Mongo] disconnected'));

  await mongoose.connect(mongoUri, { ...mongoOptions, dbName: mongoDbName });

  isConnected = true;
  return mongoose.connection;
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  isConnected = false;
}

