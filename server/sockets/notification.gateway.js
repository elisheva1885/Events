import { NotificationService } from "../services/notification.service.js";
import { io } from "../sockets/socket.js";
/**
 * רישום אירועי התראות לכל Socket
 * @param {import("socket.io").Server} io 
 * @param {import("socket.io").Socket} socket 
 */
export function registerNotificationHandlers(io, socket) {

  // רישום משתמש לחדר לפי userId
  socket.on("register", async (userId) => {
    if (!userId) return;

    socket.join(userId.toString());
  });
}

/**
 * פונקציה לשליחת התראה ללקוח
 * @param {import("../services/notification.service.js").Notification} notification 
 */
export async function sendNotification(notification) {
  if (!io) {
    console.error("❌ WebSocket not initialized!");
    return;
  }

  if (notification.channel === "in-app") {
    io.to(notification.userId.toString()).emit("notification", notification);
  } else {
    console.log(`📧 Sending email to ${notification.userId}`);
    // כאן אפשר לקרוא לשירות דואר אלקטרוני
  }
}
