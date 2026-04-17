"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getProductById, getCrossPlatformListings } from "@/lib/products";
import { db, collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from "@/lib/firebase";
import type { Product, PlatformListing } from "@/types";
import { formatPrice, PLATFORM_COLORS } from "@/lib/utils";
import { Heart, Star, ExternalLink, Bell, ArrowLeft, CheckCircle2, XCircle, Truck, Shield, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<PlatformListing[]>([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    const p = getProductById(id);
    if (!p) { router.push("/search"); return; }
    setProduct(p);
    setListings(getCrossPlatformListings(p.name));
    if (user) {
      getDocs(query(collection(db, "wishlists"), where("userId", "==", user.uid), where("productId", "==", id)))
        .then(snap => setWishlisted(!snap.empty));
    }
  }, [id, user, router]);

  const toggleWishlist = async () => {
    if (!user) { router.push("/auth"); return; }
    if (wishlisted) {
      const snap = await getDocs(query(collection(db, "wishlists"), where("userId", "==", user.uid), where("productId", "==", product!.id)));
      snap.docs.forEach(d => deleteDoc(doc(db, "wishlists", d.id)));
      setWishlisted(false); toast.success("Removed from wishlist");
    } else {
      await addDoc(collection(db, "wishlists"), { userId: user.uid, productId: product!.id, product, addedAt: serverTimestamp(), alertEnabled: true });
      setWishlisted(true); toast.success("Added to wishlist!");
    }
  };

  const setRestock = async () => {
    if (!user) { router.push("/auth"); return; }
    setRequesting(true);
    await addDoc(collection(db, "alerts"), { userId: user.uid, type: "restock", productId: product!.id, productName: product!.name, message: `Alert set for ${product!.name}`, read: false, createdAt: serverTimestamp() });
    setAlertSet(true); toast.success("Restock alert set! We'll notify you immediately.");
    setRequesting(false);
  };

  if (!product) return null;

  const bestListing = listings.sort((a, b) => a.price - b.price)[0];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        <nav aria-label="Breadcrumb" className="py-4">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li><Link href="/home" className="hover:text-primary-600 cursor-pointer">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/search" className="hover:text-primary-600 cursor-pointer">Search</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-700 font-medium truncate max-w-xs">{product.name}</li>
          </ol>
        </nav>

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-primary-600 mb-6 hover:underline cursor-pointer">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <motion.div className="relative h-96 bg-gray-50 rounded-3xl overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Image src={product.imageURL} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              {product.discount && (
                <span className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-xl">-{product.discount}%</span>
              )}
            </motion.div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="platform-badge" style={{ backgroundColor: `${PLATFORM_COLORS[product.platform]}20`, color: PLATFORM_COLORS[product.platform] }}>
                  {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                </span>
                <span className="tag text-xs">{product.category}</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.brand && <p className="text-muted mt-1">by <span className="font-medium text-gray-700">{product.brand}</span></p>}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" aria-label={`${product.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating!) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} aria-hidden="true" />
                  ))}
                </div>
                <span className="font-semibold text-gray-700">{product.rating}</span>
                <span className="text-muted text-sm">({product.reviews?.toLocaleString()} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-green-600 font-bold">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className={`flex items-center gap-2 font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
              {product.inStock ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <XCircle className="w-5 h-5" aria-hidden="true" />}
              {product.inStock ? "In Stock" : "Out of Stock"}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={toggleWishlist} className={`btn-secondary flex items-center gap-2 ${wishlisted ? "border-accent text-accent bg-red-50" : ""}`} aria-pressed={wishlisted} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} aria-hidden="true" />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              {!product.inStock && (
                <button onClick={setRestock} disabled={alertSet || requesting} className="btn-primary flex items-center gap-2" aria-label="Set restock alert">
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {alertSet ? "Alert Set!" : "Alert Me"}
                </button>
              )}
              {product.platformUrl && (
                <a href={product.platformUrl} target="_blank" rel="noopener noreferrer" className="btn-cta flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" aria-hidden="true" /> Buy on {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                </a>
              )}
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 rounded-2xl">
              <h2 className="font-semibold text-gray-900 mb-2">About this product</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
              {product.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.tags.map(t => <span key={t} className="tag text-xs">{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cross-platform price comparison */}
        <section className="mt-12" aria-labelledby="price-compare">
          <h2 id="price-compare" className="font-heading text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" aria-hidden="true" /> Price Comparison Across Platforms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((l) => (
              <div key={l.platform} className={`card hover:shadow-card-hover transition-shadow border-2 ${l.price === bestListing?.price ? "border-green-400" : "border-transparent"}`}>
                {l.price === bestListing?.price && (
                  <span className="inline-block mb-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Best Price</span>
                )}
                <h3 className="font-heading font-bold text-lg text-gray-900">{l.platform}</h3>
                <p className="text-2xl font-bold text-primary-700 mt-1">{formatPrice(l.price)}</p>
                <div className="mt-3 space-y-2 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    {l.inStock ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    {l.inStock ? "In Stock" : "Out of Stock"}
                  </div>
                  {l.deliveryDays && (
                    <div className="flex items-center gap-2"><Truck className="w-4 h-4" aria-hidden="true" /> {l.deliveryDays} day delivery</div>
                  )}
                  {l.seller && <p className="text-xs">{l.seller}</p>}
                </div>
                {l.inStock && (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full btn-primary text-sm py-2 flex items-center justify-center gap-1">
                    Buy Now <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-muted">
          {[{ icon: Shield, text: "Secure AI Search" }, { icon: Truck, text: "Multi-platform Delivery" }, { icon: CheckCircle2, text: "Verified Listings" }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2"><Icon className="w-5 h-5 text-green-500" aria-hidden="true" />{text}</div>
          ))}
        </div>
      </main>
    </div>
  );
}
