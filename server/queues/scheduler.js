
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendNotification } from '../sockets/notification.gateway.js';


const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})
export default connection;



export const notificationQueue = new Queue('notifications', { connection });

export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const notification = job.data;

    await sendNotification(notification);

    const listKey = `user:${notification.userId}:notifications`;
    const mapKey = `user:${notification.userId}:notificationMap`;

    await connection.rpush(listKey, notification.id);
    await connection.hset(mapKey, notification.id, JSON.stringify(notification));

  },
  { connection }
);

notificationWorker.on('completed', (job) => {
  console.log(` Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

