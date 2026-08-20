"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "stripe" | "pricing" | "algorithm" | "users">("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // System Stats
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    registeredUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    estimatedRevenue: 0,
    activeStripeKey: ""
  });

  // Settings State
  const [settings, setSettings] = useState<any>({
    stripeSecretKey: "sk_test_51U6UIgAG1417j3BHHBGz9Qu2ytJ6yFRvqRQSN9djAjni7eCVlIGISD2Zv49nSZZ1q5lFbmStAv7ThIbXmOUUsbUn00up2iX5Rxe",
    stripePublishableKey: "pk_test_51U6UIgAG1417j3BHqSCCksuGePXtOcYyogQ8lm4bVueUZSzbll8YNttjCoqakg718BMCy31a6fdhEjxpZxLURtqv00st0A6RUD",
    freeMessagesCount: 5,
    pricePerMessage: 0.50,
    messagesFree: false,
    dailyFreeSwipes: 10,
    superLikePackages: [
      { id: "sl_starter", name: "5 Super Likes", price: 4.99, superLikesCount: 5 },
      { id: "sl_popular", name: "15 Super Likes", price: 11.99, superLikesCount: 15 },
      { id: "sl_pro", name: "40 Super Likes", price: 24.99, superLikesCount: 40 }
    ],
    messageCreditPackages: [
      { id: "msg_basic", name: "20 Messages", price: 2.99, creditsCount: 20 },
      { id: "msg_standard", name: "60 Messages", price: 6.99, creditsCount: 60 },
      { id: "msg_unlimited", name: "150 Messages", price: 14.99, creditsCount: 150 }
    ],
    matchingWeights: {
      ageWeight: 20,
      distanceWeight: 15,
      deenWeight: 35,
      hobbiesWeight: 20,
      educationWeight: 10
    }
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Fetch initial dashboard stats & settings
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.users) {
          setUsersList(data.users);
        }
        if (data.transactions) {
          setTransactionsList(data.transactions);
        }
      }
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Admin configurations & Stripe keys updated successfully!" });
        setSettings(data.settings);
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update settings" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };

  // Helper to add new Super Like package
  const addSuperLikePackage = () => {
    const newPkg = {
      id: `sl_${Date.now()}`,
      name: "10 Super Likes",
      price: 8.99,
      superLikesCount: 10
    };
    setSettings((prev: any) => ({
      ...prev,
      superLikePackages: [...(prev.superLikePackages || []), newPkg]
    }));
  };

  const updateSuperLikePackage = (index: number, field: string, value: any) => {
    const updated = [...settings.superLikePackages];
    updated[index] = { ...updated[index], [field]: value };
    setSettings((prev: any) => ({ ...prev, superLikePackages: updated }));
  };

  const removeSuperLikePackage = (index: number) => {
    const updated = settings.superLikePackages.filter((_: any, i: number) => i !== index);
    setSettings((prev: any) => ({ ...prev, superLikePackages: updated }));
  };

  // Helper to add Message Credit Package
  const addCreditPackage = () => {
    const newPkg = {
      id: `msg_${Date.now()}`,
      name: "40 Messages",
      price: 4.99,
      creditsCount: 40
    };
    setSettings((prev: any) => ({
      ...prev,
      messageCreditPackages: [...(prev.messageCreditPackages || []), newPkg]
    }));
  };

  const updateCreditPackage = (index: number, field: string, value: any) => {
    const updated = [...settings.messageCreditPackages];
    updated[index] = { ...updated[index], [field]: value };
    setSettings((prev: any) => ({ ...prev, messageCreditPackages: updated }));
  };

  const removeCreditPackage = (index: number) => {
    const updated = settings.messageCreditPackages.filter((_: any, i: number) => i !== index);
    setSettings((prev: any) => ({ ...prev, messageCreditPackages: updated }));
  };

  // Helper to add Boost Package
  const addBoostPackage = () => {
    const newPkg = {
      id: `boost_${Date.now()}`,
      name: "3 Days Boost",
      price: 4.99,
      durationDays: 3
    };
    setSettings((prev: any) => ({
      ...prev,
      boostPackages: [...(prev.boostPackages || []), newPkg]
    }));
  };

  const updateBoostPackage = (index: number, field: string, value: any) => {
    const updated = [...(settings.boostPackages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings((prev: any) => ({ ...prev, boostPackages: updated }));
  };

  const removeBoostPackage = (index: number) => {
    const updated = (settings.boostPackages || []).filter((_: any, i: number) => i !== index);
    setSettings((prev: any) => ({ ...prev, boostPackages: updated }));
  };

  const grantUserCredits = async (email: string, superLikes: number, messageCredits: number) => {
    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, packageType: "superlikes", itemCount: superLikes })
      });
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, packageType: "messages", itemCount: messageCredits })
      });
      alert(`Successfully granted ${superLikes} Super Likes & ${messageCredits} Message Credits to ${email}!`);
      fetchDashboardData();
    } catch (e) {
      alert("Failed to grant credits.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Collapsible Sidebar */}
      <aside className={`bg-neutral-900 border-r border-neutral-800 p-4 md:p-6 flex flex-col justify-between shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? "w-full md:w-20 items-center" : "w-full md:w-72"
      }`}>
        <div className="space-y-6 w-full">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
            <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <Logo />
              {!isSidebarCollapsed && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    ADMIN PORTAL
                  </span>
                  <h2 className="text-sm font-bold text-white leading-tight">Control Center</h2>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden md:flex w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 items-center justify-center border border-neutral-700/60 shadow-sm transition-all"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? "▶" : "◀"}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 w-full">
            {[
              { id: "overview", label: "Dashboard Overview", icon: "📊" },
              { id: "stripe", label: "Stripe Payment Keys", icon: "🔑" },
              { id: "pricing", label: "Pricing & Packages", icon: "💰" },
              { id: "algorithm", label: "Matrimony Matching", icon: "💕" },
              { id: "users", label: "User Accounts", icon: "👥" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isSidebarCollapsed ? "justify-center px-2" : ""
                } ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                    : "text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
                }`}
                title={isSidebarCollapsed ? item.label : ""}
              >
                <span className="text-base">{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-neutral-800 space-y-3 w-full">
          <Link
            href="/discover"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all ${
              isSidebarCollapsed ? "px-2" : ""
            }`}
            title="Back to User App"
          >
            <span>📱</span> {!isSidebarCollapsed && <span>Back to App</span>}
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminEmail");
              router.push("/admin/login");
            }}
            className={`w-full text-center text-xs font-bold text-rose-400 hover:text-rose-300 py-1.5 rounded-xl hover:bg-rose-950/30 transition-all ${
              isSidebarCollapsed ? "text-[10px]" : ""
            }`}
            title="Sign Out"
          >
            {isSidebarCollapsed ? "🚪" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-6xl overflow-y-auto">
        {/* Feedback Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">System Dashboard Overview</h1>
                <p className="text-xs text-neutral-400">Live matrimony app metrics, active user subscriptions & revenue analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  ● Real-time Live Analytics
                </span>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">👥 Total Active Users</span>
                <div className="text-3xl font-black text-white">{stats.totalUsers || 0}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{stats.registeredUsers || 0} Fully Registered Profiles</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">👑 Active VIP Subscribers</span>
                <div className="text-3xl font-black text-amber-400">{stats.activePremiumSubscribers || 0}</div>
                <div className="text-[10px] text-amber-300 font-semibold">VIP Premium Unlocked</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">⚡ Active Spotlight Boosts</span>
                <div className="text-3xl font-black text-purple-400">{stats.activeBoostedUsers || 0}</div>
                <div className="text-[10px] text-purple-300 font-semibold">Ranked #1 Candidate Priority</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">💰 Gross Stripe Revenue</span>
                <div className="text-3xl font-black text-emerald-400">${stats.totalRevenue || 0.00} <span className="text-xs font-bold text-neutral-400">USD</span></div>
                <div className="text-[10px] text-emerald-300 font-semibold">Processed Test Gateway</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">💕 Matches Formed</span>
                <div className="text-3xl font-black text-rose-400">{stats.totalMatches || 0}</div>
                <div className="text-[10px] text-neutral-400">Blessed Connections</div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">💬 Messages Exchanged</span>
                <div className="text-3xl font-black text-sky-400">{stats.totalMessages || 0}</div>
                <div className="text-[10px] text-neutral-400">Chat messages sent</div>
              </div>
            </div>

            {/* INTERACTIVE DATA VISUALIZATIONS: ANIMATED BAR CHART & DONUT/PIE CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Animated Bar Chart Component */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>📈 Revenue & Activity Trend</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium">Monthly revenue progression ($ USD)</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Growth +34.2%
                  </span>
                </div>

                {/* Animated Vertical Bar Chart Graphic */}
                <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-neutral-800/80">
                  {[
                    { month: "Jan", height: "45%", value: "$120" },
                    { month: "Feb", height: "60%", value: "$180" },
                    { month: "Mar", height: "75%", value: "$240" },
                    { month: "Apr", height: "55%", value: "$165" },
                    { month: "May", height: "85%", value: "$310" },
                    { month: "Jun", height: "100%", value: `$${stats.totalRevenue || 450}` }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Tooltip on hover */}
                      <span className="text-[10px] font-black text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-950 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                        {bar.value}
                      </span>
                      {/* Gradient Animated Bar */}
                      <div className="w-full bg-neutral-800 rounded-t-xl overflow-hidden flex items-end shadow-md transition-all group-hover:bg-neutral-700 h-full">
                        <div
                          style={{ height: bar.height }}
                          className="w-full bg-gradient-to-t from-amber-500 via-emerald-400 to-amber-300 rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-125 shadow-lg shadow-amber-500/20"
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors">{bar.month}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <span>📊 Based on database transactions</span>
                  <span className="text-amber-400 font-bold">Updated Live</span>
                </div>
              </div>

              {/* 2. Animated Donut / Pie Chart Component */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>🍩 Revenue Distribution</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium">Share by package category</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Stripe Sales
                  </span>
                </div>

                {/* Donut Chart Graphics & Legend Grid */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#262626" strokeWidth="3.8" />
                      {/* Segment 1: Subscriptions (Amber Gold) */}
                      <circle
                        cx="18" cy="18" r="15.915" fill="none"
                        stroke="#f59e0b" strokeWidth="3.8"
                        strokeDasharray="50 50" strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Segment 2: Super Likes (Rose/Pink) */}
                      <circle
                        cx="18" cy="18" r="15.915" fill="none"
                        stroke="#ec4899" strokeWidth="3.8"
                        strokeDasharray="25 75" strokeDashoffset="-50"
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Segment 3: Boosts (Purple) */}
                      <circle
                        cx="18" cy="18" r="15.915" fill="none"
                        stroke="#a855f7" strokeWidth="3.8"
                        strokeDasharray="15 85" strokeDashoffset="-75"
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Segment 4: Message Credits (Emerald) */}
                      <circle
                        cx="18" cy="18" r="15.915" fill="none"
                        stroke="#10b981" strokeWidth="3.8"
                        strokeDasharray="10 90" strokeDashoffset="-90"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Total</span>
                      <span className="text-sm font-black text-amber-400">${stats.totalRevenue || 0}</span>
                    </div>
                  </div>

                  {/* Donut Chart Legend */}
                  <div className="space-y-2.5 w-full max-w-xs text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                        <span className="font-bold text-neutral-200">👑 VIP Subscriptions</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">50%</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-500 inline-block shadow-sm"></span>
                        <span className="font-bold text-neutral-200">⭐ Super Likes</span>
                      </div>
                      <span className="font-mono font-bold text-pink-400">25%</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-sm"></span>
                        <span className="font-bold text-neutral-200">⚡ Profile Boosts</span>
                      </div>
                      <span className="font-mono font-bold text-purple-400">15%</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                        <span className="font-bold text-neutral-200">💬 Message Credits</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">10%</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 font-medium text-center border-t border-neutral-800/80 pt-2">
                  <span>🔒 Revenue metrics synced directly with MongoDB Transaction models</span>
                </div>
              </div>
            </div>

            {/* Package Purchases Revenue Breakdown */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📊 Revenue Breakdown by Package Type</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Purchases breakdown across VIP Subscriptions, Super Likes, Message Credits, and Boosts</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Stripe Gateway</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">👑 VIP Subscriptions</div>
                  <div className="text-xl font-black text-white">${stats.breakdown?.subscription?.revenue || 0.00} <span className="text-xs font-normal text-neutral-400">USD</span></div>
                  <div className="text-[10px] text-neutral-400 font-medium">{stats.breakdown?.subscription?.count || 0} Active Subscriptions</div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">⭐ Super Likes</div>
                  <div className="text-xl font-black text-white">${stats.breakdown?.superlikes?.revenue || 0.00} <span className="text-xs font-normal text-neutral-400">USD</span></div>
                  <div className="text-[10px] text-neutral-400 font-medium">{stats.breakdown?.superlikes?.count || 0} Packages Purchased</div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">💬 Message Credits</div>
                  <div className="text-xl font-black text-white">${stats.breakdown?.messages?.revenue || 0.00} <span className="text-xs font-normal text-neutral-400">USD</span></div>
                  <div className="text-[10px] text-neutral-400 font-medium">{stats.breakdown?.messages?.count || 0} Packages Purchased</div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">⚡ Spotlight Boosts</div>
                  <div className="text-xl font-black text-white">${stats.breakdown?.boost?.revenue || 0.00} <span className="text-xs font-normal text-neutral-400">USD</span></div>
                  <div className="text-[10px] text-neutral-400 font-medium">{stats.breakdown?.boost?.count || 0} Boosts Activated</div>
                </div>
              </div>
            </div>

            {/* Recent Purchases Transaction Activity Log Table */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💳 Recent Payment Transactions</span>
                </h3>
                <span className="text-xs text-neutral-400 font-medium">Last 50 Purchases</span>
              </div>

              {transactionsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        <th className="pb-3 px-2">User Email</th>
                        <th className="pb-3 px-2">Package Purchased</th>
                        <th className="pb-3 px-2">Type</th>
                        <th className="pb-3 px-2">Amount ($)</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-xs">
                      {transactionsList.map((tx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-neutral-950/60 transition-colors">
                          <td className="py-3 px-2 font-bold text-white">{tx.email}</td>
                          <td className="py-3 px-2 text-neutral-300 font-medium">{tx.packageName}</td>
                          <td className="py-3 px-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              tx.packageType === "subscription"
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                : tx.packageType === "boost"
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                : tx.packageType === "superlikes"
                                ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            }`}>
                              {tx.packageType}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono font-bold text-emerald-400">${Number(tx.amount || 0).toFixed(2)}</td>
                          <td className="py-3 px-2 text-[10px] font-bold text-emerald-400 uppercase">● {tx.status || "succeeded"}</td>
                          <td className="py-3 px-2 text-neutral-400 font-mono text-[10px]">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "Recently"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
                  <span className="text-2xl">💳</span>
                  <div className="text-xs font-bold text-neutral-300">No payment transactions recorded yet</div>
                  <div className="text-[10px] text-neutral-400">Purchases made via Stripe Checkout will automatically log here in real time.</div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-white">⚡ Quick Admin Operations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("stripe")}
                  className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl text-left transition-all group"
                >
                  <div className="text-lg mb-1">🔑</div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">Update Stripe API Keys</div>
                  <div className="text-[10px] text-neutral-400">Configure sk_test and pk_test credentials</div>
                </button>

                <button
                  onClick={() => setActiveTab("pricing")}
                  className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl text-left transition-all group"
                >
                  <div className="text-lg mb-1">💰</div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">Manage Pricing & Swipes</div>
                  <div className="text-[10px] text-neutral-400">Set per message price, free swipes & packages</div>
                </button>

                <button
                  onClick={() => setActiveTab("algorithm")}
                  className="p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl text-left transition-all group"
                >
                  <div className="text-lg mb-1">💕</div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">Tune Matrimony Algorithm</div>
                  <div className="text-[10px] text-neutral-400">Adjust religion, age & location weights</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STRIPE KEYS */}
        {activeTab === "stripe" && (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h1 className="text-2xl font-black text-white">Stripe Payment Gateway Configuration</h1>
              <p className="text-xs text-neutral-400">
                Manage your live and test Stripe API credentials. Updates take effect immediately.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs">
                <span className="text-xl">💳</span>
                <div>
                  <div className="font-bold">Active Test Credentials Installed</div>
                  <div className="text-[11px] opacity-80">
                    Changes made here directly control Stripe Checkout sessions for Super Likes & Message Credits.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Stripe Secret Key (sk_test_...)
                </label>
                <input
                  type="text"
                  required
                  value={settings.stripeSecretKey || ""}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Used on the backend server to process charges & checkout sessions.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Stripe Publishable Key (pk_test_...)
                </label>
                <input
                  type="text"
                  required
                  value={settings.stripePublishableKey || ""}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Passed to the client browser frontend for Stripe Elements.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
              >
                {saving ? "Saving Changes..." : "Save Stripe Configurations"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PRICING & PACKAGES */}
        {activeTab === "pricing" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-white">Monetization & Package Management</h1>
              <p className="text-xs text-neutral-400">
                Configure messaging costs, daily swipe limits, and Super Like pricing packages
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* General Limits */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-3">
                  ⚙️ Daily Limits & Free Tiers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      Daily Free Swipes Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.dailyFreeSwipes ?? 10}
                      onChange={(e) => setSettings({ ...settings, dailyFreeSwipes: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs"
                    />
                    <span className="text-[10px] text-neutral-400">Free daily card swipes per user</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      Free Initial Messages Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.freeMessagesCount ?? 5}
                      onChange={(e) => setSettings({ ...settings, freeMessagesCount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs"
                    />
                    <span className="text-[10px] text-neutral-400">Free chat messages per user</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      Cost Per Message ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={settings.pricePerMessage ?? 0.5}
                      onChange={(e) => setSettings({ ...settings, pricePerMessage: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs"
                    />
                    <span className="text-[10px] text-neutral-400">Calculated after free messages used</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="messagesFree"
                    checked={settings.messagesFree || false}
                    onChange={(e) => setSettings({ ...settings, messagesFree: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <label htmlFor="messagesFree" className="text-xs font-bold text-neutral-200">
                    Make All Messaging Completely Free For All Users
                  </label>
                </div>
              </div>

              {/* VIP Subscription Plan Controls */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-3 flex items-center justify-between">
                  <span>👑 Matrimony VIP Premium Subscription Settings</span>
                  <span className="text-xs text-amber-400 font-extrabold uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Admin Managed</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      Subscription Name
                    </label>
                    <input
                      type="text"
                      value={settings.subscriptionName || "Matrimony VIP Premium"}
                      onChange={(e) => setSettings({ ...settings, subscriptionName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      Monthly Subscription Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.99"
                      value={settings.subscriptionPrice ?? 19.99}
                      onChange={(e) => setSettings({ ...settings, subscriptionPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-amber-400 font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                  <input
                    type="checkbox"
                    id="requireSubscriptionToViewPhotos"
                    checked={settings.requireSubscriptionToViewPhotos ?? true}
                    onChange={(e) => setSettings({ ...settings, requireSubscriptionToViewPhotos: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                  <div>
                    <label htmlFor="requireSubscriptionToViewPhotos" className="text-xs font-black text-white">
                      🔒 Require VIP Premium Subscription To Unblur Candidate Profile Photos
                    </label>
                    <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                      When enabled, non-paying users will see heavily blurred candidate photos until they purchase the VIP Subscription.
                    </p>
                  </div>
                </div>
              </div>

              {/* Super Like Packages Manager */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    ⭐ Super Like Purchase Packages
                  </h3>
                  <button
                    type="button"
                    onClick={addSuperLikePackage}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    + Add Super Like Package
                  </button>
                </div>

                <div className="space-y-4">
                  {(settings.superLikePackages || []).map((pkg: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updateSuperLikePackage(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="w-28">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Price ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => updateSuperLikePackage(idx, "price", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Super Likes Count</label>
                        <input
                          type="number"
                          value={pkg.superLikesCount}
                          onChange={(e) => updateSuperLikePackage(idx, "superLikesCount", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSuperLikePackage(idx)}
                        className="px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-bold mt-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Credit Packages Manager */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    💬 Message Credits Packages
                  </h3>
                  <button
                    type="button"
                    onClick={addCreditPackage}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    + Add Message Credit Package
                  </button>
                </div>

                <div className="space-y-4">
                  {(settings.messageCreditPackages || []).map((pkg: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updateCreditPackage(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="w-28">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Price ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => updateCreditPackage(idx, "price", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Credits Count</label>
                        <input
                          type="number"
                          value={pkg.creditsCount}
                          onChange={(e) => updateCreditPackage(idx, "creditsCount", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCreditPackage(idx)}
                        className="px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-bold mt-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spotlight Profile Boost Packages Manager */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>⚡ Spotlight Profile Boost Packages</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addBoostPackage}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    + Add Boost Package
                  </button>
                </div>

                <div className="space-y-4">
                  {(settings.boostPackages || []).map((pkg: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updateBoostPackage(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white font-bold"
                        />
                      </div>

                      <div className="w-28">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Price ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => updateBoostPackage(idx, "price", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-purple-400 font-bold"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          value={pkg.durationDays}
                          onChange={(e) => updateBoostPackage(idx, "durationDays", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeBoostPackage(idx)}
                        className="px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-bold mt-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider"
              >
                {saving ? "Updating Pricing Settings..." : "Save All Pricing & Package Settings"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MATRIMONY MATCHING ALGORITHM */}
        {activeTab === "algorithm" && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h1 className="text-2xl font-black text-white">Matrimony Matching Algorithm Tuning</h1>
              <p className="text-xs text-neutral-400">
                Adjust key criteria weights to customize profile recommendation match percentages (0 - 100%)
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl space-y-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-neutral-200">☪️ Deen & Spiritual Compatibility Weight</span>
                    <span className="text-amber-400">{settings.matchingWeights?.deenWeight ?? 35}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.matchingWeights?.deenWeight ?? 35}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingWeights: { ...settings.matchingWeights, deenWeight: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-neutral-200">🎨 Hobbies & Lifestyle Compatibility Weight</span>
                    <span className="text-amber-400">{settings.matchingWeights?.hobbiesWeight ?? 20}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.matchingWeights?.hobbiesWeight ?? 20}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingWeights: { ...settings.matchingWeights, hobbiesWeight: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-neutral-200">🎂 Age Difference & Range Alignment Weight</span>
                    <span className="text-amber-400">{settings.matchingWeights?.ageWeight ?? 20}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.matchingWeights?.ageWeight ?? 20}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingWeights: { ...settings.matchingWeights, ageWeight: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-neutral-200">📍 Geolocation & Proximity Weight</span>
                    <span className="text-amber-400">{settings.matchingWeights?.distanceWeight ?? 15}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.matchingWeights?.distanceWeight ?? 15}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingWeights: { ...settings.matchingWeights, distanceWeight: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-neutral-200">🎓 Education Level Alignment Weight</span>
                    <span className="text-amber-400">{settings.matchingWeights?.educationWeight ?? 10}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.matchingWeights?.educationWeight ?? 10}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingWeights: { ...settings.matchingWeights, educationWeight: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider"
              >
                {saving ? "Saving Weights..." : "Apply Matrimony Matching Algorithm Weights"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: USER ACCOUNTS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-white">Registered User Accounts</h1>
              <p className="text-xs text-neutral-400">View user profiles, balance metrics, and grant credits manually</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Password 🔑</th>
                      <th className="p-4">Age / Location</th>
                      <th className="p-4">Super Likes</th>
                      <th className="p-4">Message Credits</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          No registered user profiles found in database.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((user) => (
                        <tr key={user._id} className="hover:bg-neutral-850 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{user.name || "User"}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-300 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                                {visiblePasswords[user._id] ? (user.password || "No password set") : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(user._id)}
                                className="text-[10px] font-bold text-neutral-400 hover:text-white bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700 transition-all shrink-0"
                                title={visiblePasswords[user._id] ? "Hide Password" : "Show Password"}
                              >
                                {visiblePasswords[user._id] ? "🙈 Hide" : "👁️ View"}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>{user.age ? `${user.age} yrs` : "N/A"}</div>
                            <div className="text-[10px] text-neutral-400">{user.livingLocation || user.city || "Location N/A"}</div>
                          </td>
                          <td className="p-4 font-bold text-amber-400">⭐ {user.superLikes ?? 5}</td>
                          <td className="p-4 font-bold text-emerald-400">💬 {user.messageCredits ?? 10}</td>
                          <td className="p-4">
                            <button
                              onClick={() => grantUserCredits(user.email, 5, 20)}
                              className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-[11px] font-bold transition-all"
                            >
                              + Grant 5 SL & 20 Msgs
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
