"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { getTrendingProducts, CATEGORIES } from "@/lib/products";
import { db, collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "@/lib/firebase";
import type { Product, WishlistItem } from "@/types";
import { TrendingUp, Sparkles, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [selectedCat, setSelectedCat] = useState("All");
  const [loadingProds, setLoadingProds] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  useEffect(() => {
    const prods = getTrendingProducts(selectedCat === "All" ? undefined : selectedCat);
    setProducts(prods);
    setLoadingProds(false);
  }, [selectedCat]);

  useEffect(() => {
    if (!user) return;
    const fetchWishlist = async () => {
      const q = query(collection(db, "wishlists"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setWishlistIds(new Set(snap.docs.map(d => d.data().productId)));
    };
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) { router.push("/auth"); return; }
    if (wishlistIds.has(product.id)) {
      const q = query(collection(db, "wishlists"), where("userId", "==", user.uid), where("productId", "==", product.id));
      const snap = await getDocs(q);
      snap.docs.forEach(d => deleteDoc(doc(db, "wishlists", d.id)));
      setWishlistIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
      toast.success("Removed from wishlist");
    } else {
      await addDoc(collection(db, "wishlists"), { userId: user.uid, productId: product.id, product, addedAt: serverTimestamp(), alertEnabled: true });
      setWishlistIds(prev => new Set(prev).add(product.id));
      toast.success("Added to wishlist!");
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        {/* Welcome banner */}
        <motion.div className="my-8 p-6 bg-gradient-to-r from-primary-600 to-blue-700 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              Welcome back, {profile?.displayName?.split(" ")[0] || "Shopper"}! 👋
            </h1>
            <p className="text-blue-100 mt-1 text-sm">Discover deals across all platforms with AI-powered search</p>
          </div>
          <Link href="/search" className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0">
            <Search className="w-5 h-5" aria-hidden="true" /> Start Searching
          </Link>
        </motion.div>

        {/* Categories filter */}
        <section aria-labelledby="categories-filter">
          <h2 id="categories-filter" className="font-heading text-xl font-bold text-gray-900 mb-4">Browse Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setSelectedCat(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCat === cat ? "bg-primary-600 text-white shadow-md" : "bg-white text-gray-600 border border-border hover:border-primary-400"}`} aria-pressed={selectedCat === cat}>
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Trending products */}
        <section className="mt-10" aria-labelledby="trending-section">
          <div className="flex items-center justify-between mb-6">
            <h2 id="trending-section" className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" aria-hidden="true" />
              {selectedCat === "All" ? "Trending Products" : selectedCat}
            </h2>
            <Link href="/search" className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:underline cursor-pointer">
              View all <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {loadingProds ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={p} onWishlist={toggleWishlist} isWishlisted={wishlistIds.has(p.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* AI Picks banner */}
        <section className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl border border-purple-100" aria-labelledby="ai-picks">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 id="ai-picks" className="font-heading text-lg font-bold text-gray-900">AI-Powered For You</h2>
              <p className="text-muted text-sm mt-1">Our Gemini AI analyzes your preferences to surface personalized recommendations. Browse more to improve suggestions!</p>
              <Link href="/search" className="mt-3 btn-primary text-sm py-2 px-4 inline-flex">Explore Recommendations</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
