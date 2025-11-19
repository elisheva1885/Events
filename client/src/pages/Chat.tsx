import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchUserThreads, fetchMessages, sendMessage } from "../store/chatSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { formatMessageTime } from "../utils/DataUtils";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = useSelector((state: RootState) => state.chat.threads ?? []);
  const messagesByThread = useSelector((state: RootState) => state.chat.messagesByThread ?? {});
  const token = useSelector((state: RootState) => state.auth?.token);

  // Extract user id from token
  const user = useMemo(() => {
    if (!token) return { _id: "" };
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { _id: payload.id || payload.sub || "" };
    } catch {
      return { _id: "" };
    }
  }, [token]);

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Fetch threads on mount
  useEffect(() => {
    if (!user._id) return;
    dispatch(fetchUserThreads({ userId: user._id }));
  }, [dispatch, user._id]);

  // Select first thread if none selected
  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) {
      setSelectedThreadId(threads[0]._id);
    }
  }, [threads, selectedThreadId]);

  // Fetch messages for selected thread
  useEffect(() => {
    if (!selectedThreadId) return;
    dispatch(fetchMessages({ threadId: selectedThreadId }));
  }, [dispatch, selectedThreadId]);

  // Memoize sorted messages
  const conversationMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    const messages = messagesByThread[selectedThreadId];
    if (!Array.isArray(messages)) return [];
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messagesByThread, selectedThreadId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedThreadId) return;
    try {
      await dispatch(sendMessage({ threadId: selectedThreadId, body: messageText.trim() })).unwrap();
      setMessageText("");
      dispatch(fetchMessages({ threadId: selectedThreadId }));
    } catch {
      toast.error("שגיאה בשליחת ההודעה");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]" style={{ direction: "rtl" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

        {/* Sidebar */}
        <Card className={`md:col-span-1 overflow-hidden ${isMobileView && selectedThreadId ? "hidden md:block" : ""}`}>
          <CardHeader><CardTitle>שיחות</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-[calc(100vh-14rem)]">
              {threads.length > 0 ? threads.map(thread => (
                <div
                  key={thread._id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${selectedThreadId === thread._id ? "bg-primary/10" : ""}`}
                  onClick={() => { setSelectedThreadId(thread._id); setIsMobileView(true); }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{thread.supplierName?.[0] || "S"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{thread.supplierName}</p>
                        {thread.unreadCount > 0 && <Badge variant="destructive" className="text-xs">{thread.unreadCount}</Badge>}
                      </div>
                      {/* <p className="text-xs text-muted-foreground mb-1">{thread.eventName}</p> */}
                    </div>
                  </div>
                </div>
              )) : <div className="p-4 text-center text-muted-foreground">אין שיחות פעילות</div>}
            </div>
          </CardContent>
        </Card>

        {/* Chat view */}
        <Card className={`md:col-span-2 flex flex-col overflow-hidden ${!selectedThreadId || (!isMobileView && window.innerWidth < 768) ? "hidden md:flex" : ""}`}>
          {selectedThreadId ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => { setIsMobileView(false); setSelectedThreadId(null); }}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {threads.find(t => t._id === selectedThreadId)?.supplierName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {threads.find(t => t._id === selectedThreadId)?.eventName}
                    </p>
                  </div>
                  <Badge>{threads.find(t => t._id === selectedThreadId)?.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">

                {conversationMessages.length > 0 ? conversationMessages.map(msg => {
                  console.log("SelectedThreadId:", selectedThreadId);
                  console.log("MessagesByThread keys:", Object.keys(messagesByThread));
                  console.log("Messages for selected thread:", messagesByThread[selectedThreadId]);
                  console.log("message: ", msg);
                  // Use senderId for comparison since email is not in token
                  const isCurrentUser = msg.to === user._id || msg.from === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? "bg-background text-foreground" : "bg-primary/10"}`}>
                        <p className="text-sm whitespace-pre-wrap">{  msg.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatMessageTime( msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-muted-foreground">אין הודעות להצגה</p>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="כתוב הודעה..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <Button type="submit" disabled={!messageText.trim()}><Send className="h-4 w-4" /></Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">בחר שיחה כדי להתחיל</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}


// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../store";
// import { fetchUserThreads, fetchMessages } from "../store/chatSlice";

// export default function DebugChat() {
//   const dispatch = useDispatch<AppDispatch>();

//   const user = useSelector((state: RootState) => {
//       const token = state.auth?.token;
//   console.log("Token in selector:", token); // <- בדיקה
//     // const token = state.auth?.token;
//     if (!token) return { _id: null };
//     try {
//       const payload = JSON.parse(atob(token.split(".")[1]));
//       return { _id: payload.id || payload.sub };
//     } catch {
//       return { _id: null };
//     }
//   });

// const threads = useSelector((state: RootState) => state.chat.threads);
// const messagesByThread = useSelector((state: RootState) => state.chat.messagesByThread);

//   // Fetch all threads
//   useEffect(() => {
//     if (user._id) {
//       console.log("Fetching threads for user:", user._id);
//       dispatch(fetchUserThreads({ userId: user._id }));
//     }
//   }, [dispatch, user._id]);

//   // Fetch messages for each thread when threads update
//   useEffect(() => {
//     threads.forEach(thread => {
//       console.log("Fetching messages for thread:", thread._id);
//       dispatch(fetchMessages({ threadId: thread._id }));
//     });
//   }, [dispatch, threads]);

//   // Log threads and messages whenever they update
//   useEffect(() => {
//     console.log("Threads:", threads);
//     console.log("Messages by thread:", messagesByThread);
//   }, [threads, messagesByThread]);

//   return (
//     <div>
//       <h2>Debug Chat</h2>
//       <p>Open console to see threads and messages</p>
//     </div>
//   );
// }
