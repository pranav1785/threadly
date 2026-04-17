"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "@/lib/firebase";
import type { ProductRequest } from "@/types";
import { ShoppingBag, Clock, CheckCircle2, MessageCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatRelativeTime, formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function RetailerRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<(ProductRequest & { docId: string })[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState({ message: "", price: "", available: true });

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, "requests"), where("status", "==", "open"));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ docId: d.id, ...(d.data() as ProductRequest) }))
        .sort((a, b) => (b.createdAt as unknown as number) - (a.createdAt as unknown as number)));
    });
    return () => unsub();
  }, []);

  const sendResponse = async (req: ProductRequest & { docId: string }) => {
    if (!responseForm.message) { toast.error("Please enter a message"); return; }
    setResponding(req.docId);
    try {
      const response = {
        retailerId: user!.uid, storeName: "My Store",
        message: responseForm.message, price: responseForm.price ? Number(responseForm.price) : undefined,
        available: responseForm.available, respondedAt: new Date(),
      };
      await updateDoc(doc(db, "requests", req.docId), {
        responses: [...(req.responses || []), response],
        status: responseForm.available ? "fulfilled" : req.status,
      });
      await addDoc(collection(db, "alerts"), {
        userId: req.userId, type: "request_fulfilled",
        productName: req.productName, message: `A retailer responded to your request for ${req.productName}`,
        read: false, createdAt: serverTimestamp(),
      });
      toast.success("Response sent successfully!");
      setExpanded(null);
      setResponseForm({ message: "", price: "", available: true });
    } catch { toast.error("Failed to send response"); }
    finally { setResponding(null); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-4xl mx-auto px-4 pb-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 py-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary-600" aria-hidden="true" /> Customer Requests
          <span className="text-lg font-normal text-muted">({requests.length} open)</span>
        </h1>

        {requests.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">No open requests</h2>
            <p className="text-muted mt-2">Customer requests will appear here. Add more products to attract buyers!</p>
          </div>
        ) : (
          <div className="space-y-4" role="list">
            {requests.map(req => (
              <motion.div key={req.docId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-card overflow-hidden" role="listitem">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-gray-900">{req.productName}</h3>
                        {req.category && <span className="tag text-xs">{req.category}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" />{req.createdAt && formatRelativeTime(req.createdAt as unknown as Date)}</span>
                        {req.maxPrice && <span>Budget: {formatPrice(req.maxPrice)}</span>}
                        <span>{req.responses?.length || 0} responses so far</span>
                      </div>
                    </div>
                    <button onClick={() => setExpanded(expanded === req.docId ? null : req.docId)} className="flex items-center gap-1 text-primary-600 text-sm font-medium cursor-pointer hover:underline flex-shrink-0" aria-expanded={expanded === req.docId} aria-controls={`response-form-${req.docId}`}>
                      Respond {expanded === req.docId ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === req.docId && (
                    <motion.div id={`response-form-${req.docId}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
                      <div className="p-5 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-4">Your Response</h4>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor={`msg-${req.docId}`} className="block text-sm font-medium text-gray-700 mb-1.5">Message to Customer</label>
                            <textarea id={`msg-${req.docId}`} rows={3} value={responseForm.message} onChange={e => setResponseForm(f => ({ ...f, message: e.target.value }))} className="input-field resize-none" placeholder="Describe your availability, price, and any relevant details..." />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor={`price-${req.docId}`} className="block text-sm font-medium text-gray-700 mb-1.5">Your Price (₹)</label>
                              <input id={`price-${req.docId}`} type="number" min="0" value={responseForm.price} onChange={e => setResponseForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="Optional" />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer mb-3">
                                <input type="checkbox" checked={responseForm.available} onChange={e => setResponseForm(f => ({ ...f, available: e.target.checked }))} className="w-4 h-4 rounded text-primary-600" />
                                <span className="text-sm font-medium text-gray-700">Available</span>
                              </label>
                            </div>
                          </div>
                          <button onClick={() => sendResponse(req)} disabled={responding === req.docId} className="btn-primary w-full">
                            {responding === req.docId ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <MessageCircle className="w-4 h-4" aria-hidden="true" />}
                            Send Response
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
