"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import SocialButton from "@/components/SocialButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtpView, setShowOtpView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setShowOtpView(true);
      setTimer(59);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      setErrorMsg("Please enter the complete 4-digit OTP");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP");
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

      {/* Main card */}
      <main className="flex-grow flex items-center justify-center py-6">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-100/50 w-full max-w-md p-8 md:p-10">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#c21a5c] tracking-tight">
              {showOtpView ? "Enter OTP" : "Welcome Back"}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              {showOtpView
                ? `Enter the 4-digit code sent to ${email}`
                : "Enter your registered email to log in via OTP"}
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

          {!showOtpView ? (
            /* Email Form */
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyLogin} className="flex flex-col gap-6">
              <div className="flex justify-between gap-3 px-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    maxLength={1}
                    required
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-14 h-14 text-center rounded-2xl border border-neutral-200 bg-white text-lg font-black text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="text-center text-xs font-semibold text-neutral-400">
                  {timer > 0 ? (
                    <span>Resend OTP in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-brand-pink hover:underline font-bold"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-6 select-none">
            <div className="flex-grow border-t border-neutral-100"></div>
            <span className="px-4 text-[10px] font-bold text-neutral-400 tracking-wider">OR SIGN IN WITH</span>
            <div className="flex-grow border-t border-neutral-100"></div>
          </div>

          <div className="flex flex-col gap-2.5">
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-neutral-400 mt-8">
        © 2026 LoveLink. All rights reserved.
      </footer>
    </div>
  );
}
