import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({ className = "", iconSize = 28, textSize = "text-3xl" }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold text-brand-pink transition-opacity hover:opacity-90 ${className}`}>
      {/* Stylized flower/heart icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-pink"
      >
        <path d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 7c-1.5-2-4.5-2-6 0s-1.5 4 0 6l6 6 6-6c1.5-2 1.5-4 0-6s-4.5-2-6 0Z" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" className="text-white fill-white" />
      </svg>
      <span className={`font-bold tracking-tight text-[#c21a5c] font-sans ${textSize}`}>
        LoveLink
      </span>
    </Link>
  );
}
