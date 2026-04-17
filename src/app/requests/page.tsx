"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, addDoc, query, where, getDocs, serverTimestamp, onSnapshot, updateDoc, doc } from "@/lib/firebase";
import type { ProductRequest } from "@/types";
import { ShoppingBag, Plus, X, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { CATEGORIES } from "@/lib/products";

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<(ProductRequest & { docId: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ productName: "", description: "", category: "", maxPrice: "" });

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "requests"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      setRequests(snap.docs.map(d => ({ docId: d.id, ...(d.data() as ProductRequest) }))
        .sort((a, b) => (b.createdAt as unknown as number) - (a.createdAt as unknown as number)));
    });
    return () => unsub();
  }, [user]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName || !form.description) { toast.error("Please fill in product name and description"); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "requests"), {
        userId: user!.uid, userEmail: user!.email,
        productName: form.productName, description: form.description,
        category: form.category, maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
        status: "open", broadcasts: 0, responses: [],
        createdAt: serverTimestamp(),
      });
      toast.success("Request submitted! We're notifying retailers now.");
      setForm({ productName: "", description: "", category: "", maxPrice: "" });
      setShowForm(false);
    } catch { toast.error("Failed to submit request"); }
    finally { setSubmitting(false); }
  };

  const STATUS_CONFIG = {
    open: { icon: Clock, color: "text-blue-600 bg-blue-50", label: "Open" },
    fulfilled: { icon: CheckCircle2, color: "text-green-600 bg-green-50", label: "Fulfilled" },
    closed: { icon: XCircle, color: "text-gray-600 bg-gray-50", label: "Closed" },
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-3xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary-600" aria-hidden="true" /> My Requests
          </h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            {showForm ? <X className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
            {showForm ? "Cancel" : "New Request"}
          </button>
        </div>

        {/* Request Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="card mb-8 border-2 border-primary-100">
              <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Request a Product</h2>
              <form onSubmit={submitRequest} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="req-name" className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span aria-hidden="true" className="text-accent">*</span></label>
                  <input id="req-name" type="text" required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} className="input-field" placeholder="e.g. Sony WH-1000XM5 Headphones" />
                </div>
                <div>
                  <label htmlFor="req-desc" className="block text-sm font-medium text-gray-700 mb-1.5">Description <span aria-hidden="true" className="text-accent">*</span></label>
                  <textarea id="req-desc" required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Describe what you're looking for, preferred color, size, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="req-cat" className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select id="req-cat" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                      <option value="">Any Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="req-price" className="block text-sm font-medium text-gray-700 mb-1.5">Max Budget (₹)</label>
                    <input id="req-price" type="number" min="0" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} className="input-field" placeholder="Optional" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ShoppingBag className="w-4 h-4" aria-hidden="true" />}
                  Submit Request
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requests list */}
        {requests.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">No requests yet</h2>
            <p className="text-muted mt-2">Can&apos;t find what you&apos;re looking for? Request it and retailers will respond!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-6 inline-flex">Create First Request</button>
          </div>
        ) : (
          <div className="space-y-4" role="list">
            {requests.map(req => {
              const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
              const Icon = sc.icon;
              return (
                <motion.div key={req.docId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card hover:shadow-card-hover transition-shadow" role="listitem">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-gray-900">{req.productName}</h3>
                      <p className="text-sm text-muted mt-1">{req.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted">
                        {req.category && <span className="tag">{req.category}</span>}
                        {req.maxPrice && <span>Budget: ₹{req.maxPrice.toLocaleString()}</span>}
                        <span>{req.createdAt && formatRelativeTime(req.createdAt as unknown as Date)}</span>
                        <span>{req.broadcasts || 0} retailers notified</span>
                        <span>{req.responses?.length || 0} responses</span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${sc.color}`}>
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {sc.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
