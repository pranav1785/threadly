"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight, ShoppingBag, Bell, Store, TrendingUp, Zap, Phone, ChevronRight } from "lucide-react";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { CATEGORIES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const STATS = [
  { label: "Products Indexed", value: "2M+" },
  { label: "Platforms", value: "10+" },
  { label: "Local Stores", value: "50K+" },
  { label: "Shoppers", value: "500K+" },
];

const FEATURES = [
  { icon: Search, title: "Universal AI Search", desc: "Gemini-powered search across all major platforms simultaneously.", color: "bg-blue-50 text-blue-600" },
  { icon: TrendingUp, title: "Trend Detection", desc: "AI tracks social signals to surface trending products first.", color: "bg-purple-50 text-purple-600" },
  { icon: Bell, title: "Real-time Alerts", desc: "Restock, price drop, and similar product notifications.", color: "bg-green-50 text-green-600" },
  { icon: Phone, title: "AI Store Calling", desc: "Sarvam AI calls nearby stores to confirm inventory for you.", color: "bg-orange-50 text-orange-600" },
  { icon: Store, title: "Offline Network", desc: "Browse 50K+ brick-and-mortar store inventories online.", color: "bg-pink-50 text-pink-600" },
  { icon: Zap, title: "Instant Comparison", desc: "Prices, delivery, and ratings across platforms in one view.", color: "bg-yellow-50 text-yellow-600" },
];

const TRENDING = [
  { name: "Sony WH-1000XM5", price: 24999, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", cat: "Electronics", discount: 29 },
  { name: "Nike Air Max 270", price: 8995, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300", cat: "Fashion", discount: 31 },
  { name: "MacBook Air M3", price: 114900, img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300", cat: "Electronics", discount: 15 },
  { name: "Dyson V15", price: 52900, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", cat: "Home", discount: 18 },
];

export default function LandingPage() {
  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white" aria-labelledby="hero-heading">
        <ParticleBackground color="#3B82F6" count={80} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 py-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" aria-hidden="true" /> Powered by Google Gemini AI
            </span>
          </motion.div>

          <motion.h1 id="hero-heading" className="font-heading text-5xl sm:text-6xl lg:text-7xl font-800 leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Find Anything,<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-orange-400 bg-clip-text text-transparent">Anywhere</span>
          </motion.h1>

          <motion.p className="text-xl text-blue-100/80 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Universal product discovery across Amazon, Flipkart, Meesho, Myntra and 50,000+ local stores.
          </motion.p>

          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto">
            <div className="flex items-center rounded-2xl bg-white/10 border-2 border-white/20 hover:border-blue-400 transition-all backdrop-blur-md">
              <Search className="absolute ml-4 w-5 h-5 text-blue-300" aria-hidden="true" />
              <label htmlFor="hero-search" className="sr-only">Search products</label>
              <input id="hero-search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder='Try "Sony headphones" or "white shirt for office"' className="flex-1 py-4 pl-12 pr-4 bg-transparent text-white placeholder-blue-200/60 outline-none" autoComplete="off" />
              <button type="submit" className="m-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer text-sm">
                Search <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {["iPhone 15", "Nike shoes", "Samsung TV", "Yoga mat"].map(s => (
                <button key={s} type="button" onClick={() => setQ(s)} className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-200 border border-white/15 cursor-pointer transition-colors">{s}</button>
              ))}
            </div>
          </motion.form>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link href="/auth?mode=signup" className="btn-cta text-base py-3.5 px-8">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" /> Start Shopping Free
            </Link>
            <Link href="/auth?role=retailer&mode=signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl transition-all cursor-pointer">
              <Store className="w-5 h-5" aria-hidden="true" /> List Your Store
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white" aria-label="Statistics">
        <dl className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <dd className="font-heading text-4xl font-bold text-gray-900">{value}</dd>
              <dt className="text-muted text-sm mt-1">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 max-w-7xl mx-auto" aria-labelledby="cat-heading">
        <h2 id="cat-heading" className="font-heading text-2xl font-bold text-center text-gray-900 mb-8">Shop Every Category</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/search?category=${encodeURIComponent(cat)}`} className="px-5 py-2.5 rounded-full border-2 border-border bg-white hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-medium text-sm transition-all cursor-pointer shadow-sm">{cat}</Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 bg-gray-50" aria-labelledby="trending-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 id="trending-heading" className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-primary-600" aria-hidden="true" /> Trending Now
            </h2>
            <Link href="/auth" className="flex items-center gap-1 text-primary-600 font-medium text-sm hover:underline cursor-pointer">View all <ChevronRight className="w-4 h-4" aria-hidden="true" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRENDING.map(p => (
              <Link key={p.name} href="/auth" className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-lg">-{p.discount}%</span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-muted">{p.cat}</span>
                  <h3 className="font-heading font-semibold text-gray-900 mt-1 line-clamp-1">{p.name}</h3>
                  <p className="text-primary-700 font-bold mt-1">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-heading text-3xl font-bold text-center text-gray-900 mb-4">Everything You Need</h2>
        <p className="text-center text-muted mb-12 max-w-xl mx-auto text-sm">From AI search to agentic store calling — Threadly is the only platform you need.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card hover:shadow-card-hover transition-shadow space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`} aria-hidden="true">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700 text-white text-center px-4" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="font-heading text-4xl font-bold mb-4">Ready to find anything?</h2>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto">Join 500,000+ smart shoppers already using Threadly.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth?mode=signup" className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-2 shadow-lg">
            <Sparkles className="w-5 h-5" aria-hidden="true" /> Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400 text-sm px-4" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <span className="font-heading font-bold text-white">Threadly</span>
          </div>
          <p>© 2025 Threadly. Universal Product Discovery.</p>
          <nav aria-label="Footer links">
            <ul className="flex gap-6 list-none">
              {["Privacy", "Terms", "Contact"].map(l => <li key={l}><Link href="#" className="hover:text-white">{l}</Link></li>)}
            </ul>
          </nav>
        </div>
      </footer>
    </main>
  );
}
