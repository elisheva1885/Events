export interface Thread {
  _id: string;
  participants: {
    id: string;
    type: 'user' | 'supplier';
  }[];
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
  // אם רוצים לשמור מידע לשימוש ב־UI:
  supplierName?: string;
  clientName?: string;
  eventName?: string;
  status?: string;
  unreadCount?: number;
}
