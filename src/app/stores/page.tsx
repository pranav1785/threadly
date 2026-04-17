"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Phone, Star, ChevronRight, Loader2, Search, PhoneCall, CheckCircle2, XCircle } from "lucide-react";
import type { StoreNearby, CallResult } from "@/types";
import { initiateInventoryCall } from "@/lib/sarvam";
import { db, addDoc, collection, serverTimestamp } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Mock nearby stores data
const MOCK_STORES: StoreNearby[] = [
  { id: "s1", storeName: "TechWorld Electronics", address: "12, MG Road, Connaught Place", city: "New Delhi", phone: "+91-9876543210", distance: 0.8, categories: ["Electronics", "Accessories"], lat: 28.6139, lng: 77.2090, rating: 4.5, isOpen: true },
  { id: "s2", storeName: "Fashion Hub", address: "45, Linking Road, Bandra", city: "Mumbai", phone: "+91-9876543211", distance: 1.2, categories: ["Fashion", "Jewellery"], lat: 19.0596, lng: 72.8295, rating: 4.3, isOpen: true },
  { id: "s3", storeName: "HomeStyle Store", address: "78, Brigade Road", city: "Bengaluru", phone: "+91-9876543212", distance: 2.1, categories: ["Home & Kitchen", "Furniture"], lat: 12.9716, lng: 77.5946, rating: 4.1, isOpen: false },
  { id: "s4", storeName: "BookCorner & More", address: "22, Park Street", city: "Kolkata", phone: "+91-9876543213", distance: 0.5, categories: ["Books", "Toys & Games"], lat: 22.5726, lng: 88.3639, rating: 4.7, isOpen: true },
  { id: "s5", storeName: "Sports Arena", address: "56, FC Road, Shivajinagar", city: "Pune", phone: "+91-9876543214", distance: 3.4, categories: ["Sports & Fitness", "Outdoor"], lat: 18.5204, lng: 73.8567, rating: 4.2, isOpen: true },
  { id: "s6", storeName: "Beauty Lounge", address: "9, Anna Salai", city: "Chennai", phone: "+91-9876543215", distance: 1.7, categories: ["Beauty & Personal Care", "Health"], lat: 13.0827, lng: 80.2707, rating: 4.6, isOpen: true },
];

export default function StoresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<StoreNearby[]>(MOCK_STORES);
  const [search, setSearch] = useState("");
  const [calling, setCalling] = useState<string | null>(null);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [callStore, setCallStore] = useState<StoreNearby | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  const filtered = stores.filter(s =>
    !search || s.storeName.toLowerCase().includes(search.toLowerCase()) ||
    s.categories.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAICall = async (store: StoreNearby) => {
    if (!productQuery.trim()) { toast.error("Enter the product you want to check"); return; }
    setCalling(store.id); setCallStore(store); setCallResult(null); setShowCallModal(true);
    toast.loading("AI agent is calling the store...", { id: "call" });
    try {
      const result = await initiateInventoryCall({
        storePhone: store.phone, storeName: store.storeName,
        productName: productQuery, productDetails: `Customer is looking for ${productQuery}`,
        userId: user!.uid,
      });
      setCallResult(result);
      await addDoc(collection(db, "aicalls"), { userId: user!.uid, storeId: store.id, storeName: store.storeName, product: productQuery, result, createdAt: serverTimestamp() });
      toast.success("Call completed!", { id: "call" });
    } catch {
      toast.error("Call failed", { id: "call" });
    } finally { setCalling(null); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-6xl mx-auto px-4 pb-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 py-8 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary-600" aria-hidden="true" /> Nearby Stores
        </h1>

        {/* AI Call Product Input */}
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <PhoneCall className="w-6 h-6 text-primary-600" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-bold text-gray-900">Sarvam AI Store Calling</h2>
              <p className="text-sm text-muted">Our AI agent calls stores on your behalf to check product availability</p>
            </div>
          </div>
          <div className="flex gap-3">
            <label htmlFor="product-query" className="sr-only">Product to search</label>
            <input id="product-query" type="text" value={productQuery} onChange={e => setProductQuery(e.target.value)} placeholder="What product are you looking for?" className="input-field flex-1" />
          </div>
        </div>

        {/* Search filter */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <label htmlFor="store-search" className="sr-only">Search stores</label>
          <input id="store-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stores by name or category..." className="input-field pl-10" />
        </div>

        {/* Stores grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {filtered.map(store => (
            <motion.article key={store.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card hover:shadow-card-hover transition-shadow" role="listitem" aria-label={store.storeName}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-bold text-gray-900">{store.storeName}</h3>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" aria-hidden="true" /> {store.address}, {store.city}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${store.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {store.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-muted">
                {store.rating && (
                  <span className="flex items-center gap-1 text-amber-600"><Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> {store.rating}</span>
                )}
                {store.distance && <span><MapPin className="w-3.5 h-3.5 inline" aria-hidden="true" /> {store.distance} km away</span>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {store.categories.map(c => <span key={c} className="tag text-xs">{c}</span>)}
              </div>

              <div className="flex gap-2">
                <a href={`tel:${store.phone}`} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1" aria-label={`Call ${store.storeName}`}>
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" /> Call
                </a>
                <button onClick={() => handleAICall(store)} disabled={calling === store.id || !productQuery.trim()} className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1 disabled:opacity-50" aria-label={`AI call ${store.storeName} to check inventory`}>
                  {calling === store.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />}
                  AI Call
                </button>
                <button className="p-2 rounded-xl border border-border hover:bg-gray-50 cursor-pointer" aria-label="View store details">
                  <ChevronRight className="w-4 h-4 text-muted" aria-hidden="true" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Call Result Modal */}
        <AnimatePresence>
          {showCallModal && callStore && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="call-result-title">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                  {!callResult ? (
                    <>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <PhoneCall className="w-8 h-8 text-blue-600" aria-hidden="true" />
                      </div>
                      <h3 id="call-result-title" className="font-heading text-xl font-bold text-gray-900">AI Agent Calling...</h3>
                      <p className="text-muted mt-2">Calling {callStore.storeName} to check for <strong>{productQuery}</strong></p>
                      <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mt-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${callResult.inventoryFound ? "bg-green-100" : "bg-red-100"}`}>
                        {callResult.inventoryFound ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-500" />}
                      </div>
                      <h3 id="call-result-title" className="font-heading text-xl font-bold text-gray-900">{callResult.message}</h3>
                      {callResult.inventoryFound && callResult.price && <p className="text-2xl font-bold text-primary-600 mt-2">₹{callResult.price.toLocaleString()}</p>}
                      {callResult.quantity && <p className="text-muted text-sm mt-1">{callResult.quantity} units available</p>}
                      {callResult.transcript && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-left text-xs text-gray-600 max-h-32 overflow-y-auto">
                          <p className="font-semibold mb-1">Call Transcript:</p>
                          <p>{callResult.transcript}</p>
                        </div>
                      )}
                      <div className="flex gap-3 mt-6">
                        {callResult.inventoryFound && <a href={`tel:${callStore.phone}`} className="flex-1 btn-cta text-sm">Book Now</a>}
                        <button onClick={() => { setShowCallModal(false); setCallResult(null); }} className="flex-1 btn-secondary text-sm">Close</button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
