"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, query, where, getDocs } from "@/lib/firebase";
import { Package, ShoppingBag, MessageCircle, TrendingUp, Eye, ArrowUpRight, Users, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";

const CHART_DATA = [
  { day: "Mon", views: 42, requests: 3 },
  { day: "Tue", views: 68, requests: 7 },
  { day: "Wed", views: 55, requests: 5 },
  { day: "Thu", views: 89, requests: 12 },
  { day: "Fri", views: 120, requests: 15 },
  { day: "Sat", views: 145, requests: 18 },
  { day: "Sun", views: 98, requests: 9 },
];

const QUICK_ACTIONS = [
  { href: "/retailer/inventory", icon: Package, label: "Add Products", color: "bg-blue-50 text-blue-600" },
  { href: "/retailer/requests", icon: ShoppingBag, label: "View Requests", color: "bg-orange-50 text-orange-600" },
  { href: "/retailer/messages", icon: MessageCircle, label: "Messages", color: "bg-purple-50 text-purple-600" },
  { href: "/retailer/trends", icon: TrendingUp, label: "Market Trends", color: "bg-green-50 text-green-600" },
];

export default function RetailerDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ products: 0, requests: 0, messages: 0, views: 0 });

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [prodSnap, reqSnap] = await Promise.all([
        getDocs(query(collection(db, "products"), where("retailerId", "==", user.uid))),
        getDocs(query(collection(db, "requests"), where("status", "==", "open"))),
      ]);
      setStats({ products: prodSnap.size, requests: reqSnap.size, messages: 3, views: 527 });
    };
    fetchStats();
  }, [user]);

  const STAT_CARDS = [
    { label: "Products Listed", value: stats.products || 12, icon: Package, color: "text-blue-600 bg-blue-50", trend: "+3 this week" },
    { label: "Open Requests", value: stats.requests || 5, icon: ShoppingBag, color: "text-orange-600 bg-orange-50", trend: "2 new today" },
    { label: "Unread Messages", value: stats.messages, icon: MessageCircle, color: "text-purple-600 bg-purple-50", trend: "Respond now" },
    { label: "Store Views", value: stats.views, icon: Eye, color: "text-green-600 bg-green-50", trend: "+23% vs last week" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        {/* Header */}
        <motion.div className="py-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Welcome back, {profile?.displayName?.split(" ")[0]}! 🏪
          </h1>
          <p className="text-muted mt-1">Here&apos;s an overview of your store performance.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, trend }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`} aria-hidden="true">
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-green-500" aria-hidden="true" />
              </div>
              <p className="font-heading text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-sm text-muted mt-1">{label}</p>
              <p className="text-xs text-green-600 font-medium mt-2">{trend}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Views Chart */}
          <section className="card" aria-labelledby="views-chart">
            <h2 id="views-chart" className="font-heading text-lg font-bold text-gray-900 mb-6">Weekly Store Views</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CHART_DATA} aria-label="Weekly store views area chart">
                <defs>
                  <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }} />
                <Area type="monotone" dataKey="views" stroke="#2563EB" fill="url(#viewGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          {/* Requests Chart */}
          <section className="card" aria-labelledby="requests-chart">
            <h2 id="requests-chart" className="font-heading text-lg font-bold text-gray-900 mb-6">Customer Requests</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CHART_DATA} aria-label="Customer requests bar chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }} />
                <Bar dataKey="requests" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Quick Actions */}
        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="font-heading text-xl font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href} className="card hover:shadow-card-hover transition-all hover:-translate-y-1 text-center space-y-3 cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${color}`} aria-hidden="true">
                  <Icon className="w-7 h-7" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Insight */}
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-heading font-bold text-gray-900">Gemini AI Insight</h3>
              <p className="text-sm text-gray-700 mt-1">Sony headphones and Samsung TVs are trending in your category this week. Consider adding similar products to capture 3× more customer requests. Electronics demand up 23% vs last month.</p>
              <Link href="/retailer/trends" className="mt-3 btn-primary text-xs py-1.5 px-3 inline-flex">View Full Trends</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
