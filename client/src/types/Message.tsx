// types/type.ts
export interface Message {
  id: string;                // או _id בהתאם לשרת
  threadId: string;          // מזהה הת'רד
  requestId?: string;        // optional, מקשר לבקשה אם יש
  senderEmail: string;       // או senderId אם מתאים
  body?: string;             // תוכן ההודעה
  messageText?: string;      // אם השרת משתמש ב־messageText
  isRead?: boolean;
  createdAt?: string | number;
  sentAt?: string | number;
  updatedAt?: string | number;
  from?: { id: string; name?: string }; // optional לפי מודל שרת
}
