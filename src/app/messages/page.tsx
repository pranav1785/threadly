"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "@/lib/firebase";
import type { Message } from "@/types";
import { MessageCircle, Send, User, Store } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

const DEMO_CONVERSATIONS = [
  { id: "c1", name: "TechWorld Electronics", lastMsg: "Yes, we have the Sony headphones in stock!", role: "retailer", unread: 1 },
  { id: "c2", name: "Fashion Hub", lastMsg: "The Nike shoes in size 9 are available.", role: "retailer", unread: 0 },
];

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeConv, setActiveConv] = useState("c1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  // Demo messages
  useEffect(() => {
    setMessages([
      { id: "m1", conversationId: "c1", senderId: "retailer1", senderName: "TechWorld Electronics", senderRole: "retailer", content: "Hello! How can I help you today?", createdAt: new Date(Date.now() - 3600000), read: true },
      { id: "m2", conversationId: "c1", senderId: user?.uid || "me", senderName: "Me", senderRole: "customer", content: "Do you have Sony WH-1000XM5 in stock?", createdAt: new Date(Date.now() - 3500000), read: true },
      { id: "m3", conversationId: "c1", senderId: "retailer1", senderName: "TechWorld Electronics", senderRole: "retailer", content: "Yes, we have the Sony headphones in stock! They are priced at ₹24,999. Would you like to reserve one?", createdAt: new Date(Date.now() - 3400000), read: false },
    ]);
  }, [user, activeConv]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const newMsg: Message = {
      id: `m${Date.now()}`, conversationId: activeConv, senderId: user.uid, senderName: "Me",
      senderRole: "customer", content: input, createdAt: new Date(), read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    // Save to Firestore
    await addDoc(collection(db, "messages"), { ...newMsg, createdAt: serverTimestamp() });
    // Simulate retailer reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `m${Date.now() + 1}`, conversationId: activeConv, senderId: "retailer1",
        senderName: "TechWorld Electronics", senderRole: "retailer",
        content: "Thank you for your message! We'll get back to you shortly.", createdAt: new Date(), read: false,
      }]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-16 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full px-4">
          {/* Sidebar */}
          <aside className="w-80 border-r border-border bg-white hidden md:flex flex-col" aria-label="Conversations">
            <div className="p-4 border-b border-border">
              <h1 className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-600" aria-hidden="true" /> Messages
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {DEMO_CONVERSATIONS.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv.id)} className={`w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors border-b border-border ${activeConv === conv.id ? "bg-primary-50 border-r-2 border-r-primary-600" : ""}`} aria-current={activeConv === conv.id ? "page" : undefined}>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{conv.name}</p>
                    <p className="text-xs text-muted truncate">{conv.lastMsg}</p>
                  </div>
                  {conv.unread > 0 && <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0" aria-label={`${conv.unread} unread`}>{conv.unread}</span>}
                </button>
              ))}
            </div>
          </aside>

          {/* Chat area */}
          <section className="flex-1 flex flex-col bg-white" aria-label="Chat window">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{DEMO_CONVERSATIONS.find(c => c.id === activeConv)?.name}</p>
                <p className="text-xs text-green-500 font-medium">● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.senderId === user?.uid ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.senderRole === "retailer" ? "bg-orange-100" : "bg-primary-100"}`} aria-hidden="true">
                    {msg.senderRole === "retailer" ? <Store className="w-4 h-4 text-orange-600" /> : <User className="w-4 h-4 text-primary-600" />}
                  </div>
                  <div className={`max-w-xs lg:max-w-md ${msg.senderId === user?.uid ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === user?.uid ? "bg-primary-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"}`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted px-1">{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-3">
              <label htmlFor="msg-input" className="sr-only">Type a message</label>
              <input id="msg-input" type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="input-field flex-1" autoComplete="off" />
              <button type="submit" disabled={!input.trim()} className="btn-primary px-4 py-3 disabled:opacity-50" aria-label="Send message">
                <Send className="w-5 h-5" aria-hidden="true" />
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
