"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { TrendingUp, Sparkles, ArrowUpRight, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { motion } from "framer-motion";

const TREND_DATA = [
  { week: "W1", electronics: 65, fashion: 40, home: 30, sports: 20 },
  { week: "W2", electronics: 72, fashion: 55, home: 38, sports: 28 },
  { week: "W3", electronics: 68, fashion: 48, home: 42, sports: 35 },
  { week: "W4", electronics: 90, fashion: 62, home: 45, sports: 30 },
  { week: "W5", electronics: 95, fashion: 70, home: 50, sports: 40 },
  { week: "W6", electronics: 88, fashion: 75, home: 55, sports: 45 },
];

const RADAR_DATA = [
  { category: "Electronics", demand: 90 },
  { category: "Fashion", demand: 75 },
  { category: "Home", demand: 55 },
  { category: "Sports", demand: 45 },
  { category: "Beauty", demand: 68 },
  { category: "Books", demand: 35 },
];

const TOP_TRENDS = [
  { rank: 1, keyword: "Sony Noise Cancelling", growth: "+124%", category: "Electronics", color: "text-blue-600 bg-blue-50" },
  { rank: 2, keyword: "Sustainable Fashion", growth: "+89%", category: "Fashion", color: "text-purple-600 bg-purple-50" },
  { rank: 3, keyword: "Air Fryer", growth: "+76%", category: "Home & Kitchen", color: "text-orange-600 bg-orange-50" },
  { rank: 4, keyword: "Yoga Mat Premium", growth: "+65%", category: "Sports", color: "text-green-600 bg-green-50" },
  { rank: 5, keyword: "Vitamin C Serum", growth: "+58%", category: "Beauty", color: "text-pink-600 bg-pink-50" },
  { rank: 6, keyword: "Mechanical Keyboard", growth: "+52%", category: "Electronics", color: "text-blue-600 bg-blue-50" },
];

const AI_INSIGHTS = [
  "Electronics demand peaked this week — Sony and Apple products lead by 34% over last month.",
  "Fast fashion declining; premium sustainable brands up 89% — stock ethically sourced items.",
  "Kitchen appliances trending ahead of festive season — air fryers and instant pots most searched.",
  "Sports equipment demand rising as gym culture grows — resistance bands, yoga gear most queried.",
];

export default function TrendsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [insight, setInsight] = useState(0);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  useEffect(() => {
    const t = setInterval(() => setInsight(i => (i + 1) % AI_INSIGHTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        <div className="py-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary-600" aria-hidden="true" /> Market Trends
          </h1>
          <span className="flex items-center gap-2 text-sm text-primary-600 font-medium">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> Powered by Gemini AI
          </span>
        </div>

        {/* AI Insight Banner */}
        <motion.div key={insight} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl text-white">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-300 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium text-sm">{AI_INSIGHTS[insight]}</p>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <section className="card lg:col-span-2" aria-labelledby="trend-chart">
            <h2 id="trend-chart" className="font-heading text-lg font-bold text-gray-900 mb-6">Category Demand Trends (6 weeks)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={TREND_DATA} aria-label="Category demand trends over 6 weeks">
                <defs>
                  {["#2563EB", "#F97316", "#10B981", "#8B5CF6"].map((c, i) => (
                    <linearGradient key={c} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px" }} />
                <Area type="monotone" dataKey="electronics" stroke="#2563EB" fill="url(#grad0)" strokeWidth={2} name="Electronics" />
                <Area type="monotone" dataKey="fashion" stroke="#F97316" fill="url(#grad1)" strokeWidth={2} name="Fashion" />
                <Area type="monotone" dataKey="home" stroke="#10B981" fill="url(#grad2)" strokeWidth={2} name="Home" />
                <Area type="monotone" dataKey="sports" stroke="#8B5CF6" fill="url(#grad3)" strokeWidth={2} name="Sports" />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <section className="card" aria-labelledby="radar-chart">
            <h2 id="radar-chart" className="font-heading text-lg font-bold text-gray-900 mb-6">Category Demand Score</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={RADAR_DATA} aria-label="Category demand radar chart">
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Demand" dataKey="demand" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Top Trending Keywords */}
        <section aria-labelledby="top-trends">
          <h2 id="top-trends" className="font-heading text-2xl font-bold text-gray-900 mb-6">Top Trending Keywords</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOP_TRENDS.map(({ rank, keyword, growth, category, color }, i) => (
              <motion.div key={keyword} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-heading font-bold text-gray-500 flex-shrink-0">
                  {rank}
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-gray-900">{keyword}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{category}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold text-sm flex-shrink-0">
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" /> {growth}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
