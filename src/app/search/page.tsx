"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { searchProducts, CATEGORIES } from "@/lib/products";
import { db, collection, query as fbQuery, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "@/lib/firebase";
import type { Product } from "@/types";
import { Search, SlidersHorizontal, Sparkles, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { debounce } from "@/lib/utils";
import toast from "react-hot-toast";

const PLATFORMS = ["All", "amazon", "flipkart", "meesho", "myntra"];
const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Rating", value: "rating" },
  { label: "Best Discount", value: "discount" },
];

function SearchContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  // Filters
  const [category, setCategory] = useState(initialCat);
  const [platform, setPlatform] = useState("All");
  const [sortBy, setSortBy] = useState<"" | "price_asc" | "price_desc" | "rating" | "discount">("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (user) {
      getDocs(fbQuery(collection(db, "wishlists"), where("userId", "==", user.uid)))
        .then(snap => setWishlistIds(new Set(snap.docs.map(d => d.data().productId))));
    }
  }, [user]);

  const doSearch = async (q: string) => {
    setLoading(true);
    setAiInsight("");
    try {
      const res = await searchProducts(q, {
        category: category || undefined,
        platform: platform !== "All" ? platform : undefined,
        sortBy: sortBy || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStockOnly || undefined,
      });
      setResults(res);
      if (q && res.length > 0) {
        setAiInsight(`Found ${res.length} results across multiple platforms. Gemini AI enhanced your search for better relevance.`);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (initialQ || initialCat) doSearch(initialQ); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ""}`);
    doSearch(query);
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) { router.push("/auth"); return; }
    if (wishlistIds.has(product.id)) {
      const q = fbQuery(collection(db, "wishlists"), where("userId", "==", user.uid), where("productId", "==", product.id));
      const snap = await getDocs(q);
      snap.docs.forEach(d => deleteDoc(doc(db, "wishlists", d.id)));
      setWishlistIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
      toast.success("Removed from wishlist");
    } else {
      await addDoc(collection(db, "wishlists"), { userId: user!.uid, productId: product.id, product, addedAt: serverTimestamp(), alertEnabled: true });
      setWishlistIds(prev => new Set(prev).add(product.id));
      toast.success("Added to wishlist!");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        {/* Search Bar */}
        <section className="py-8" aria-label="Product search">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" aria-hidden="true" />
              <label htmlFor="search-input" className="sr-only">Search products</label>
              <input id="search-input" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search across Amazon, Flipkart, Meesho, Myntra..." className="input-field pl-12 text-base" autoComplete="off" />
            </div>
            <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-white hover:bg-gray-50 transition-colors cursor-pointer font-medium text-gray-700 text-sm" aria-expanded={filtersOpen} aria-label="Toggle filters">
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" /> Filters
            </button>
            <button type="submit" className="btn-primary px-6 text-sm">Search</button>
          </form>

          {/* Filters Panel */}
          {filtersOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-white rounded-2xl border border-border shadow-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label htmlFor="cat-filter" className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <select id="cat-filter" value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm py-2">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Platform */}
                <div>
                  <label htmlFor="platform-filter" className="block text-xs font-semibold text-gray-600 mb-1.5">Platform</label>
                  <select id="platform-filter" value={platform} onChange={e => setPlatform(e.target.value)} className="input-field text-sm py-2">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p === "All" ? "All Platforms" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                {/* Sort */}
                <div>
                  <label htmlFor="sort-filter" className="block text-xs font-semibold text-gray-600 mb-1.5">Sort By</label>
                  <select id="sort-filter" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="input-field text-sm py-2">
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {/* Max Price */}
                <div>
                  <label htmlFor="price-filter" className="block text-xs font-semibold text-gray-600 mb-1.5">Max Price (₹)</label>
                  <input id="price-filter" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="No limit" className="input-field text-sm py-2" min="0" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input id="in-stock" type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-4 h-4 rounded text-primary-600 cursor-pointer" />
                <label htmlFor="in-stock" className="text-sm text-gray-700 cursor-pointer">In Stock Only</label>
              </div>
            </motion.div>
          )}
        </section>

        {/* AI Insight */}
        {aiInsight && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-sm" role="status">
            <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {aiInsight}
            <button onClick={() => setAiInsight("")} className="ml-auto p-1 hover:bg-blue-100 rounded cursor-pointer" aria-label="Dismiss insight"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-muted mb-4" aria-live="polite">{results.length} products found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ProductCard product={p} onWishlist={toggleWishlist} isWishlisted={wishlistIds.has(p.id)} />
                </motion.div>
              ))}
            </div>
          </>
        ) : query || category ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-muted mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">No results found</h2>
            <p className="text-muted mt-2">Try different keywords or <button onClick={() => { setQuery(""); setCategory(""); setPlatform("All"); setSortBy(""); setMaxPrice(""); doSearch(""); }} className="text-primary-600 underline cursor-pointer">clear filters</button></p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-primary-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">Search for anything</h2>
            <p className="text-muted mt-2 max-w-md mx-auto">Our Gemini AI searches across Amazon, Flipkart, Meesho, Myntra and local stores simultaneously.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface"><Navbar /></div>}>
      <SearchContent />
    </Suspense>
  );
}
