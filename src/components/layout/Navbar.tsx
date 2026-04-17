"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, Search, Heart, Bell, MessageCircle, User,
  Store, LayoutDashboard, Package, TrendingUp, Menu, X,
  LogOut, ChevronDown, Sparkles
} from "lucide-react";

const customerNav = [
  { href: "/home", label: "Feed", icon: ShoppingBag },
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];

const retailerNav = [
  { href: "/retailer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/retailer/inventory", label: "Inventory", icon: Package },
  { href: "/retailer/requests", label: "Requests", icon: ShoppingBag },
  { href: "/retailer/trends", label: "Trends", icon: TrendingUp },
  { href: "/retailer/messages", label: "Messages", icon: MessageCircle },
];

export default function Navbar() {
  const { user, profile, role, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = role === "retailer" ? retailerNav : customerNav;

  return (
    <header className="navbar-blur fixed top-0 left-0 right-0 z-50 h-16" role="banner">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={user ? (role === "retailer" ? "/retailer/dashboard" : "/home") : "/"} className="flex items-center gap-3 flex-shrink-0 group" aria-label="Threadly Home">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <span className="font-heading font-800 text-2xl tracking-tighter text-gray-900 hidden sm:block">Threadly</span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer",
                  pathname === href
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth?bypass=true" className="btn-primary text-sm py-2.5 px-6 rounded-full font-800 shadow-glow">Get Started</Link>
            </div>
          ) : (
            <>
              <Link href={role === "retailer" ? "/retailer/dashboard" : "/requests"} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Requests">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              </Link>
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" aria-hidden="true" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[80px] truncate">
                    {profile?.displayName?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-border py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.displayName}</p>
                      <p className="text-xs text-muted truncate">{profile?.email}</p>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block",
                        role === "retailer" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>
                        {role === "retailer" ? "Retailer" : "Customer"}
                      </span>
                    </div>
                    <Link href={role === "retailer" ? "/retailer/settings" : "/profile"} role="menuitem" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4" aria-hidden="true" /> Profile
                    </Link>
                    <button role="menuitem" onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && user && (
        <nav className="md:hidden bg-white border-t border-border px-4 py-3 grid grid-cols-3 gap-2" aria-label="Mobile navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn("flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                pathname === href ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50")}>
              <Icon className="w-5 h-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
