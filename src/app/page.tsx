import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#171717] font-sans antialiased flex flex-col justify-between">
      {/* MOBILE VIEW (lg:hidden) - Exact replica of the uploaded mockup */}
      <div className="block lg:hidden flex-1 px-5 py-6 max-w-md mx-auto w-full flex flex-col justify-between gap-8">
        {/* Header */}
        <header className="flex justify-center items-center py-2">
          <Logo iconSize={26} textSize="text-2xl" />
        </header>

        {/* Hero Image Card */}
        <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-md">
          <Image
            src="/couple.png"
            alt="Happy Muslim Couple"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          {/* Glassmorphic Badge */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-white/30">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-pink text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-neutral-800">Verified Connections</h4>
              <p className="text-[11px] text-neutral-600 font-medium">Faith-based matrimonial security</p>
            </div>
          </div>
        </div>

        {/* Call to Actions Section */}
        <div className="flex flex-col text-center gap-4">
          <h1 className="text-[32px] leading-[1.15] font-extrabold text-[#c21a5c] tracking-tight">
            Find Your Perfect<br />Halal Match
          </h1>
          <p className="text-[13.5px] leading-relaxed text-neutral-500 font-normal px-2">
            Connect with practicing Muslims looking for meaningful marriage. A sanctuary built for those who value faith, character, and lifelong commitment.
          </p>
        </div>

        {/* Buttons and Social Login */}
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full text-center bg-brand-pink hover:bg-brand-pink-hover text-white py-3.5 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-[0.99]"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="w-full text-center border border-brand-pink bg-[#FDF2F8] hover:bg-[#FCE7F3] text-brand-pink py-3.5 rounded-full font-semibold text-sm transition-all active:scale-[0.99]"
          >
            Login
          </Link>


        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 py-4 text-center border-t border-b border-neutral-100/80 my-2">
          <div>
            <div className="text-3xl font-extrabold text-brand-pink leading-none">50k+</div>
            <div className="text-[10px] font-bold text-neutral-500 tracking-wider mt-1.5">SUCCESS STORIES</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-teal leading-none">100%</div>
            <div className="text-[10px] font-bold text-neutral-500 tracking-wider mt-1.5">HALAL FOCUSED</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-pink leading-none">24/7</div>
            <div className="text-[10px] font-bold text-neutral-500 tracking-wider mt-1.5">MODERATION</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-teal leading-none">Global</div>
            <div className="text-[10px] font-bold text-neutral-500 tracking-wider mt-1.5">COMMUNITY</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pb-4 flex flex-col gap-4">
          <div className="flex justify-center gap-6 text-xs font-semibold text-neutral-500">
            <Link href="/privacy" className="hover:text-brand-pink transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-pink transition-colors">Terms of Service</Link>
            <Link href="/help" className="hover:text-brand-pink transition-colors">Help Center</Link>
          </div>
          <p className="text-[11px] text-neutral-400 font-medium">
            © 2026 LoveLink. All rights reserved.
          </p>
        </footer>
      </div>

      {/* DESKTOP/WEB VIEW (lg:flex) - Premium adapted Split Screen */}
      <div className="hidden lg:flex flex-row flex-1 min-h-screen">
        {/* Left Side: Captivating visual container */}
        <div className="w-1/2 relative bg-neutral-900 overflow-hidden flex flex-col justify-between p-12">
          {/* Background overlay design */}
          <div className="absolute inset-0 opacity-40 bg-radial-gradient from-brand-pink/30 to-transparent"></div>
          <Image
            src="/couple.png"
            alt="Muslim Couple Finding Love"
            fill
            priority
            className="object-cover opacity-85 object-center mix-blend-overlay"
          />

          {/* Top Logo */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white font-semibold text-sm">
              ✨ Faith-Based Matrimony
            </span>
          </div>

          {/* Mid Quote Card */}
          <div className="relative z-10 max-w-md bg-black/40 backdrop-blur-lg border border-white/15 rounded-3xl p-8 text-white shadow-2xl">
            <p className="text-xl font-medium italic leading-relaxed text-pink-50">
              "We created you in pairs."
            </p>
            <p className="text-xs text-neutral-300 mt-2 font-mono uppercase tracking-widest">— Surah An-Naba, 78:8</p>
            
            <div className="mt-6 flex items-center gap-4 bg-white/10 rounded-2xl p-4 border border-white/5">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-pink text-white">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-sm">100% Identity Verified</h4>
                <p className="text-xs text-neutral-300">Selfie verification required for all profiles</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 text-xs text-white/50">
            © 2026 LoveLink. All rights reserved.
          </div>
        </div>

        {/* Right Side: Control Center (Forms/Buttons) */}
        <div className="w-1/2 bg-[#FCFBF9] flex flex-col justify-between p-16 max-h-screen overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center">
            <Logo iconSize={32} textSize="text-3xl" />
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-neutral-600 hover:text-brand-pink transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-white bg-brand-pink hover:bg-brand-pink-hover px-5 py-2.5 rounded-full transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          </header>

          {/* Hero Content */}
          <div className="my-auto max-w-md w-full mx-auto flex flex-col gap-8 py-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl font-extrabold text-[#c21a5c] tracking-tight leading-[1.1]">
                Find Your Perfect<br />Halal Match
              </h1>
              <p className="text-neutral-500 text-base leading-relaxed">
                Connect with practicing Muslims looking for a meaningful marriage. A safe sanctuary built for those who value faith, character, and lifelong commitment.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/signup"
                  className="w-full text-center bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="w-full text-center border border-brand-pink bg-[#FDF2F8] hover:bg-[#FCE7F3] text-brand-pink py-4 rounded-full font-semibold text-sm transition-all active:scale-[0.99]"
                >
                  Sign In
                </Link>
              </div>


            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 pt-8 border-t border-neutral-100">
              <div>
                <div className="text-3xl font-extrabold text-brand-pink leading-none">50k+</div>
                <div className="text-[9px] font-bold text-neutral-500 tracking-wider mt-2">SUCCESS STORIES</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-brand-teal leading-none">100%</div>
                <div className="text-[9px] font-bold text-neutral-500 tracking-wider mt-2">HALAL FOCUSED</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-brand-pink leading-none">24/7</div>
                <div className="text-[9px] font-bold text-neutral-500 tracking-wider mt-2">MODERATION</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-brand-teal leading-none">Global</div>
                <div className="text-[9px] font-bold text-neutral-500 tracking-wider mt-2">COMMUNITY</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex justify-between items-center text-xs font-medium text-neutral-500 pt-8 border-t border-neutral-100">
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-brand-pink transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-pink transition-colors">Terms of Service</Link>
              <Link href="/help" className="hover:text-brand-pink transition-colors">Help Center</Link>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              © 2026 LoveLink. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
