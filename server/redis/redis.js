import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  
  maxRetriesPerRequest: 5, // אחרי 5 ניסיונות זה יכשל
  reconnectOnError(err) {
    if (["ECONNRESET", "ECONNREFUSED"].includes(err.code)) {
      return true; // עדיין מנסה reconnect
    }
    return false;
  },
  retryStrategy(times) {
    if (times > 10) return null; // אחרי 10 ניסיונות - עוצר
    return Math.min(times * 50, 2000);
  }
});

redis.on("error", (err) => {
  // רק מדפיס את השגיאות שאינן ECONNRESET/ECONNREFUSED
  if (!["ECONNRESET", "ECONNREFUSED"].includes(err.code)) {
    console.error("Redis error:", err);
  }
});

redis.on("connect", () => {
  console.log("Redis connected ✅");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redis;
