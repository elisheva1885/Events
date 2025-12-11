import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000); // 50ms כפול מספר הנסיונות, עד 2 שניות
    return delay;
  },
  reconnectOnError(err) {
    // אם זה ECONNRESET או חיבור נקטע, נסה reconnect
    const targetErrors = ["ECONNRESET", "ECONNREFUSED"];
    if (targetErrors.includes(err.code)) {
      return true;
    }
    return false;
  }
});
export default redis;
