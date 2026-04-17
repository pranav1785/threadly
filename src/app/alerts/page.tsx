"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "@/lib/firebase";
import type { Alert } from "@/types";
import { Bell, BellOff, CheckCheck, Package, TrendingDown, Zap, Store } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ALERT_ICONS: Record<string, React.ElementType> = {
  restock: Package,
  price_drop: TrendingDown,
  similar_found: Zap,
  request_fulfilled: Store,
};

const ALERT_COLORS: Record<string, string> = {
  restock: "bg-green-100 text-green-600",
  price_drop: "bg-blue-100 text-blue-600",
  similar_found: "bg-purple-100 text-purple-600",
  request_fulfilled: "bg-orange-100 text-orange-600",
};

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<(Alert & { docId: string })[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "alerts"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ docId: d.id, ...(d.data() as Alert) }))
        .sort((a, b) => (b.createdAt as unknown as number) - (a.createdAt as unknown as number));
      setAlerts(sorted);
      setFetching(false);
    });
    return () => unsub();
  }, [user]);

  const markRead = async (docId: string) => {
    await updateDoc(doc(db, "alerts", docId), { read: true });
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => updateDoc(doc(db, "alerts", a.docId), { read: true })));
    toast.success("All alerts marked as read");
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-3xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-600" aria-hidden="true" /> Alerts
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-accent text-white text-sm font-bold rounded-full" aria-label={`${unreadCount} unread alerts`}>{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-primary-600 hover:underline cursor-pointer font-medium">
              <CheckCheck className="w-4 h-4" aria-hidden="true" /> Mark all read
            </button>
          )}
        </div>

        {fetching ? (
          <div className="space-y-3 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl skeleton" />)}</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <BellOff className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">No alerts yet</h2>
            <p className="text-muted mt-2">Add items to your wishlist or set product requests to receive alerts.</p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Your alerts">
            <AnimatePresence>
              {alerts.map(alert => {
                const Icon = ALERT_ICONS[alert.type] || Bell;
                const colorClass = ALERT_COLORS[alert.type] || "bg-gray-100 text-gray-600";
                return (
                  <motion.div key={alert.docId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`bg-white rounded-2xl p-4 shadow-card flex gap-4 items-start cursor-pointer hover:shadow-card-hover transition-shadow ${!alert.read ? "border-l-4 border-primary-500" : ""}`}
                    onClick={() => markRead(alert.docId)} role="listitem" aria-label={alert.message}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`} aria-hidden="true">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${alert.read ? "text-gray-700" : "text-gray-900"}`}>{alert.productName}</h3>
                        <span className="text-xs text-muted flex-shrink-0">{alert.createdAt && formatRelativeTime(alert.createdAt as unknown as Date)}</span>
                      </div>
                      <p className="text-sm text-muted mt-0.5">{alert.message}</p>
                      {alert.price && <p className="text-sm font-bold text-primary-600 mt-1">₹{alert.price.toLocaleString()}</p>}
                      {!alert.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" aria-label="Unread" />}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
