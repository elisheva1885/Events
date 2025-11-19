import { countUnreadMessages } from "../repositories/message.repository.js";
import * as repo from "../repositories/thread.repository.js";
import { sendMessage } from "./message.service.js";

export async function getOrCreateThread({ requestId, userId, supplierId }) {
  const existingThread = await repo.getThreadByRequestId(requestId);

  if (existingThread) {
    return existingThread; // reuse
  }

  const thread = await repo.createThread({ requestId, userId, supplierId });
  const threadId = thread._id;
  const body = "פנייתך בהמתנה";
  await sendMessage({ threadId, userId, supplierId, body })
  return thread;
}

export async function serviceGetThreadById(threadId) {
  return await repo.getThreadById(threadId);
}

export async function serviceGetThreadsForUser(userId) {
  const threads = await repo.getThreadsForUser(userId);
  console.log("threads!!!!!!!!! ", threads);

  const enrichedThreads = await Promise.all(
    threads.map(async thread => ({
      ...thread,
      supplierName: thread.supplierId?.user?.name ?? "",
      eventName: thread.requestId?.eventId?.name ?? "",
      status: thread.requestId?.status ?? "",
      unreadCount: await countUnreadMessages(thread._id, userId) // כאן אפשר await
    }))
  );
  console.log("enrichedThreads!!!!!!!!! ", enrichedThreads);

  return enrichedThreads;
}

export async function serviceGetThreadsForSupplier(supplierId) {
  return await repo.getThreadsForSupplier(supplierId);
}
