"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Store, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import type { UserRole } from "@/types";
import ParticleBackground from "@/components/ui/ParticleBackground";

function AuthForm() {
  const { signInWithGoogle, signInEmail, signUpEmail, signInAsGuest } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRole = (searchParams.get("role") as UserRole) || "customer";
  const initialMode = searchParams.get("mode") || "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode as "login" | "signup");
  const [role, setRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    if (searchParams.get("bypass") === "true") {
      signInAsGuest(role).then(() => redirect(role));
    }
  }, [searchParams, role]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = (r: UserRole) => router.push(r === "retailer" ? "/retailer/dashboard" : "/home");

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try { await signInWithGoogle(role); redirect(role); }
    catch { setError("Google sign-in failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "signup") { await signUpEmail(email, password, name, role); }
      else { await signInEmail(email, password); }
      redirect(role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, ""));
    } finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setLoading(true);
    await signInAsGuest(role);
    redirect(role);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-surface px-4 py-20">
      <ParticleBackground color="#4285F4" count={60} />
      <motion.div className="relative z-10 w-full max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-card">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Sparkles className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-3xl font-800 text-gray-900 tracking-tight">
              {mode === "login" ? "Welcome back" : "Join Threadly"}
            </h1>
            <p className="text-gray-500 font-medium mt-2">Universal Product Discovery</p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-2xl bg-gray-50 p-1.5 mb-8" role="group" aria-label="Select account type">
            {(["customer", "retailer"] as UserRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)} type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${role === r ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                aria-pressed={role === r}>
                {r === "customer" ? <ShoppingBag className="w-4 h-4" aria-hidden="true" /> : <Store className="w-4 h-4" aria-hidden="true" />}
                {r === "customer" ? "Customer" : "Retailer"}
              </button>
            ))}
          </div>

          {/* Guest Bypass - PRIMARY OPTION NOW */}
          <button onClick={handleGuest} disabled={loading} className="w-full btn-primary py-4 rounded-2xl font-800 mb-4 flex items-center justify-center gap-2 shadow-glow">
            Continue as Guest {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 mb-8 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Sign In
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Experimental Auth</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Pranav Bhatnagar" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative">
                <input id="password" type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-5 py-4 pr-14 rounded-2xl bg-gray-50 border-none text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 cursor-pointer p-1" aria-label={showPwd ? "Hide password" : "Show password"}>
                  {showPwd ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100" role="alert">{error}</p>}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-black text-white font-800 rounded-2xl transition-all cursor-pointer disabled:opacity-50 shadow-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="w-5 h-5" aria-hidden="true" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm font-medium mt-8">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary hover:underline font-bold cursor-pointer">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
