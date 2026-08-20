"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

// List of regions
const REGIONS = [
  "Global (All Regions)",
  "North America",
  "United Kingdom",
  "Europe",
  "Middle East",
  "South Asia",
  "Southeast Asia",
  "Africa",
  "Australia & NZ",
];

// Interests
const INTERESTS = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "halalfood", label: "Halal Food", icon: "🌱" },
  { id: "charity", label: "Charity", icon: "🤲" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "history", label: "History", icon: "🏛️" },
  { id: "outdoors", label: "Outdoors", icon: "🌲" },
];

// Deen attributes
const DEEN_ATTRIBUTES = [
  "Prays 5x Daily",
  "Halal Diet",
  "Revert",
  "Sect: Sunni",
  "Sect: Shia",
  "Hijab / Beard",
  "Quran Student",
];

export default function SignUpWizard() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("Global (All Regions)");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(57);
  const [name, setName] = useState("");
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("Female");
  const [lookingFor, setLookingFor] = useState("Man");
  const [livingLocation, setLivingLocation] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["cooking", "charity", "history"]);
  const [selectedDeen, setSelectedDeen] = useState<string[]>(["Prays 5x Daily", "Halal Diet", "Sect: Sunni"]);

  // API State
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // S3 File input references
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle OTP inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next box
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const resendOtp = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }
      setTimer(57);
      alert("Verification code resent to: " + email);
    } catch (err: any) {
      setErrorMsg(err.message);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    if (uploadedPhotos[index]) {
      const newPhotos = [...uploadedPhotos];
      newPhotos[index] = null;
      setUploadedPhotos(newPhotos);
    } else {
      fileInputRefs[index].current?.click();
    }
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Temporarily mark as uploading
      const tempPhotos = [...uploadedPhotos];
      tempPhotos[index] = "uploading";
      setUploadedPhotos(tempPhotos);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      const newPhotos = [...uploadedPhotos];
      newPhotos[index] = data.url;
      setUploadedPhotos(newPhotos);
    } catch (err: any) {
      alert("Photo upload error: " + err.message);
      const newPhotos = [...uploadedPhotos];
      newPhotos[index] = null;
      setUploadedPhotos(newPhotos);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleDeen = (attr: string) => {
    setSelectedDeen((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  // Step 1: Account setup with Email & Password
  const handleAccountSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }
    if (!password) {
      setErrorMsg("Please set a password for your account");
      return;
    }
    setErrorMsg("");
    setStep(3); // Proceed to Step 3 (Basic Info) directly
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      alert("Please enter the 4-digit code");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP code");
      }
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Please enter your name");
      return;
    }
    setStep(4);
  };

  const handlePhotoSubmit = () => {
    if (!uploadedPhotos[0] || uploadedPhotos[0] === "uploading") {
      alert("Main Cover Photo is required and must finish uploading");
      return;
    }
    setStep(5);
  };

  const handleInterestsSubmit = () => {
    setStep(6);
  };

  const handleLocationSubmit = async (allowed: boolean) => {
    setIsSubmitting(true);
    setErrorMsg("");
    let coordinates: { latitude: number; longitude: number } | null = null;
    let detectedCity = "";
    let detectedCountry = "";
    
    try {
      if (allowed) {
        console.log("Requesting geolocation coordinates...");
        try {
          coordinates = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
            if (typeof window === "undefined" || !navigator.geolocation) {
              reject(new Error("Geolocation is not supported by this browser."));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                reject(error);
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
          });
          console.log("Successfully retrieved coordinates:", coordinates);

          // Reverse geocoding using free OpenStreetMap Nominatim API
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10`,
              {
                headers: {
                  "User-Agent": "LoveLink/1.0 (contact@lovelink.com)"
                }
              }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              console.log("Geocoding API response:", geoData);
              if (geoData && geoData.address) {
                detectedCity = geoData.address.city || 
                               geoData.address.town || 
                               geoData.address.suburb || 
                               geoData.address.county || 
                               geoData.address.state || 
                               "";
                detectedCountry = geoData.address.country || "";
              }
            }
          } catch (geocodeErr) {
            console.error("Failed to reverse geocode:", geocodeErr);
          }
        } catch (geoError: any) {
          console.warn("Geolocation permission or retrieval failed:", geoError);
          alert("Could not retrieve precise location. Proceeding with selected region.");
        }
      }

      const interestLabels = selectedInterests.map((id) => {
        const item = INTERESTS.find((i) => i.id === id);
        return item ? item.label : id;
      });

      const cityVal = detectedCity || (region.includes("Global") ? "Dubai" : region);
      const countryVal = detectedCountry || "UAE";

      const profilePayload = {
        email,
        password,
        name,
        age: Number(age) || 24,
        gender,
        targetGender: lookingFor === "Man" ? "Male" : "Female",
        hobbies: interestLabels,
        deenAttributes: selectedDeen,
        city: cityVal,
        country: countryVal,
        images: uploadedPhotos.filter((p) => p && p !== "uploading") as string[],
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        livingLocation,
        workLocation,
        education,
        profession,
        bio,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register profile");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
      }
      setStep(7);
    } catch (err: any) {
      console.error("Save profile error:", err);
      alert("Error saving profile details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete onboarding
  const handleComplete = () => {
    window.location.href = "/discover";
  };

  // Render Step Progress
  const renderProgressBar = (currentStep: number, totalSteps: number = 6) => {
    const percentage = (currentStep / totalSteps) * 100;
    return (
      <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden mt-4">
        <div
          className="h-full bg-brand-pink transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen text-[#171717] font-sans antialiased flex flex-col justify-between"
      style={{
        backgroundColor: "#FCFBF9",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 10 L32 26 L48 28 L32 30 L30 46 L28 30 L12 28 L28 26 Z' fill='%23fce7f3' fill-opacity='0.35'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }}
    >
      {/* DESKTOP SPLIT CONTAINER (lg:flex) */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-6xl w-full mx-auto p-4 lg:p-12 gap-8 items-stretch justify-center my-auto">
        
        {/* Left Info Panel - Visible on Desktop only */}
        {step < 7 && (
          <div className="hidden lg:flex w-5/12 bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 p-8 shadow-xl flex-col justify-between">
            <div className="flex flex-col gap-6">
              <Logo iconSize={30} textSize="text-2xl" />
              
              <div className="mt-8 flex flex-col gap-8">
                <div className={`transition-all duration-300 ${step === 1 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 1: Security</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Verify Your Email</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    We use secure email verification to keep our platform clean, trustworthy, and free from automated spam.
                  </p>
                </div>

                <div className={`transition-all duration-300 ${step === 2 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 2: Verification</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Enter Code</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Check your inbox for a 4-digit authentication code and enter it to confirm your identity.
                  </p>
                </div>

                <div className={`transition-all duration-300 ${step === 3 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 3: Identity</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Basic Information</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Provide your name, age, and match preferences. This helps us customize matching algorithm triggers.
                  </p>
                </div>

                <div className={`transition-all duration-300 ${step === 4 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 4: Presentation</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Modest Photos</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Upload modest, clear profile pictures. Photos undergo strict human verification to ensure a safe environment.
                  </p>
                </div>

                <div className={`transition-all duration-300 ${step === 5 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 5: Attributes</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Values & Interests</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Select your interests and Deen-focused attributes to find compatibility based on daily lifestyle and faith.
                  </p>
                </div>

                <div className={`transition-all duration-300 ${step === 6 ? "opacity-100 translate-x-0" : "opacity-40 scale-95"}`}>
                  <span className="text-xs font-bold text-brand-pink tracking-widest uppercase">Step 6: Location</span>
                  <h3 className="text-xl font-bold text-neutral-800 mt-1">Matches Near You</h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    Enable location access to discover practicing Muslims within your local community and nearby Halal events.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-6">
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                🔒 Securely encrypted and Halal-certified matrimonial application.
              </p>
            </div>
          </div>
        )}

        {/* Right Active Form Area */}
        <div className={`w-full ${step === 7 ? "max-w-xl mx-auto" : "lg:w-7/12 max-w-md"} bg-white rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-100/40 p-6 md:p-8 flex flex-col justify-between min-h-[640px] transition-all duration-500`}>
          
          {/* STEP 1: EMAIL & REGION */}
          {step === 1 && (
            <div className="flex flex-col flex-grow justify-between gap-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-pink">
                  <path d="M12 7c-1.5-2-4.5-2-6 0s-1.5 4 0 6l6 6 6-6c1.5-2 1.5-4 0-6s-4.5-2-6 0Z" fill="currentColor" />
                </svg>
                <div className="w-10"></div>
              </div>

              <div className="flex flex-col items-center mt-2">
                <div className="w-20 h-20 rounded-3xl bg-[#FFF5F8] border border-pink-100 flex items-center justify-center shadow-sm">
                  <span className="text-3xl text-brand-pink font-semibold">@</span>
                </div>
                <h1 className="text-[28px] font-extrabold text-neutral-800 tracking-tight mt-6">Email</h1>
                <p className="text-xs text-neutral-500 font-medium text-center mt-1 max-w-[280px]">
                  Verify your email to start your journey towards a blessed union.
                </p>
              </div>

              <form onSubmit={handleAccountSetup} className="flex flex-col gap-5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Password 🔑
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Preferred Region
                  </label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-12 py-4 rounded-2xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-semibold text-neutral-700 appearance-none cursor-pointer"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                      </svg>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-bold select-none leading-normal">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4 uppercase tracking-wider"
                >
                  Continue
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] text-pink-300">✨</span>
                  <span className="text-xs text-pink-300">❤️</span>
                  <span className="text-[10px] text-pink-300">✨</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-semibold max-w-[280px] text-center leading-normal">
                  <svg className="h-4 w-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Securely encrypted and Halal-certified matchmaking environment</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <div className="flex flex-col flex-grow justify-between gap-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10"></div>
              </div>

              <div className="flex flex-col items-center mt-2">
                <div className="w-20 h-20 rounded-3xl bg-[#FFF5F8] border border-pink-100 flex items-center justify-center shadow-sm">
                  <svg className="h-10 w-10 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-[28px] font-extrabold text-neutral-800 tracking-tight mt-6">Verify Your Email</h1>
                <p className="text-xs text-neutral-500 font-medium text-center mt-2 px-6">
                  Enter the 4-digit code sent to your email address: <strong className="text-neutral-700 font-semibold">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 mt-4">
                <div className="flex justify-center gap-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-16 h-16 text-center text-2xl font-bold bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:bg-white transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {timer > 0 ? (
                    <span>Resend code in 00:{timer < 10 ? `0${timer}` : timer}</span>
                  ) : (
                    <button type="button" onClick={resendOtp} className="text-brand-pink hover:underline">
                      Resend code now
                    </button>
                  )}
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-bold text-center select-none leading-normal">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              <div className="text-center pb-4">
                <span className="text-xs font-semibold text-neutral-400">Didn't receive the code? </span>
                <button type="button" onClick={resendOtp} className="text-xs font-bold text-brand-pink hover:underline">
                  Resend
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BASIC INFO */}
          {step === 3 && (
            <div className="flex flex-col flex-grow justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(2)} className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                    <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Step 3 of 6</span>
                  <Link href="/" className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                </div>
                {renderProgressBar(3)}
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-neutral-800 tracking-tight">Basic Info</h1>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Tell us a bit about yourself to help us find your perfect match.
                </p>
              </div>

              <form onSubmit={handleBasicInfoSubmit} className="flex flex-col gap-5 flex-grow mt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Legal Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Asma"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <select
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-bold text-neutral-700 appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 83 }, (_, i) => i + 18).map((num) => (
                        <option key={num} value={num.toString()}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-neutral-100/70 rounded-2xl p-1 border border-neutral-200/50">
                    <button
                      type="button"
                      onClick={() => setGender("Male")}
                      className={`py-3 rounded-xl font-bold text-xs transition-all ${
                        gender === "Male"
                          ? "bg-white text-brand-pink shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("Female")}
                      className={`py-3 rounded-xl font-bold text-xs transition-all ${
                        gender === "Female"
                          ? "bg-white text-brand-pink shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Looking for a
                  </label>
                  <div className="grid grid-cols-2 gap-3 bg-neutral-100/70 rounded-2xl p-1 border border-neutral-200/50">
                    <button
                      type="button"
                      onClick={() => setLookingFor("Man")}
                      className={`py-3 rounded-xl font-bold text-xs transition-all ${
                        lookingFor === "Man"
                          ? "bg-white text-brand-pink shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Man
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookingFor("Woman")}
                      className={`py-3 rounded-xl font-bold text-xs transition-all ${
                        lookingFor === "Woman"
                          ? "bg-white text-brand-pink shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Woman
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 flex flex-col gap-5">
                  <h3 className="text-xs font-black text-brand-pink uppercase tracking-widest mb-1">Education & Career</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Education
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. Masters in Design"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Profession / Job Title
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. UI/UX Designer"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      About Me (Bio)
                    </label>
                    <textarea
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief description of yourself, your values, and what you are looking for..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 flex flex-col gap-5">
                  <h3 className="text-xs font-black text-brand-pink uppercase tracking-widest mb-1">Locations</h3>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Living Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={livingLocation}
                        onChange={(e) => setLivingLocation(e.target.value)}
                        placeholder="e.g. Dubai Marina, Dubai"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <circle cx="12" cy="11" r="3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Work Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={workLocation}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        placeholder="e.g. Downtown Dubai, Dubai"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all text-sm font-medium"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg mt-4"
                >
                  Continue
                </button>
              </form>

              <div className="text-center text-xs font-semibold text-neutral-400 py-2">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-neutral-500 hover:text-brand-pink underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          )}

          {/* STEP 4: PHOTO UPLOAD */}
          {step === 4 && (
            <div className="flex flex-col flex-grow justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(3)} className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                    <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Logo iconSize={22} textSize="text-xl" />
                  <div className="w-10"></div>
                </div>
                {renderProgressBar(4)}
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                  <span>Step 4 of 6</span>
                  <span>Upload Photos</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-neutral-800 tracking-tight leading-snug">Add Your Photos</h1>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Show your personality while maintaining modesty. Your first photo will be your profile cover.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 my-2">
                <input type="file" ref={fileInputRefs[0]} onChange={(e) => handleFileChange(0, e)} className="hidden" accept="image/*" />
                <div className="col-span-2 aspect-[4/5] rounded-3xl relative overflow-hidden bg-neutral-50 border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-pink-400 transition-all hover:bg-pink-50/10" onClick={() => handlePhotoClick(0)}>
                  {uploadedPhotos[0] ? (
                    uploadedPhotos[0] === "uploading" ? (
                      <div className="flex flex-col items-center gap-2 select-none animate-pulse">
                        <span className="text-[11px] font-bold text-neutral-400">Uploading S3...</span>
                      </div>
                    ) : (
                      <Image src={uploadedPhotos[0]} fill alt="Cover Preview" className="object-cover" />
                    )
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-pink-100/40 text-brand-pink flex items-center justify-center group-hover:scale-105 transition-all">
                        <span className="text-2xl font-bold">+</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-pink mt-1">Main Cover Photo</span>
                    </>
                  )}
                  <span className="absolute top-3 left-3 bg-[#be185d] text-[8px] font-extrabold text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Required
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <input type="file" ref={fileInputRefs[1]} onChange={(e) => handleFileChange(1, e)} className="hidden" accept="image/*" />
                  <div className="aspect-square rounded-2xl relative overflow-hidden bg-neutral-50 border border-dashed border-pink-200 flex items-center justify-center group cursor-pointer hover:border-pink-400 transition-all hover:bg-pink-50/10" onClick={() => handlePhotoClick(1)}>
                    {uploadedPhotos[1] ? (
                      uploadedPhotos[1] === "uploading" ? (
                        <span className="text-[10px] font-bold text-neutral-400 animate-pulse">Wait...</span>
                      ) : (
                        <Image src={uploadedPhotos[1]} fill alt="Photo 1" className="object-cover" />
                      )
                    ) : (
                      <span className="text-xl font-bold text-brand-pink group-hover:scale-110 transition-all">+</span>
                    )}
                  </div>

                  <input type="file" ref={fileInputRefs[2]} onChange={(e) => handleFileChange(2, e)} className="hidden" accept="image/*" />
                  <div className="aspect-square rounded-2xl relative overflow-hidden bg-neutral-50 border border-dashed border-pink-200 flex items-center justify-center group cursor-pointer hover:border-pink-400 transition-all hover:bg-pink-50/10" onClick={() => handlePhotoClick(2)}>
                    {uploadedPhotos[2] ? (
                      uploadedPhotos[2] === "uploading" ? (
                        <span className="text-[10px] font-bold text-neutral-400 animate-pulse">Wait...</span>
                      ) : (
                        <Image src={uploadedPhotos[2]} fill alt="Photo 2" className="object-cover" />
                      )
                    ) : (
                      <span className="text-xl font-bold text-brand-pink group-hover:scale-110 transition-all">+</span>
                    )}
                  </div>

                  <input type="file" ref={fileInputRefs[3]} onChange={(e) => handleFileChange(3, e)} className="hidden" accept="image/*" />
                  <div className="aspect-square rounded-2xl relative overflow-hidden bg-neutral-50 border border-dashed border-pink-200 flex items-center justify-center group cursor-pointer hover:border-pink-400 transition-all hover:bg-pink-50/10" onClick={() => handlePhotoClick(3)}>
                    {uploadedPhotos[3] ? (
                      uploadedPhotos[3] === "uploading" ? (
                        <span className="text-[10px] font-bold text-neutral-400 animate-pulse">Wait...</span>
                      ) : (
                        <Image src={uploadedPhotos[3]} fill alt="Photo 3" className="object-cover" />
                      )
                    ) : (
                      <span className="text-xl font-bold text-brand-pink group-hover:scale-110 transition-all">+</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-3xl p-4 flex flex-col gap-2.5">
                <h4 className="font-bold text-xs text-brand-teal flex items-center gap-2">
                  <svg className="h-4.5 w-4.5 text-brand-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Upload Tips
                </h4>
                <ul className="flex flex-col gap-2">
                  <li className="text-[11px] text-[#166534] font-medium flex gap-2 items-start">
                    <span className="text-brand-teal text-xs">✓</span>
                    Use clear, natural lighting for the best representation.
                  </li>
                  <li className="text-[11px] text-[#166534] font-medium flex gap-2 items-start">
                    <span className="text-brand-teal text-xs">✓</span>
                    Avoid group photos—make sure you are the focus.
                  </li>
                  <li className="text-[11px] text-[#166534] font-medium flex gap-2 items-start">
                    <span className="text-brand-teal text-xs">✓</span>
                    Keep it modest: dress respectfully as per your values.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <button
                  type="button"
                  onClick={handlePhotoSubmit}
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Continue
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-[10px] font-semibold text-neutral-400 text-center">
                  You can always edit these later in your profile settings.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: INTERESTS & DEEN ATTRIBUTES */}
          {step === 5 && (
            <div className="flex flex-col flex-grow justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(4)} className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                    <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Logo iconSize={22} textSize="text-xl" />
                  <div className="w-8 h-8 rounded-full border border-neutral-200 overflow-hidden relative shadow-sm">
                    <Image src="/couple.png" fill alt="User avatar" className="object-cover" />
                  </div>
                </div>
                {renderProgressBar(5)}
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                  <span>Step 5 of 6</span>
                  <span>Profile setup</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-neutral-800 tracking-tight">Choose your interests</h1>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Help us find your perfect match by sharing what moves you. We prioritize compatibility based on shared values and lifestyle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 my-1">
                {INTERESTS.map((item) => {
                  const isSelected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-xs font-bold ${
                        isSelected
                          ? "bg-[#be185d] border-[#be185d] text-white shadow-sm"
                          : "bg-white border-neutral-200/80 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                  <svg className="h-4.5 w-4.5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Deen Attributes
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {DEEN_ATTRIBUTES.map((attr) => {
                    const isSelected = selectedDeen.includes(attr);
                    return (
                      <button
                        key={attr}
                        type="button"
                        onClick={() => toggleDeen(attr)}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-[#fce7f3] border-brand-pink text-brand-pink shadow-sm"
                            : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                        }`}
                      >
                        {attr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleInterestsSubmit}
                className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                Continue
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* STEP 6: LOCATION PERMISSION */}
          {step === 6 && (
            <div className="flex flex-col flex-grow justify-between gap-5">
              {/* Header with back */}
              <div className="flex items-center">
                <button onClick={() => setStep(5)} className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center hover:bg-neutral-100 transition-colors">
                  <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Custom Map graphic mock */}
              <div className="w-full bg-[#1A1A1E] rounded-3xl p-6 flex justify-center items-center relative overflow-hidden shadow-inner">
                {/* Simulated Phone display */}
                <div className="w-48 bg-white rounded-3xl p-3 border-4 border-neutral-700 flex flex-col justify-between items-center text-center relative z-10 shadow-xl min-h-[220px]">
                  {/* Mosque Pin Graphic */}
                  <div className="relative w-full flex-grow flex items-center justify-center">
                    {/* Tiny Map drawing */}
                    <svg viewBox="0 0 100 60" className="w-full opacity-65 text-neutral-200 absolute">
                      <path d="M 10,10 Q 30,50 60,10 T 90,50" fill="none" stroke="#FCE7F3" strokeWidth="3" />
                      <path d="M 5,30 Q 50,0 80,45" fill="none" stroke="#FEF08A" strokeWidth="3" />
                    </svg>
                    
                    {/* Golden/pink location pin with Mosque */}
                    <div className="relative animate-bounce">
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" className="text-amber-500 drop-shadow-md">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
                        <path d="M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#FFF" />
                      </svg>
                      {/* Little minaret crescent */}
                      <span className="absolute top-1 left-[19px] text-[8px] text-white">🌙</span>
                    </div>
                  </div>

                  {/* Mock dialog content */}
                  <div className="flex flex-col gap-2 mt-2 w-full">
                    <h5 className="font-bold text-[10px] text-neutral-700 leading-tight">Allow location access</h5>
                    <p className="text-[7.5px] text-neutral-400 font-medium px-2 leading-normal">For a better experience</p>
                    <div className="flex gap-1.5 justify-center w-full mt-1.5">
                      <span className="text-[7.5px] font-bold border border-amber-500 text-amber-500 px-2 py-0.5 rounded-full bg-white scale-90">Yes, allow</span>
                      <span className="text-[7.5px] font-bold bg-brand-pink text-white px-2 py-0.5 rounded-full scale-90">No, thanks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center px-2">
                <h1 className="text-[25px] font-extrabold text-neutral-800 tracking-tight leading-tight">Find Matches Near You</h1>
                <p className="text-xs text-neutral-500 font-medium mt-3 leading-relaxed">
                  Connecting with someone who shares your values starts with seeing who's in your community.
                </p>
              </div>

              {/* Info grid cards */}
              <div className="grid grid-cols-2 gap-3.5 my-1">
                <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F8] border border-pink-100 text-brand-pink flex items-center justify-center shadow-sm">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700">Nearby Matches</span>
                </div>

                <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#dcfce7] text-brand-teal flex items-center justify-center shadow-sm">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-700">Local Halal Events</span>
                </div>
              </div>

              {/* Verification & Button */}
              <div className="flex flex-col gap-3.5 items-center">
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-semibold text-center leading-normal">
                  <svg className="h-4.5 w-4.5 text-brand-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Your precise location is never shared with others.</span>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleLocationSubmit(true)}
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Enable Location"}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleLocationSubmit(false)}
                  className="text-xs font-bold text-neutral-500 hover:text-brand-pink transition-colors py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Not Now
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: REGISTRATION SUCCESS */}
          {step === 7 && (
            <div className="flex flex-col flex-grow items-center justify-between text-center py-6 gap-8">
              <div></div>
              
              <div className="flex flex-col items-center">
                {/* Success Ring animation wrapper */}
                <div className="w-24 h-24 rounded-full bg-[#F0FDF4] border-2 border-emerald-100 flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="h-12 w-12 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-[#c21a5c] tracking-tight mt-8">
                  Assalamu Alaikum, {name}!
                </h1>
                <p className="text-sm text-neutral-500 font-medium mt-3 max-w-sm leading-relaxed">
                  Your profile has been created successfully. Welcome to a sanctuary built for faith, character, and blessed unions.
                </p>

                {/* Simulated checks */}
                <div className="bg-neutral-50 rounded-2xl p-4 mt-6 border border-neutral-100 w-full max-w-xs flex flex-col gap-2 text-left">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-600 font-semibold">
                    <span className="text-brand-teal font-bold">✓</span> Email verified ({email})
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-600 font-semibold">
                    <span className="text-brand-teal font-bold">✓</span> Onboarding completed
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-600 font-semibold">
                    <span className="text-brand-teal font-bold">✓</span> Security checks passed
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 max-w-sm"
              >
                Enter LoveLink
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
