
"use client";

import { useEffect, useState, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  timestamp: any;
}

export default function CommunityChat() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const db = getFirebaseFirestore();

  useEffect(() => {
    if (db && user) {
      setLoading(true);
      const q = query(collection(db, "community-chat"), orderBy("timestamp", "asc"), limit(50));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching chat messages:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [db, user, authLoading]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, "community-chat"), {
        text: newMessage,
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Chat</CardTitle>
        <CardDescription>
          Discuss supplements, share your experiences, and connect with other users in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4 border rounded-md p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    user && msg.uid === user.uid ? "justify-end" : ""
                  }`}
                >
                  {user && msg.uid !== user.uid && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.photoURL || undefined} />
                      <AvatarFallback>
                        {msg.displayName
                          ? msg.displayName.charAt(0).toUpperCase()
                          : "A"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs ${
                      user && msg.uid === user.uid
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {user && msg.uid !== user.uid && <p className="text-xs font-semibold">{msg.displayName}</p>}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {user && msg.uid === user.uid && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.photoURL || undefined} />
                      <AvatarFallback>
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Type your message..." : "Please log in to chat"}
            disabled={!user || sending || loading}
          />
          <Button type="submit" disabled={!user || newMessage.trim() === "" || sending || loading}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    