"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token & email
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
      }

      // Redirect to discover page
      window.location.href = "/discover";
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-[#171717] font-sans antialiased flex flex-col justify-between p-6"
      style={{
        backgroundColor: "#FCFBF9",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 10 L32 26 L48 28 L32 30 L30 46 L28 30 L12 28 L28 26 Z' fill='%23fce7f3' fill-opacity='0.35'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto mb-8">
        <Logo iconSize={26} textSize="text-2xl" />
        <Link
          href="/signup"
          className="text-sm font-semibold text-brand-pink hover:underline"
        >
          Sign Up
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-grow flex items-center justify-center py-6">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-100/50 w-full max-w-md p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#c21a5c] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              Enter your email and password to log in to your account
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 shadow-sm select-none">
              <span className="text-rose-500 text-sm mt-0.5">⚠️</span>
              <p className="text-[11px] font-bold text-rose-700 leading-normal">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium text-neutral-800"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Password 🔑
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium text-neutral-800"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-brand-pink"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400 font-medium">
            Don't have an account yet?{" "}
            <Link href="/signup" className="text-brand-pink font-bold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-neutral-400 font-medium py-4">
        © {new Date().getFullYear()} LoveLink Matrimony. All rights reserved.
      </footer>
    </div>
  );
}
