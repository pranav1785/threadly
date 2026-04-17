"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, query, where, getDocs, deleteDoc, doc, onSnapshot } from "@/lib/firebase";
import type { WishlistItem } from "@/types";
import { formatPrice, formatRelativeTime, PLATFORM_COLORS } from "@/lib/utils";
import { Heart, Trash2, ExternalLink, Bell, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<(WishlistItem & { docId: string })[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "wishlists"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ docId: d.id, ...(d.data() as WishlistItem) })));
      setFetching(false);
    });
    return () => unsub();
  }, [user]);

  const removeItem = async (docId: string, name: string) => {
    await deleteDoc(doc(db, "wishlists", docId));
    toast.success(`${name} removed from wishlist`);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-5xl mx-auto px-4 pb-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 py-8 flex items-center gap-3">
          <Heart className="w-8 h-8 text-accent fill-current" aria-hidden="true" /> Wishlist
          <span className="text-lg font-normal text-muted">({items.length} items)</span>
        </h1>

        {fetching ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="text-muted mt-2">Save products you love and get alerts when they go on sale.</p>
            <Link href="/search" className="btn-primary mt-6 inline-flex">Start Exploring</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.article key={item.docId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl shadow-card p-4 flex gap-4 items-center hover:shadow-card-hover transition-shadow" aria-label={item.product?.name}>
                  <Link href={`/product/${item.product?.id}`} className="flex-shrink-0">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                      {item.product?.imageURL && <Image src={item.product.imageURL} alt={item.product.name} fill className="object-cover" sizes="80px" />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="platform-badge text-xs mb-1" style={{ backgroundColor: `${PLATFORM_COLORS[item.product?.platform || "other"]}20`, color: PLATFORM_COLORS[item.product?.platform || "other"] }}>
                          {item.product?.platform}
                        </span>
                        <h3 className="font-heading font-semibold text-gray-900 line-clamp-1">{item.product?.name}</h3>
                        <p className="text-primary-700 font-bold mt-1">{item.product?.price && formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Bell className="w-4 h-4 text-muted cursor-pointer hover:text-primary-600 transition-colors" aria-label="Alert enabled" />
                        <button onClick={() => removeItem(item.docId, item.product?.name || "")} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors cursor-pointer" aria-label={`Remove ${item.product?.name} from wishlist`}>
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium ${item.product?.inStock ? "text-green-600" : "text-red-500"}`}>
                        {item.product?.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      {item.addedAt && <span className="text-xs text-muted">Added {formatRelativeTime(item.addedAt as unknown as Date)}</span>}
                      {item.product?.platformUrl && (
                        <a href={item.product.platformUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline cursor-pointer">
                          Buy <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-blue-800">
                <strong>Smart Alerts Active:</strong> We&apos;ll notify you when any wishlisted item restocks, drops in price, or a similar product becomes available.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
