"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { io } from "socket.io-client";

// Mock profiles data for swiping
const PROFILES = [
  {
    id: 1,
    name: "Ayesha",
    age: 24,
    city: "Kolkata",
    country: "India",
    occupation: "Software Engineer",
    image: "/ayesha.png",
    attributes: ["PRACTICING MUSLIM", "Prays 5 Times", "Reads Quran", "Family Oriented"],
    bio: "Looking for someone who balances Deen and Dunya. Family values are very important to me.",
    likesCount: "1.2k",
    superLikesCount: "150",
    education: "Masters in CS",
    detailedBio: "Assalamu Alaikum! I'm Ayesha. I believe in finding a balance between modern professional life and traditional values. I love traveling, exploring new cafes, and deep intellectual conversations. I am hoping to meet a practicing partner who values kindness, education, and intentionality as much as I do.",
    interests: [
      { label: "Coffee", image: "/coffee_quran.png" },
      { label: "Hiking", image: "/hiking.png" },
      { label: "Coding", image: "/coding.png" }
    ]
  },
  {
    id: 2,
    name: "Farhana",
    age: 23,
    city: "Mumbai",
    country: "India",
    occupation: "UI/UX Designer",
    image: "/farhana.png",
    attributes: ["PRACTICING MUSLIM", "Halal Diet", "Sect: Sunni", "Hijab"],
    bio: "Passionate about Islamic art and tech. Love painting, reading, and volunteering in community services.",
    likesCount: "980",
    superLikesCount: "95",
    education: "Bachelors in Design",
    detailedBio: "Assalamu Alaikum! I am Farhana. Passionate about Islamic art, UI/UX designs, and tech. I love spending my free time painting, reading history books, and volunteering in community services. I am looking for a partner who is creative, honest, and striving to build a beautiful life in this world and the hereafter.",
    interests: [
      { label: "Coffee", image: "/coffee_quran.png" },
      { label: "Hiking", image: "/hiking.png" },
      { label: "Design", image: "/farhana.png" }
    ]
  },
  {
    id: 3,
    name: "Zara",
    age: 22,
    city: "Delhi",
    country: "India",
    occupation: "Medical Student",
    image: "/zara.png",
    attributes: ["PRACTICING MUSLIM", "Reads Quran", "Family Oriented", "Charitable"],
    bio: "Aspiring doctor who values honesty and faith. Seeking a partner to embark on a beautiful spiritual journey.",
    likesCount: "1.5k",
    superLikesCount: "220",
    education: "MBBS Doctor Candidate",
    detailedBio: "Assalamu Alaikum! I'm Zara, a medical student with a passion for helping others and serving my community. I value truthfulness, faith, and family values above all. I'm searching for a compassionate, practicing partner who will support my medical career while we grow together spiritually.",
    interests: [
      { label: "Coffee", image: "/coffee_quran.png" },
      { label: "Books", image: "/zara.png" },
      { label: "Hiking", image: "/hiking.png" }
    ]
  },
  {
    id: 4,
    name: "Amina",
    age: 25,
    city: "Bangalore",
    country: "India",
    occupation: "Research Scientist",
    image: "/amina.png",
    attributes: ["PRACTICING MUSLIM", "Prays 5 Times", "Active Volunteer", "Revert"],
    bio: "A revert searching for a guide and partner to build a Halal home based on mutual trust and understanding.",
    likesCount: "850",
    superLikesCount: "60",
    education: "PhD in Biotechnology",
    detailedBio: "Assalamu Alaikum! I am Amina, a biotech researcher. As a revert to Islam, my journey of faith has been the most important part of my life. I am seeking a partner who can be a guide, a friend, and a loving spouse, so we can establish a home centered on mutual respect, trust, and Islamic principles.",
    interests: [
      { label: "Science", image: "/amina.png" },
      { label: "Hiking", image: "/hiking.png" },
      { label: "Coffee", image: "/coffee_quran.png" }
    ]
  },
  {
    id: 5,
    name: "Yasmin",
    age: 26,
    city: "Kochi",
    country: "India",
    occupation: "High School Teacher",
    image: "/couple.png", // fallback visual
    attributes: ["PRACTICING MUSLIM", "Sect: Sunni", "Hijab", "Arabic Speaker"],
    bio: "Teacher of mathematics. Loving, kind, and looking to form a family built on traditional Islamic values.",
    likesCount: "640",
    superLikesCount: "45",
    education: "B.Ed in Mathematics",
    detailedBio: "Assalamu Alaikum! I am Yasmin. I teach mathematics at a secondary school. I am a family-oriented person who values simplicity, traditional values, and learning. I am seeking an honest, understanding partner to build a peaceful family life based on respect and religious commitment.",
    interests: [
      { label: "Coffee", image: "/coffee_quran.png" },
      { label: "Hiking", image: "/hiking.png" },
      { label: "Teaching", image: "/couple.png" }
    ]
  }
];

// Predefined matches trigger: Ayesha (1), Zara (3), Amina (4) will trigger Al-Qadr Match on Like
const MATCH_IDS = [1, 3, 4];

interface Message {
  sender: "me" | "them";
  text?: string;
  type?: "text" | "voice" | "image" | "video";
  voiceDuration?: string;
  imageSrc?: string;
  videoSrc?: string;
  fileUrl?: string;
  time: string;
}

interface ChatThread {
  id: any;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

const getRoomId = (email1: string, email2: string) => {
  return email1 < email2 ? `${email1}_${email2}` : `${email2}_${email1}`;
};

const AudioBubble = ({ url }: { url: string }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white border border-neutral-100 rounded-2xl p-2.5 shadow-sm min-w-[190px]">
      <button onClick={togglePlay} type="button" className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-all">
        {playing ? (
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-grow flex items-center gap-0.5 h-4">
        <span className="w-0.5 h-3.5 bg-brand-pink rounded-full"></span>
        <span className="w-0.5 h-2 bg-brand-pink/50 rounded-full animate-pulse"></span>
        <span className="w-0.5 h-4.5 bg-brand-pink rounded-full"></span>
        <span className="w-0.5 h-2.5 bg-brand-pink rounded-full"></span>
        <span className="w-0.5 h-5 bg-brand-pink rounded-full"></span>
        <span className="w-0.5 h-3.5 bg-brand-pink rounded-full"></span>
        <span className="w-0.5 h-2 bg-brand-pink/30 rounded-full animate-pulse"></span>
      </div>
      <span className="text-[9px] font-bold text-neutral-400">Voice</span>
    </div>
  );
};

export default function DiscoverDashboard() {
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "messages" | "profile">("discover");
  const [profileIndex, setProfileIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  
  // Lists of liked and matched profiles
  const [likedProfiles, setLikedProfiles] = useState<any[]>([]);
  const [matchedProfiles, setMatchedProfiles] = useState<any[]>([]);
  const [dislikedProfiles, setDislikedProfiles] = useState<any[]>([]);
  
  // Al-Qadr Match Screen Overlay State
  const [matchCandidate, setMatchCandidate] = useState<any | null>(null);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  
  // Selected Profile Details Overlay State
  const [selectedProfileForDetails, setSelectedProfileForDetails] = useState<any | null>(null);
  
  // Settings view screen Toggle State
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  
  // Messaging threads
  const [chats, setChats] = useState<ChatThread[]>([
    {
      id: 102, // Mock Ahmed chat matching mockup
      name: "Ahmed",
      avatar: "/ahmed.png",
      lastMessage: "That looks beautiful! MashaAllah. ✨",
      time: "10:53 AM",
      unread: true,
      messages: [
        { sender: "them", text: "Assalamu Alaikum, Ayesha! How was your day?", type: "text", time: "10:42 AM" },
        { sender: "me", text: "Wa Alaikum Assalam! It was wonderful, alhamdulillah. I just finished my Quran recitation.", type: "text", time: "10:45 AM" },
        { sender: "them", type: "voice", voiceDuration: "0:14", time: "10:46 AM" },
        { sender: "me", type: "image", imageSrc: "/coffee_quran.png", time: "10:52 AM" },
        { sender: "them", text: "That looks beautiful! MashaAllah. ✨", type: "text", time: "10:53 AM" },
      ],
    },
    {
      id: 101, // Mock Fatima chat
      name: "Fatima",
      avatar: "/couple.png",
      lastMessage: "I will discuss with my brother and let you know.",
      time: "1h ago",
      unread: false,
      messages: [
        { sender: "me", text: "Would you like to connect with our families?", type: "text", time: "Yesterday" },
        { sender: "them", text: "I will discuss with my brother and let you know.", type: "text", time: "Yesterday" },
      ],
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState("");

  const socketRef = useRef<any>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // WebRTC Calling States & Refs
  const [callState, setCallState] = useState<"idle" | "calling" | "ringing" | "connected" | "incoming">("idle");
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callPeerName, setCallPeerName] = useState("");
  const [callPeerAvatar, setCallPeerAvatar] = useState("");
  const [incomingOffer, setIncomingOffer] = useState<any>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Web Audio Ringtone nodes
  const ringAudioCtxRef = useRef<AudioContext | null>(null);
  const ringOscNodesRef = useRef<OscillatorNode[]>([]);

  // Monetization & Settings state
  const [appSettings, setAppSettings] = useState<any>({
    dailyFreeSwipes: 10,
    freeMessagesCount: 5,
    messagesFree: false,
    pricePerMessage: 0.50,
    stripePublishableKey: "pk_test_51U6UIgAG1417j3BHqSCCksuGePXtOcYyogQ8lm4bVueUZSzbll8YNttjCoqakg718BMCy31a6fdhEjxpZxLURtqv00st0A6RUD",
    superLikePackages: [
      { id: "sl_starter", name: "5 Super Likes", price: 4.99, superLikesCount: 5 },
      { id: "sl_popular", name: "15 Super Likes", price: 11.99, superLikesCount: 15 },
      { id: "sl_pro", name: "40 Super Likes", price: 24.99, superLikesCount: 40 }
    ],
    messageCreditPackages: [
      { id: "msg_basic", name: "20 Messages", price: 2.99, creditsCount: 20 },
      { id: "msg_standard", name: "60 Messages", price: 6.99, creditsCount: 60 },
      { id: "msg_unlimited", name: "150 Messages", price: 14.99, creditsCount: 150 }
    ]
  });

  const [userSuperLikes, setUserSuperLikes] = useState<number>(5);
  const [userMessageCredits, setUserMessageCredits] = useState<number>(10);
  const [showSwipeLimitModal, setShowSwipeLimitModal] = useState<boolean>(false);
  const [showSuperLikesModal, setShowSuperLikesModal] = useState<boolean>(false);
  const [showMessageCreditsModal, setShowMessageCreditsModal] = useState<boolean>(false);
  const [showVipSubscriptionModal, setShowVipSubscriptionModal] = useState<boolean>(false);
  const [selectedStripePackage, setSelectedStripePackage] = useState<{ pkg: any; type: "superlikes" | "messages" | "subscription" | "boost" } | null>(null);
  const [cardNumber, setCardNumber] = useState<string>("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvc, setCardCvc] = useState<string>("123");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentNotice, setPaymentNotice] = useState<string>("");

  // Floating Love Effect & Delayed Match Notification state
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; icon: string }[]>([]);
  const [matchNotification, setMatchNotification] = useState<{ profile: any; time: string } | null>(null);

  // Super Like Animation & Notifications Drawer state
  const [superLikeEffectActive, setSuperLikeEffectActive] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  // Discovery Filters, Swiped History Undo & Report System states
  const [swipedHistory, setSwipedHistory] = useState<any[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [filterAgeMin, setFilterAgeMin] = useState<number>(18);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(50);
  const [filterMinMatch, setFilterMinMatch] = useState<number>(0);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportCandidate, setReportCandidate] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showBoostModal, setShowBoostModal] = useState<boolean>(false);

  // Profile Boost Live Countdown & Premium Theme states
  const [boostTimeLeft, setBoostTimeLeft] = useState<string>("");
  const [isBoostActive, setIsBoostActive] = useState<boolean>(false);

  // Profile Editing states — sectioned edit
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editAge, setEditAge] = useState<number | string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editCity, setEditCity] = useState<string>("");
  const [editCountry, setEditCountry] = useState<string>("");
  const [editProfession, setEditProfession] = useState<string>("");
  const [editEducation, setEditEducation] = useState<string>("");
  const [editBio, setEditBio] = useState<string>("");
  const [editDeenAttributes, setEditDeenAttributes] = useState<string>("");
  const [editHobbies, setEditHobbies] = useState<string>("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewPhotoUrl, setEditNewPhotoUrl] = useState<string>("");
  const [editNewPhotoFile, setEditNewPhotoFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);
  const profileDirectPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserProfile?.email) return;

    showToast("Uploading photo...", "success");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        showToast(uploadData.error || "Photo upload failed", "error");
        return;
      }

      // Append photo to user profile in MongoDB
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserProfile.email, addImages: [uploadData.url] })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUserProfile(data.user);
        showToast("Photo uploaded & added to profile! 📸", "success");
      } else {
        showToast(data.error || "Failed to update profile photos", "error");
      }
    } catch (err: any) {
      showToast("Error uploading photo: " + err.message, "error");
    } finally {
      if (profileDirectPhotoInputRef.current) profileDirectPhotoInputRef.current.value = "";
    }
  };

  const handleOpenEditProfile = () => {
    if (!currentUserProfile) return;
    setEditName(currentUserProfile.name || "");
    setEditAge(currentUserProfile.age || 25);
    setEditPhone(currentUserProfile.phone || "");
    setEditCity(currentUserProfile.city || "");
    setEditCountry(currentUserProfile.country || "");
    setEditProfession(currentUserProfile.profession || currentUserProfile.occupation || "");
    setEditEducation(currentUserProfile.education || "");
    setEditBio(currentUserProfile.bio || currentUserProfile.detailedBio || "");
    setEditDeenAttributes(Array.isArray(currentUserProfile.deenAttributes) ? currentUserProfile.deenAttributes.join(", ") : currentUserProfile.deenAttributes || "");
    setEditHobbies(Array.isArray(currentUserProfile.hobbies) ? currentUserProfile.hobbies.join(", ") : currentUserProfile.hobbies || "");
    setEditImages(Array.isArray(currentUserProfile.images) ? currentUserProfile.images : currentUserProfile.image ? [currentUserProfile.image] : []);
    setEditNewPhotoUrl("");
    setEditNewPhotoFile(null);
    setShowEditProfileModal(true);
  };

  // React Toast helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUserLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
    }
    showToast("Logged out successfully 👋", "success");
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  };

  // Save a specific field section to the DB
  const saveSection = async (section: string, payload: Record<string, any>) => {
    if (!currentUserProfile?.email) return;
    setSavingSection(section);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserProfile.email, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUserProfile(data.user);
        showToast(`${section} updated successfully! 💾`, "success");
      } else {
        showToast(data.error || `Failed to update ${section}`, "error");
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`, "error");
    } finally {
      setSavingSection(null);
    }
  };

  // Add photo via file upload
  const handleAddPhotoFile = async () => {
    if (!editNewPhotoFile || !currentUserProfile?.email) return;
    setSavingSection("photo-upload");
    try {
      const formData = new FormData();
      formData.append("file", editNewPhotoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.url) {
        showToast("Photo upload failed", "error");
        return;
      }
      await saveSection("Photos", { addImages: [uploadData.url] });
      setEditImages((prev) => [...prev, uploadData.url]);
      setEditNewPhotoFile(null);
      if (editPhotoInputRef.current) editPhotoInputRef.current.value = "";
    } catch (err: any) {
      showToast("Upload error: " + err.message, "error");
    } finally {
      setSavingSection(null);
    }
  };

  // Add photo via URL
  const handleAddPhotoUrl = async () => {
    if (!editNewPhotoUrl.trim()) return;
    const url = editNewPhotoUrl.trim();
    setEditImages((prev) => [...prev, url]);
    setEditNewPhotoUrl("");
    await saveSection("Photos", { addImages: [url] });
  };

  // Remove photo by index
  const handleRemovePhoto = async (index: number) => {
    const updated = editImages.filter((_, i) => i !== index);
    setEditImages(updated);
    await saveSection("Photos", { images: updated });
  };

  const handleUndo = () => {
    if (swipedHistory.length === 0) {
      showToast("No swiped card to rewind ↺", "error");
      return;
    }

    const lastProfile = swipedHistory[swipedHistory.length - 1];
    setSwipedHistory((prev) => prev.slice(0, prev.length - 1));
    setProfiles((prev) => [lastProfile, ...prev]);
    setProfileIndex(0);
    showToast(`Rewound ${lastProfile.name}'s card ↺`, "success");
  };

  const triggerLoveEffect = () => {
    const icons = ["💖", "💕", "❤️", "✨", "🌸", "💖", "💘"];
    const hearts = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 75 + 10,
      icon: icons[Math.floor(Math.random() * icons.length)]
    }));
    setFloatingHearts(hearts);
    setTimeout(() => setFloatingHearts([]), 1600);
  };

  const triggerSuperLikeEffect = () => {
    setSuperLikeEffectActive(true);
    setTimeout(() => setSuperLikeEffectActive(false), 2000);
  };

  const fetchNotifications = async (email: string) => {
    try {
      const res = await fetch(`/api/notifications?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!currentUserProfile?.email) return;
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserProfile.email })
      });
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  };

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchableIds, setMatchableIds] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      if (currentUserProfile?.boostUntil) {
        const now = new Date().getTime();
        const target = new Date(currentUserProfile.boostUntil).getTime();
        const diff = target - now;

        if (diff > 0) {
          setIsBoostActive(true);
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (days > 0) {
            setBoostTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else {
            setBoostTimeLeft(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
          }
        } else {
          setIsBoostActive(false);
          setBoostTimeLeft("");
        }
      } else {
        setIsBoostActive(false);
        setBoostTimeLeft("");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUserProfile?.boostUntil, currentUserProfile?.isBoosted]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const email = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "";

        // Fetch settings config
        try {
          const settingsRes = await fetch("/api/settings");
          const settingsData = await settingsRes.json();
          if (settingsData.success && settingsData.settings) {
            setAppSettings(settingsData.settings);
          }
        } catch (setErr) {
          console.error("Error fetching settings:", setErr);
        }

        if (!email) {
          setLoading(false);
          return;
        }

        // Fetch notifications for current user
        fetchNotifications(email);

        // 1. Fetch own profile
        try {
          const selfRes = await fetch(`/api/users?email=${encodeURIComponent(email)}&self=true`);
          const selfData = await selfRes.json();
          if (selfData.success && selfData.user) {
            setCurrentUserProfile(selfData.user);
            if (selfData.user.superLikes !== undefined) setUserSuperLikes(selfData.user.superLikes);
            if (selfData.user.remainingMessageCredits !== undefined) {
              setUserMessageCredits(selfData.user.remainingMessageCredits);
            } else if (selfData.user.messageCredits !== undefined) {
              setUserMessageCredits(selfData.user.messageCredits);
            }
          }
        } catch (selfErr) {
          console.error("Error fetching own profile:", selfErr);
        }

        try {
          const matchesRes = await fetch(`/api/matches?email=${encodeURIComponent(email)}`);
          const matchesData = await matchesRes.json();
          if (matchesData.success && matchesData.chats) {
            setChats(matchesData.chats);
            const matchedProfs = matchesData.chats.map((chat: any) => ({
              id: chat.id,
              name: chat.name,
              age: chat.age || 24,
              city: chat.city || "Dubai",
              country: chat.country || "UAE",
              occupation: chat.occupation || "Software Engineer",
              image: chat.avatar || "/couple.png",
              images: chat.images || [],
              attributes: chat.attributes && chat.attributes.length > 0 
                ? chat.attributes.map((attr: string) => attr.toUpperCase()) 
                : ["PRACTICING MUSLIM", "Family Oriented"],
              bio: chat.bio || `Assalamu Alaikum! I am seeking a partner to build a blessed home based on respect and religious commitment.`,
              likesCount: String(Math.floor(Math.random() * 500) + 100),
              superLikesCount: String(Math.floor(Math.random() * 50) + 5),
              education: chat.education || "Bachelors Degree",
              detailedBio: chat.bio || `Assalamu Alaikum! My name is ${chat.name || "a user"}.`,
              interests: (chat.interests || []).map((hobby: string) => ({
                label: hobby,
                image: "/hiking.png"
              })),
              distance: chat.distance,
              matchPercent: chat.matchPercent
            }));
            setMatchedProfiles(matchedProfs);
          }
        } catch (matchesErr) {
          console.error("Error loading chat threads:", matchesErr);
        }

        // 2. Fetch match candidates
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success && data.users && data.users.length > 0) {
          const transformed = data.users.map((user: any) => {
            const fallbackOccupations = [
              "Software Engineer",
              "UX Designer",
              "Medical Resident",
              "Research Scientist",
              "Teacher",
              "Architect",
              "Financial Analyst",
              "Marketing Manager"
            ];
            const randomOccupation = fallbackOccupations[Math.floor(Math.random() * fallbackOccupations.length)];

            return {
              id: user.email,
              name: user.name || "A Muslim Brother/Sister",
              age: user.age || 24,
              city: user.livingLocation || user.city || "Dubai",
              country: user.country || "UAE",
              occupation: user.profession || randomOccupation,
              image: user.images && user.images.length > 0 ? user.images[0] : "/couple.png",
              images: user.images || [],
              attributes: user.deenAttributes && user.deenAttributes.length > 0
                ? user.deenAttributes.map((attr: string) => attr.toUpperCase())
                : ["PRACTICING MUSLIM", "Family Oriented"],
              bio: user.bio || `Assalamu Alaikum! I am seeking a partner to build a blessed home based on respect and religious commitment.`,
              likesCount: String(Math.floor(Math.random() * 500) + 100),
              superLikesCount: String(Math.floor(Math.random() * 50) + 5),
              education: user.education || "Bachelors Degree",
              detailedBio: user.bio || `Assalamu Alaikum! My name is ${user.name || "a user"}. I am seeking an honest, understanding partner to build a peaceful family life based on respect and religious commitment. My hobbies include: ${(user.hobbies || []).join(", ") || "reading and learning"}.`,
              interests: (user.hobbies || []).map((hobby: string) => ({
                label: hobby,
                image: "/hiking.png"
              })),
              distance: user.distance,
              matchPercent: user.matchPercent
            };
          });
          setProfiles(transformed);
          
          // Profiles that have >= 60% match are matchable
          const matches = transformed.filter((p: any) => p.matchPercent === undefined || p.matchPercent >= 60).map((p: any) => p.id);
          setMatchableIds(matches);
        } else {
          setProfiles([]);
          setMatchableIds([]);
        }
      } catch (err) {
        console.error("Error loading discover data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Socket.io initialization
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to websocket server!");
    });

    socket.on("incoming-call", ({ room, offer, type, callerName, callerAvatar }) => {
      console.log(`[CALL] incoming-call of type: ${type}`);
      
      if (currentUserProfile?.email) {
        const roomUsers = room.split("_");
        const callerEmail = roomUsers.find((e: string) => e !== currentUserProfile.email);
        if (callerEmail) {
          setActiveChatId(callerEmail);
        }
      }

      setCallType(type);
      setCallPeerName(callerName);
      setCallPeerAvatar(callerAvatar);
      setIncomingOffer(offer);
      setCallState("incoming");
      playSynthesizedRingtone("incoming");
    });

    socket.on("call-accepted", async ({ answer }) => {
      console.log("[CALL] call-accepted received");
      stopSynthesizedRingtone();
      setCallState("connected");
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("call-rejected", () => {
      console.log("[CALL] call-rejected received");
      stopSynthesizedRingtone();
      alert("Call declined.");
      endCallLocal();
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      }
    });

    socket.on("call-hungup", () => {
      console.log("[CALL] call-hungup received");
      stopSynthesizedRingtone();
      endCallLocal();
    });

    socket.on("receive-message", (message: any) => {
      console.log("Client received message:", message);
      
      const activeRoom = activeChatId && currentUserProfile?.email ? getRoomId(currentUserProfile.email, activeChatId) : "";
      if (message.room === activeRoom) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === activeChatId) {
              const isMsgMe = message.sender === currentUserProfile?.email;
              const senderVal = isMsgMe ? "me" : "them";
              
              const exists = chat.messages.some(
                (m) =>
                  m.text === message.text &&
                  m.time === message.time &&
                  m.sender === senderVal &&
                  m.fileUrl === message.fileUrl
              );
              if (exists) return chat;

              return {
                ...chat,
                lastMessage: message.text || `Sent a ${message.type}`,
                time: message.time,
                messages: [
                  ...chat.messages,
                  {
                    sender: senderVal,
                    text: message.text,
                    type: message.type,
                    imageSrc: message.imageSrc,
                    videoSrc: message.videoSrc,
                    fileUrl: message.fileUrl,
                    voiceDuration: message.voiceDuration,
                    time: message.time
                  }
                ]
              };
            }
            return chat;
          })
        );
      } else if (currentUserProfile?.email) {
        const roomUsers = message.room.split("_");
        const peerEmail = roomUsers.find((e: string) => e !== currentUserProfile.email);
        if (peerEmail) {
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === peerEmail) {
                return {
                  ...chat,
                  lastMessage: message.text || `Sent a ${message.type}`,
                  time: message.time,
                  unread: true
                };
              }
              return chat;
            })
          );
        }
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeChatId, currentUserProfile?.email]);
  // Join personal user room when email is loaded
  useEffect(() => {
    if (socketRef.current && currentUserProfile?.email) {
      socketRef.current.emit("join-room", currentUserProfile.email);
      console.log(`Joined personal user room client-side: ${currentUserProfile.email}`);
    }
  }, [currentUserProfile?.email]);
  // Join room when activeChatId changes
  useEffect(() => {
    if (socketRef.current && activeChatId && currentUserProfile?.email) {
      const room = getRoomId(currentUserProfile.email, activeChatId);
      socketRef.current.emit("join-room", room);
      console.log(`Joined room client-side: ${room}`);

      const fetchHistory = async () => {
        try {
          const res = await fetch(`/api/chat/history?room=${room}&email=${encodeURIComponent(currentUserProfile.email)}`);
          const data = await res.json();
          if (data.success) {
            setChats((prev) =>
              prev.map((c) => (c.id === activeChatId ? { ...c, messages: data.messages } : c))
            );
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      };
      fetchHistory();
    }
  }, [activeChatId, currentUserProfile?.email]);

  // Ringtone synthesizer Web Audio API
  const playSynthesizedRingtone = (type: "outgoing" | "incoming") => {
    try {
      if (ringAudioCtxRef.current) {
        ringAudioCtxRef.current.close().catch(() => {});
      }
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      ringAudioCtxRef.current = ctx;
      ringOscNodesRef.current = [];

      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (type === "outgoing") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        osc2.frequency.setValueAtTime(480, ctx.currentTime);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        
        let time = ctx.currentTime;
        for (let i = 0; i < 20; i++) {
          gainNode.gain.setValueAtTime(0.1, time);
          time += 2;
          gainNode.gain.setValueAtTime(0, time);
          time += 3;
        }

        osc1.start();
        osc2.start();
        ringOscNodesRef.current.push(osc1, osc2);
      } else {
        let time = ctx.currentTime;
        for (let i = 0; i < 30; i++) {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = "sine";
          osc2.type = "sine";
          osc1.connect(gainNode);
          osc2.connect(gainNode);

          osc1.frequency.setValueAtTime(587.33, time);
          osc2.frequency.setValueAtTime(880.00, time);
          
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.15, time + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
          
          osc1.start(time);
          osc1.stop(time + 1.0);
          osc2.start(time);
          osc2.stop(time + 1.0);
          
          time += 2.5;
        }
      }
    } catch (e) {
      console.error("Web Audio ringtone failed:", e);
    }
  };

  const stopSynthesizedRingtone = () => {
    try {
      if (ringAudioCtxRef.current) {
        ringAudioCtxRef.current.close().catch(() => {});
        ringAudioCtxRef.current = null;
      }
      ringOscNodesRef.current = [];
    } catch (e) {
      console.error("Stop ringtone failed:", e);
    }
  };

  const startMedia = async (type: "audio" | "video") => {
    const constraints = {
      audio: true,
      video: type === "video" ? { width: 300, height: 300, facingMode: "user" } : false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const createPeerConnection = (room: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      console.log("Peer remote track added!");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { room, candidate: event.candidate });
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const makeCall = async (type: "audio" | "video") => {
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat || !currentUserProfile?.email) return;
    const room = getRoomId(currentUserProfile.email, activeChatId);

    setCallState("calling");
    setCallType(type);
    setCallPeerName(activeChat.name);
    setCallPeerAvatar(activeChat.avatar);

    playSynthesizedRingtone("outgoing");

    try {
      const stream = await startMedia(type);
      const pc = createPeerConnection(room);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: activeChatId, // Target callee email address
        room,
        offer,
        type,
        callerName: currentUserProfile.name || currentUserProfile.email,
        callerAvatar: currentUserProfile.images?.[0] || "/couple.png"
      });
    } catch (err) {
      console.error("Failed to make call:", err);
      alert("Please allow camera/microphone permissions to place a call.");
      endCallLocal();
    }
  };

  const acceptCall = async () => {
    if (!activeChatId || !currentUserProfile?.email || !incomingOffer) return;
    const room = getRoomId(currentUserProfile.email, activeChatId);
    
    stopSynthesizedRingtone();
    setCallState("connected");

    try {
      const stream = await startMedia(callType);
      const pc = createPeerConnection(room);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("accept-call", { room, answer });
    } catch (err) {
      console.error("Accept call failed:", err);
      alert("Could not answer call.");
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (!activeChatId || !currentUserProfile?.email) return;
    const room = getRoomId(currentUserProfile.email, activeChatId);
    
    stopSynthesizedRingtone();
    socketRef.current.emit("reject-call", { room });
    endCallLocal();
  };

  const hangupCall = () => {
    if (!activeChatId || !currentUserProfile?.email) return;
    const room = getRoomId(currentUserProfile.email, activeChatId);
    socketRef.current.emit("hangup-call", { room });
    endCallLocal();
  };

  const endCallLocal = () => {
    stopSynthesizedRingtone();
    setCallState("idle");
    setIncomingOffer(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  useEffect(() => {
    if (callState === "connected" && callType === "video") {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  }, [callState, callType]);

  // Attachment uploading
  const handleAttachmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeChatId === null || !currentUserProfile?.email) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setNewMessageText("Uploading attachment...");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const fileUrl = uploadData.url;
        const fileType = file.type.startsWith("video/") ? "video" : "image";
        
        const room = getRoomId(currentUserProfile.email, activeChatId);
        socketRef.current.emit("send-message", {
          room,
          sender: currentUserProfile.email,
          fileType,
          fileUrl
        });
        setNewMessageText("");
      } else {
        alert("Upload failed: " + uploadData.error);
        setNewMessageText("");
      }
    } catch (err: any) {
      console.error("Attachment upload error:", err);
      alert("Error uploading attachment: " + err.message);
      setNewMessageText("");
    }
  };

  // Voice recording
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
          
          if (activeChatId === null || !currentUserProfile?.email) return;

          const formData = new FormData();
          formData.append("file", audioFile);

          try {
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
              const fileUrl = uploadData.url;
              const room = getRoomId(currentUserProfile.email, activeChatId);
              socketRef.current.emit("send-message", {
                room,
                sender: currentUserProfile.email,
                fileType: "audio",
                fileUrl
              });
            } else {
              alert("Voice upload failed: " + uploadData.error);
            }
          } catch (err: any) {
            console.error("Voice upload error:", err);
            alert("Error uploading voice message: " + err.message);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error("Audio recording start error:", err);
        alert("Could not access microphone: " + err.message);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach((track: any) => track.stop());
      }
    }
  };

  const filteredProfiles = (profiles.length > 0 ? profiles : PROFILES).filter((p) => {
    if (p.age && (p.age < filterAgeMin || p.age > filterAgeMax)) return false;
    if (p.matchPercent !== undefined && p.matchPercent < filterMinMatch) return false;
    return true;
  });

  const displayDeck = filteredProfiles.length > 0 ? filteredProfiles : PROFILES;
  const currentProfile = displayDeck[profileIndex % displayDeck.length];

  // Drag-to-swipe states
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || dragStart === null) return;
    const offset = clientX - dragStart;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);

    // Threshold of 120 pixels to register a swipe
    if (dragOffset > 120) {
      handleLike();
    } else if (dragOffset < -120) {
      handleDislike();
    }
    setDragOffset(0);
  };

  // Swiping functions connected to Admin Limits, Floating Love Effect & Delayed Matches
  const handleLike = async () => {
    if (!currentProfile) return;

    // Check client swipe limit first
    if (!currentUserProfile?.isPremium && (currentUserProfile?.dailySwipesCount || 0) >= (appSettings.dailyFreeSwipes || 10)) {
      setShowSwipeLimitModal(true);
      return;
    }

    // Trigger floating heart love animation effect
    triggerLoveEffect();

    if (currentUserProfile?.email) {
      try {
        const res = await fetch("/api/swipes/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUserProfile.email,
            candidateEmail: currentProfile.id,
            action: "like"
          })
        });

        const data = await res.json();
        if (!data.success && data.error === "DAILY_SWIPE_LIMIT_REACHED") {
          setShowSwipeLimitModal(true);
          return;
        }

        if (data.remainingSwipes !== undefined && currentUserProfile) {
          const limit = appSettings.dailyFreeSwipes || 10;
          const count = limit - data.remainingSwipes;
          setCurrentUserProfile((prev: any) => ({ ...prev, dailySwipesCount: count }));
        }
      } catch (err) {
        console.error("Swipe action error:", err);
      }
    }

    const targetCandidate = currentProfile;
    setSwipeDirection("right");

    setTimeout(() => {
      setLikedProfiles((prev) => [...prev, targetCandidate.id]);
      setSwipeDirection(null);
      nextProfile();

      // Schedule realistic delayed match notification (after 20 seconds, simulating 2-3 minutes)
      setTimeout(async () => {
        if (currentUserProfile?.email) {
          try {
            await fetch("/api/matches", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: currentUserProfile.email,
                candidateEmail: targetCandidate.id
              })
            });

            // Refresh matches list
            const matchesRes = await fetch(`/api/matches?email=${encodeURIComponent(currentUserProfile.email)}`);
            const matchesData = await matchesRes.json();
            if (matchesData.success && matchesData.chats) {
              setChats(matchesData.chats);
              const matchedProfs = matchesData.chats.map((chat: any) => ({
                id: chat.id,
                name: chat.name,
                age: chat.age || 24,
                city: chat.city || "Dubai",
                country: chat.country || "UAE",
                occupation: chat.occupation || "Software Engineer",
                image: chat.avatar || "/couple.png",
                images: chat.images || [],
                attributes: chat.attributes && chat.attributes.length > 0 
                  ? chat.attributes.map((attr: string) => attr.toUpperCase()) 
                  : ["PRACTICING MUSLIM", "Family Oriented"],
                bio: chat.bio || `Assalamu Alaikum! I am seeking a partner to build a blessed home based on respect and religious commitment.`,
                likesCount: String(Math.floor(Math.random() * 500) + 100),
                superLikesCount: String(Math.floor(Math.random() * 50) + 5),
                education: chat.education || "Bachelors Degree",
                detailedBio: chat.bio || `Assalamu Alaikum! My name is ${chat.name || "a user"}.`,
                interests: (chat.interests || []).map((hobby: string) => ({
                  label: hobby,
                  image: "/hiking.png"
                })),
                distance: chat.distance,
                matchPercent: chat.matchPercent
              }));
              setMatchedProfiles(matchedProfs);
            }

            // Show Toast Notification
            setMatchNotification({
              profile: targetCandidate,
              time: "Just now"
            });
          } catch (matchErr) {
            console.error("Match save error:", matchErr);
          }
        }
      }, 20000); // 20 seconds delayed match arrival
    }, 300);
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;

    if (userSuperLikes <= 0) {
      setShowSuperLikesModal(true);
      return;
    }

    // Trigger explosive golden star Super Like visual effect
    triggerSuperLikeEffect();
    triggerLoveEffect();

    if (currentUserProfile?.email) {
      try {
        const res = await fetch("/api/swipes/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUserProfile.email,
            candidateEmail: currentProfile.id,
            action: "superlike"
          })
        });

        const data = await res.json();
        if (!data.success && data.error === "OUT_OF_SUPERLIKES") {
          setShowSuperLikesModal(true);
          return;
        }

        if (data.superLikes !== undefined) {
          setUserSuperLikes(data.superLikes);
        }

        // Send Super Like notification to receiver candidate
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: currentUserProfile.email,
            receiverEmail: currentProfile.id,
            senderName: currentUserProfile.name || "A Muslim Brother/Sister",
            senderImage: currentUserProfile.images?.[0] || "/couple.png",
            type: "superlike",
            message: "Sent you a Super Like! ⭐"
          })
        });
      } catch (err) {
        console.error("Superlike action error:", err);
      }
    }

    const targetCandidate = currentProfile;
    setSwipeDirection("right");

    setTimeout(() => {
      setLikedProfiles((prev) => [...prev, targetCandidate.id]);
      setSwipeDirection(null);
      nextProfile();

      // Schedule fast match notification for Super Likes (after 12 seconds)
      setTimeout(async () => {
        if (currentUserProfile?.email) {
          try {
            await fetch("/api/matches", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: currentUserProfile.email,
                candidateEmail: targetCandidate.id
              })
            });

            const matchesRes = await fetch(`/api/matches?email=${encodeURIComponent(currentUserProfile.email)}`);
            const matchesData = await matchesRes.json();
            if (matchesData.success && matchesData.chats) {
              setChats(matchesData.chats);
              setMatchedProfiles(matchesData.chats);
            }

            setMatchNotification({
              profile: targetCandidate,
              time: "Just now"
            });
          } catch (matchErr) {
            console.error("Superlike match error:", matchErr);
          }
        }
      }, 12000);
    }, 300);
  };

  // Stripe Checkout Purchase Function
  const handlePurchasePackage = async (pkg: any, packageType: "superlikes" | "messages" | "subscription" | "boost") => {
    if (!currentUserProfile?.email) {
      alert("Please log in to make a purchase.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentNotice("");

    try {
      // 1. Create PaymentIntent via Stripe API backend
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUserProfile.email,
          packageId: pkg.id,
          packageType
        })
      });

      const checkoutData = await res.json();
      if (!checkoutData.success) {
        alert(checkoutData.error || "Payment checkout creation failed.");
        setIsProcessingPayment(false);
        return;
      }

      // 2. Confirm Payment via Stripe test handler
      const confirmRes = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: checkoutData.paymentIntentId,
          email: currentUserProfile.email,
          packageType,
          itemCount: checkoutData.itemCount
        })
      });

      const confirmData = await confirmRes.json();
      if (confirmData.success) {
        if (packageType === "superlikes") {
          setUserSuperLikes(confirmData.user.superLikes);
          setShowSuperLikesModal(false);
          setShowSwipeLimitModal(false);
        } else if (packageType === "messages") {
          setUserMessageCredits(confirmData.user.messageCredits);
          setShowMessageCreditsModal(false);
        } else if (packageType === "subscription") {
          setCurrentUserProfile((prev: any) => ({ ...prev, isPremium: true }));
          setShowVipSubscriptionModal(false);
        } else if (packageType === "boost") {
          setCurrentUserProfile((prev: any) => ({ ...prev, isBoosted: true, boostUntil: confirmData.user.boostUntil }));
          setShowBoostModal(false);
          showToast(`⚡ Profile Boost Activated! Your profile is now prioritized FIRST!`, "success");
        }
        alert(`🎉 Payment Successful via Stripe! ${packageType === "subscription" ? "You are now a VIP Premium Member! All profile photos unlocked and unblurred." : packageType === "boost" ? "Your Profile Spotlight Boost is now ACTIVE! You are ranked #1 in candidate feeds." : `Added ${checkoutData.itemCount} ${packageType === "superlikes" ? "Super Likes" : "Message Credits"}.`}`);
      } else {
        alert(confirmData.error || "Payment confirmation failed.");
      }
    } catch (err: any) {
      console.error("Stripe payment error:", err);
      alert("Payment Error: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDislike = async () => {
    if (!currentProfile) return;

    // Check client swipe limit first
    if (!currentUserProfile?.isPremium && (currentUserProfile?.dailySwipesCount || 0) >= (appSettings.dailyFreeSwipes || 10)) {
      setShowSwipeLimitModal(true);
      return;
    }

    if (currentUserProfile?.email) {
      try {
        const res = await fetch("/api/swipes/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUserProfile.email,
            candidateEmail: currentProfile.id,
            action: "dislike"
          })
        });

        const data = await res.json();
        if (!data.success && data.error === "DAILY_SWIPE_LIMIT_REACHED") {
          setShowSwipeLimitModal(true);
          return;
        }

        if (data.remainingSwipes !== undefined && currentUserProfile) {
          const limit = appSettings.dailyFreeSwipes || 10;
          const count = limit - data.remainingSwipes;
          setCurrentUserProfile((prev: any) => ({ ...prev, dailySwipesCount: count }));
        }
      } catch (err) {
        console.error("Dislike action error:", err);
      }
    }

    setSwipeDirection("left");
    setTimeout(() => {
      setDislikedProfiles((prev) => [...prev, currentProfile.id]);
      setSwipeDirection(null);
      nextProfile();
    }, 300);
  };

  const nextProfile = () => {
    if (displayDeck.length === 0) return;
    setProfileIndex((prev) => (prev + 1) % displayDeck.length);
  };

  // Open Chat thread from Match card or success overlay
  const startChat = (profile: any) => {
    // Check if chat thread already exists
    const existingChat = chats.find(c => c.id === profile.id);
    if (!existingChat) {
      const newChat: ChatThread = {
        id: profile.id,
        name: profile.name,
        avatar: profile.image,
        lastMessage: "You matched! Start the conversation.",
        time: "Just now",
        unread: false,
        messages: []
      };
      setChats((prev) => [newChat, ...prev]);
    }
    setActiveChatId(profile.id);
    setActiveTab("messages");
  };

  // Send message triggers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || activeChatId === null || !currentUserProfile?.email) return;
    
    // Check message credits if messages are not marked as free by Admin
    if (!appSettings.messagesFree && userMessageCredits <= 0) {
      setShowMessageCreditsModal(true);
      return;
    }

    const room = getRoomId(currentUserProfile.email, activeChatId);

    socketRef.current.emit("send-message", {
      room,
      sender: currentUserProfile.email,
      text: newMessageText,
      fileType: "text"
    });

    if (!appSettings.messagesFree) {
      setUserMessageCredits((prev) => Math.max(0, prev - 1));
    }

    setNewMessageText("");
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] text-[#171717] font-sans antialiased flex flex-col justify-between max-w-md mx-auto w-full border-x border-neutral-100 shadow-md relative">
        <header className="flex justify-between items-center px-4 py-4 bg-white border-b border-neutral-100/80 sticky top-0 z-20 select-none">
          <button type="button" className="text-neutral-500 hover:text-brand-pink transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-xl font-bold tracking-tight text-[#c21a5c]">LoveLink</span>
          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200"></div>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-neutral-100 border-t-brand-pink animate-spin"></div>
          <span className="text-xs text-neutral-400 font-semibold">Seeking blessed connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col justify-between max-w-md mx-auto w-full border-x shadow-md relative transition-colors duration-700 ${
      isBoostActive
        ? "bg-[#0d0d12] text-white border-purple-900/50"
        : "bg-[#FCFBF9] text-[#171717] border-neutral-100"
    }`}>

      {/* SPOTLIGHT BOOST ACTIVATED BANNER WITH COUNTDOWN */}
      {isBoostActive && (
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-purple-500/40 shadow-lg sticky top-0 z-30 select-none animate-pulse">
          <div className="flex items-center gap-1.5 font-black tracking-wider uppercase text-[10px]">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-purple-200">BOOST ACTIVATED</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 px-2.5 py-0.5 rounded-full border border-purple-400/40 font-mono text-amber-300 font-extrabold text-[10px]">
            <span>⏳</span>
            <span>{boostTimeLeft}</span>
          </div>
        </div>
      )}
      
      {/* Top Header */}
      {activeTab !== "profile" && (
        <header className={`flex justify-between items-center px-4 py-3 border-b sticky top-0 z-20 select-none shadow-xs transition-colors duration-700 ${
          isBoostActive ? "bg-[#14141d] border-purple-900/50 text-white" : "bg-white border-neutral-100/80"
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-[#c21a5c]">LoveLink</span>
            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className="p-1 text-neutral-400 hover:text-brand-pink transition-colors text-xs"
              title="Filter Candidates"
            >
              🔍
            </button>
          </div>

          {/* User Credits & Balance Pill Bar */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setShowSuperLikesModal(true)}
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:scale-105 transition-all"
              title="Click to buy Super Likes"
            >
              <span>⭐</span>
              <span>{userSuperLikes}</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              type="button"
              onClick={() => setShowMessageCreditsModal(true)}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:scale-105 transition-all"
              title="Click to buy Message Credits"
            >
              <span>💬</span>
              <span>{userMessageCredits}</span>
            </button>
            <span className="text-neutral-300">|</span>
            <div
              className="flex items-center gap-1 text-rose-500"
              title="Daily free swipes remaining"
            >
              <span>🔥</span>
              <span>{Math.max(0, (appSettings.dailyFreeSwipes || 10) - (currentUserProfile?.dailySwipesCount || 0))}</span>
            </div>
          </div>

          {/* Notification Bell Icon */}
          <button
            type="button"
            onClick={() => {
              setShowNotificationsDrawer(true);
              markNotificationsAsRead();
            }}
            className="relative p-1.5 text-neutral-600 hover:text-amber-500 transition-colors"
            title="Notifications & Received Super Likes"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setShowSettingsScreen(false);
            }}
            className="w-9 h-9 rounded-full overflow-hidden border border-neutral-200 relative shadow-sm hover:scale-105 transition-all"
          >
            <Image src={currentUserProfile?.images?.[0] || "/ahmed.png"} fill alt="User avatar" className="object-cover" />
          </button>
        </header>
      )}

      {/* Main Content Areas */}
      <main className="flex-grow flex flex-col justify-center py-4 px-4 overflow-y-auto min-h-[500px]">
        
        {/* TAB 1: SWIPING DISCOVER FEED */}
        {activeTab === "discover" && (
          <div className="flex flex-col flex-1 justify-between gap-6 relative">
            {currentProfile ? (
              <>
                {/* Swipeable Card Stack */}
                <div
                  onMouseDown={(e) => handleDragStart(e.clientX)}
                  onMouseMove={(e) => handleDragMove(e.clientX)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                  onTouchEnd={handleDragEnd}
                  className={`relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden select-none transition-all duration-300 ${
                    currentProfile?.isBoosted || (currentProfile?.boostUntil && new Date(currentProfile.boostUntil) > new Date())
                      ? "border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] bg-purple-950"
                      : "border border-neutral-100/40 bg-zinc-200 shadow-xl"
                  }`}
                  style={{
                    transform: isDragging
                      ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`
                      : swipeDirection === "left"
                      ? "translateX(-150%) rotate(-15deg) scale(0.95)"
                      : swipeDirection === "right"
                      ? "translateX(150%) rotate(15deg) scale(0.95)"
                      : "translateX(0px) rotate(0deg) scale(1)",
                    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out",
                    cursor: isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                  }}
                >
                  {/* Visual Stamps overlays when dragging */}
                  {dragOffset > 40 && (
                    <div className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 bg-white/95 font-black text-3xl px-4 py-1.5 rounded-xl rotate-[-12deg] tracking-widest uppercase z-30 pointer-events-none select-none">
                      LIKE
                    </div>
                  )}
                  {dragOffset < -40 && (
                    <div className="absolute top-8 right-8 border-4 border-brand-pink text-brand-pink bg-white/95 font-black text-3xl px-4 py-1.5 rounded-xl rotate-[12deg] tracking-widest uppercase z-30 pointer-events-none select-none">
                      NOPE
                    </div>
                  )}

                  {/* Boosted Profile Animated Badge */}
                  {(currentProfile?.isBoosted || (currentProfile?.boostUntil && new Date(currentProfile.boostUntil) > new Date())) && (
                    <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg border border-purple-300 animate-pulse">
                      <span>⚡</span>
                      <span>BOOSTED PROFILE</span>
                    </div>
                  )}

                  <Image
                    src={currentProfile.image}
                    alt={currentProfile.name}
                    fill
                    priority
                    sizes="400px"
                    className={`object-cover pointer-events-none select-none transition-all duration-500 ${
                      !currentUserProfile?.isPremium && appSettings.requireSubscriptionToViewPhotos !== false
                        ? "filter blur-xl scale-110"
                        : ""
                    }`}
                  />

                  {/* VIP Subscription Photo Lock Blur Overlay */}
                  {!currentUserProfile?.isPremium && appSettings.requireSubscriptionToViewPhotos !== false && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 select-none">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl shadow-xl animate-bounce">
                        🔒
                      </div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                        VIP Premium Required
                      </span>
                      <h4 className="text-lg font-black text-white">Unlock & Unblur Profile Photos</h4>
                      <p className="text-xs text-neutral-200 font-medium max-w-xs leading-relaxed">
                        Subscribe to {appSettings.subscriptionName || "Matrimony VIP Premium"} for only ${appSettings.subscriptionPrice || 19.99}/mo to view clear photos!
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVipSubscriptionModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-95 mt-2 flex items-center gap-2"
                      >
                        <span>👑</span>
                        <span>Unlock Photos - ${appSettings.subscriptionPrice || 19.99}/mo</span>
                      </button>
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-10"></div>
                  {/* Profile overlay details */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 text-white">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-extrabold tracking-tight">{currentProfile.name}, {currentProfile.age}</h2>
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-teal text-white border border-brand-teal shadow-md">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm font-semibold text-neutral-200">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <circle cx="12" cy="11" r="3" />
                        </svg>
                        <span>{currentProfile.city}{currentProfile.distance !== undefined && currentProfile.distance !== Infinity ? ` (${Math.round(currentProfile.distance)} km away)` : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{currentProfile.occupation}</span>
                      </div>
                    </div>

                    {/* Pill tags */}
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {currentProfile.matchPercent !== undefined && (
                        <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-bold tracking-wider shadow-sm uppercase animate-pulse">
                          💖 {currentProfile.matchPercent}% Match
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal text-white rounded-full text-[10px] font-bold tracking-wider shadow-sm uppercase">
                        🕌 {currentProfile.attributes[0]}
                      </span>
                      {currentProfile.attributes.slice(1).map((tag: any, idx: number) => (
                        <span key={idx} className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold tracking-wide uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swiping Buttons Control Panel */}
                <div className="flex flex-col gap-4 items-center">
                  <div className="flex items-center justify-center gap-4">
                    {/* Undo Refresh */}
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="w-12 h-12 rounded-full bg-white border border-neutral-100 text-yellow-500 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                      </svg>
                    </button>

                    {/* Dislike Cross */}
                    <button
                      type="button"
                      onClick={handleDislike}
                      className="w-14 h-14 rounded-full bg-white border border-neutral-100 text-neutral-400 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl"
                    >
                      ✕
                    </button>

                    {/* Blue Star Super Like */}
                    <button
                      type="button"
                      onClick={handleSuperLike}
                      className="w-12 h-12 rounded-full bg-white border border-neutral-100 text-blue-500 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative"
                      title="Super Like"
                    >
                      ★
                      {userSuperLikes > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                          {userSuperLikes}
                        </span>
                      )}
                    </button>

                    {/* Like Heart */}
                    <button
                      type="button"
                      onClick={handleLike}
                      className="w-16 h-16 rounded-full bg-brand-pink text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-2xl"
                    >
                      ♥
                    </button>

                    {/* Boost Lightning */}
                    <button
                      type="button"
                      onClick={() => setShowBoostModal(true)}
                      className="w-12 h-12 rounded-full bg-white border border-neutral-100 text-purple-600 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all hover:border-purple-300"
                      title="Boost Your Profile"
                    >
                      ⚡
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                    Swipe right to express interest
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-center gap-4 py-16">
                <span className="text-4xl">🕌</span>
                <h3 className="text-lg font-bold text-neutral-700">All caught up!</h3>
                <p className="text-xs text-neutral-400 px-8">We've shown you all matching candidates in your region.</p>
                <button
                  type="button"
                  onClick={() => setProfileIndex(0)}
                  className="bg-brand-pink text-white px-6 py-3 rounded-full text-xs font-bold shadow-md"
                >
                  Rewind Deck
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MATCHES GRID LIST */}
        {activeTab === "matches" && (
          <div className="flex flex-col flex-grow gap-6 min-h-[500px]">
            <div>
              <h2 className="text-2xl font-extrabold text-[#c21a5c] tracking-tight">Your Matches</h2>
              <p className="text-xs text-neutral-400 font-medium">Blessed matches waiting for a conversation</p>
            </div>

            {matchedProfiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {matchedProfiles.map((profile) => (
                  <div key={profile.id} className="bg-white rounded-3xl border border-neutral-100 p-3 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
                    <div
                      onClick={() => setSelectedProfileForDetails(profile)}
                      className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer"
                    >
                      <Image src={profile.image} fill alt={profile.name} className="object-cover" />
                    </div>
                    <div
                      onClick={() => setSelectedProfileForDetails(profile)}
                      className="px-1 cursor-pointer"
                    >
                      <h4 className="font-extrabold text-sm text-neutral-800 flex items-center gap-1.5 group-hover:text-brand-pink transition-colors">
                        {profile.name}, {profile.age}
                        <span className="w-3.5 h-3.5 rounded-full bg-brand-teal text-white flex items-center justify-center text-[7px]">✓</span>
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-bold mt-0.5 truncate">{profile.occupation}</p>
                    </div>
                    <button
                      onClick={() => startChat(profile)}
                      className="w-full bg-brand-pink text-white py-2 rounded-xl text-xs font-bold transition-all hover:bg-brand-pink-hover shadow-sm active:scale-[0.98]"
                    >
                      Chat Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-center gap-3 py-16">
                <span className="text-3xl text-neutral-300">🤲</span>
                <h4 className="font-bold text-sm text-neutral-500">No Matches Yet</h4>
                <p className="text-xs text-neutral-400 max-w-[220px] leading-relaxed">Swipe right on profiles that match your values to find compatible connections.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MESSAGES THREADS */}
        {activeTab === "messages" && (
          <div className="flex flex-col flex-grow justify-between gap-4">
            {activeChatId === null ? (
              <div className="flex flex-col flex-grow gap-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#c21a5c] tracking-tight">Messages</h2>
                  <p className="text-xs text-neutral-400 font-medium">Blessed conversations and introductions</p>
                </div>

                <div className="flex flex-col gap-3">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all text-left ${
                        chat.unread
                          ? "bg-[#FFF5F8] border-pink-100/50 shadow-sm"
                          : "bg-white border-neutral-100 hover:border-neutral-200"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-100 relative flex-shrink-0">
                        <Image src={chat.avatar} fill alt={chat.name} className="object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-extrabold text-sm text-neutral-800">{chat.name}</h4>
                          <span className="text-[9px] text-neutral-400 font-semibold">{chat.time}</span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium truncate pr-4">{chat.lastMessage}</p>
                      </div>
                      {chat.unread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-pink flex-shrink-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#FCFBF9] z-30 flex flex-col justify-between h-full w-full">
                {/* Custom Chat Header (Fixed at top) */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 select-none bg-white flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setActiveChatId(null)} className="p-1 text-neutral-500 hover:text-brand-pink transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div
                      onClick={() => {
                        const p = profiles.find(x => x.name === activeChat?.name) || matchedProfiles.find(x => x.name === activeChat?.name);
                        if (p) setSelectedProfileForDetails(p);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-100 relative shadow-sm group-hover:scale-105 transition-all flex-shrink-0">
                        <Image src={activeChat?.avatar || "/couple.png"} fill alt="Avatar" className="object-cover" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-neutral-800 leading-tight group-hover:text-brand-pink transition-colors">{activeChat?.name}</h4>
                        <span className="text-[9px] text-neutral-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Online
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions call/video */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => makeCall("audio")} type="button" className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-brand-pink transition-colors">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button onClick={() => makeCall("video")} type="button" className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-brand-pink transition-colors">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages Body (Scrollable, takes all remaining space) */}
                <div
                  className="flex-grow flex-1 py-4 px-4 flex flex-col gap-4 overflow-y-auto"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 10 L32 26 L48 28 L32 30 L30 46 L28 30 L12 28 L28 26 Z' fill='%23fce7f3' fill-opacity='0.25'/%3E%3C/svg%3E")`,
                    backgroundSize: "60px 60px",
                  }}
                >
                  {/* Islamic safe chat alert */}
                  <div className="bg-[#FFF5F8] border border-pink-100/50 rounded-2xl p-3 flex gap-3 shadow-sm select-none">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4.5 w-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-bold text-[10px] text-brand-pink leading-none mb-1">Islamic safe chat</h5>
                      <p className="text-[9.5px] text-neutral-500 font-semibold leading-normal">
                        Your conversation is private and follows Islamic principles of respect.
                      </p>
                    </div>
                  </div>

                  {/* Today marker */}
                  <div className="flex justify-center my-1 select-none">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-400 text-[8.5px] font-bold tracking-wider rounded-full uppercase">
                      Today
                    </span>
                  </div>

                  {activeChat?.messages.length === 0 ? (
                    <div className="text-center text-xs text-neutral-400 py-12">
                      Send a polite greeting to start your conversation.
                    </div>
                  ) : (
                    activeChat?.messages.map((m, idx) => {
                      const isMe = m.sender === "me";
                      return (
                        <div key={idx} className={`flex flex-col ${isMe ? "items-end justify-end" : "items-start justify-start"}`}>
                          {/* Voice player bubble */}
                          {m.type === "voice" ? (
                            <AudioBubble url={m.fileUrl || ""} />
                          ) : m.type === "image" ? (
                            /* Image bubble */
                            <div className="relative aspect-[4/3] w-48 rounded-2xl overflow-hidden shadow-sm border border-brand-pink/20 cursor-pointer hover:opacity-95 transition-all" onClick={() => window.open(m.fileUrl || m.imageSrc, '_blank')}>
                              <Image src={m.imageSrc || m.fileUrl || "/couple.png"} fill alt="Attachment" className="object-cover" />
                            </div>
                          ) : m.type === "video" ? (
                            /* Video bubble */
                            <div className="relative w-48 rounded-2xl overflow-hidden shadow-sm border border-neutral-100 bg-black">
                              <video src={m.videoSrc || m.fileUrl} controls className="w-full h-full object-cover max-h-48" />
                            </div>
                          ) : (
                            /* Standard text bubble */
                            <div
                              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[11.5px] font-medium leading-relaxed shadow-sm ${
                                isMe
                                  ? "bg-brand-pink text-white rounded-br-none"
                                  : "bg-white border border-neutral-100 text-neutral-800 rounded-bl-none"
                              }`}
                            >
                              {m.text}
                            </div>
                          )}

                          {/* Timestamp */}
                          <span className="text-[8px] font-bold text-neutral-400 mt-1 flex items-center gap-0.5 select-none">
                            {m.time}
                            {isMe && <span className="text-[10px] text-brand-pink">✓✓</span>}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer inputs (Fixed at bottom) */}
                <div className="p-3 bg-white border-t border-neutral-100 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center select-none bg-white">
                    <div className="flex-grow flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-neutral-200 bg-white">
                      <button type="button" className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        required={!isRecording}
                        disabled={isRecording}
                        value={isRecording ? "Recording voice message..." : newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder={isRecording ? "Microphone active... Click mic to stop & send." : "Type a message..."}
                        className={`flex-grow focus:outline-none text-xs font-semibold bg-transparent placeholder-neutral-400 ${
                          isRecording ? "text-brand-pink animate-pulse" : "text-neutral-700"
                        }`}
                      />
                      <button onClick={toggleRecording} type="button" className={`transition-colors ${isRecording ? "text-red-500 animate-ping mr-1" : "text-neutral-400 hover:text-neutral-600 mr-1"}`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button onClick={() => attachmentInputRef.current?.click()} type="button" className="text-neutral-400 hover:text-neutral-600 rotate-[45deg] transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={attachmentInputRef}
                      onChange={handleAttachmentSelect}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div className="absolute inset-0 bg-[#FCFBF9] z-20 flex flex-col justify-between h-full w-full">
            {showSettingsScreen ? (
              /* SETTINGS & SAFETY SCREEN */
              <div className="flex flex-col h-full w-full bg-[#FCFBF9] overflow-y-auto pb-6">
                {/* Settings & Safety Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 bg-white sticky top-0 z-20 select-none flex-shrink-0">
                  <button 
                    onClick={() => setShowSettingsScreen(false)} 
                    className="p-1.5 text-neutral-500 hover:text-brand-pink transition-colors"
                  >
                    <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-extrabold text-base text-brand-pink">Settings & Safety</span>
                  <div className="w-8"></div>
                </div>

                <div className="px-6 py-6 flex flex-col gap-6">
                  {/* Verify Account card */}
                  <div className="bg-white rounded-2xl border border-neutral-100/80 p-4 flex items-center justify-between shadow-sm select-none">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5.5 w-5.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-neutral-800 leading-tight">Verify Account</h4>
                        <p className="text-[9.5px] font-bold text-neutral-400 mt-1 leading-tight">Boost trust & visibility</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert("Verification request submitted! Alhamdullilah.")}
                      className="bg-brand-pink hover:bg-brand-pink-hover text-white text-[10px] font-black tracking-wide uppercase px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-all"
                    >
                      Verify Now
                    </button>
                  </div>

                  {/* ACCOUNT & SECURITY */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest block px-1">Account & Security</span>
                    <div className="bg-white rounded-2xl border border-neutral-100/80 shadow-sm overflow-hidden divide-y divide-neutral-50">
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-bold">Account Details</span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span className="text-xs font-bold">Notifications</span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>

                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-xs font-bold">Privacy Settings</span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>
                    </div>
                  </div>

                  {/* SAFETY & COMMUNITY */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest block px-1">Safety & Community</span>
                    <div className="bg-white rounded-2xl border border-neutral-100/80 shadow-sm overflow-hidden divide-y divide-neutral-50">
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs font-bold flex items-center gap-2">
                            Safety Center
                            <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full border border-emerald-100">Tips</span>
                          </span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <span className="text-xs font-bold">Blocked Users</span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>

                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50/50 transition-colors group">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <svg className="h-4.5 w-4.5 text-neutral-400 group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-bold">Help & Support</span>
                        </div>
                        <span className="text-neutral-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </div>
                    </div>
                  </div>

                  {/* LOGOUT IN SETTINGS */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-widest block px-1">Session</span>
                    <div className="bg-white rounded-2xl border border-neutral-100/80 shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={handleUserLogout}
                        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-rose-50/20 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-3 text-rose-600">
                          <span className="text-base">🚪</span>
                          <span className="text-xs font-extrabold">Log Out of Account</span>
                        </div>
                        <span className="text-rose-400 group-hover:translate-x-0.5 transition-transform font-bold text-xs">Exit ›</span>
                      </button>
                    </div>
                  </div>

                  {/* DANGER ZONE */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9.5px] font-bold text-red-500 uppercase tracking-widest block px-1">Danger Zone</span>
                    <div className="bg-white rounded-2xl border border-red-50/50 shadow-sm overflow-hidden">
                      <Link href="/" className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50/10 transition-colors group">
                        <div className="flex items-center gap-3 text-red-600">
                          <svg className="h-4.5 w-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-xs font-black">Delete Account</span>
                        </div>
                        <span className="text-red-400 group-hover:translate-x-0.5 transition-transform">›</span>
                      </Link>
                    </div>
                  </div>

                  {/* Version tag */}
                  <div className="text-center text-[10px] text-neutral-400 font-bold tracking-wide mt-4">
                    Version 2.4.0 (1805)
                  </div>
                </div>
              </div>
            ) : (
              /* MY PROFILE TAB SCREEN */
              <div className="flex flex-col h-full w-full bg-[#FCFBF9] overflow-y-auto pb-6">
                {/* My Profile Header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 bg-white sticky top-0 z-20 select-none flex-shrink-0">
                  <button 
                    onClick={() => setActiveTab("discover")} 
                    className="p-1.5 text-neutral-500 hover:text-brand-pink transition-colors"
                  >
                    <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-extrabold text-base text-neutral-800">My Profile</span>
                  <button 
                    onClick={() => setShowSettingsScreen(true)}
                    className="p-1.5 text-brand-pink hover:text-brand-pink-hover transition-colors"
                  >
                    <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                  </button>
                </div>

                <div className="px-6 py-6 flex flex-col gap-6">
                  {/* Circular Avatar Block */}
                  <div className="flex flex-col items-center gap-3 select-none">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative">
                      <Image src={currentUserProfile?.images?.[0] || "/ahmed.png"} fill alt="Profile Avatar" className="object-cover" />
                      <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-extrabold text-neutral-800">{currentUserProfile?.name || "Omar Al-Farsi"}</h3>
                      <p className="text-xs text-neutral-400 font-bold mt-1">{currentUserProfile?.age || 29} • {currentUserProfile?.city || "Dubai"}, {currentUserProfile?.country || "UAE"}</p>
                    </div>
                    
                    {/* Edit Profile Button */}
                    <button 
                      onClick={handleOpenEditProfile}
                      className="bg-gradient-to-r from-brand-pink to-[#be185d] text-white text-xs font-black tracking-wide uppercase px-6 py-3 rounded-full shadow-md flex items-center gap-2 active:scale-95 transition-all mt-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Profile
                    </button>
                  </div>

                  {/* My Balances & Subscription Credits Dashboard Card */}
                  <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 rounded-3xl p-5 text-white shadow-xl border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          My Account Credits
                        </span>
                        <h4 className="text-sm font-black text-white mt-1">Balances & Subscriptions</h4>
                      </div>
                      <span className="text-xs text-neutral-400 font-bold">Stripe Secured 🔒</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Super Likes Card */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Super Likes</span>
                          <div className="text-2xl font-black text-amber-400 flex items-center gap-1 mt-0.5">
                            <span>⭐</span>
                            <span>{userSuperLikes}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowSuperLikesModal(true)}
                          className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all"
                        >
                          + Get Super Likes
                        </button>
                      </div>

                      {/* Message Credits Card */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Message Credits</span>
                          <div className="text-2xl font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span>💬</span>
                            <span>{userMessageCredits}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowMessageCreditsModal(true)}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all"
                        >
                          + Get Credits
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 pt-1 bg-white/5 px-3 py-2 rounded-xl">
                      <span>🔥 Daily Free Swipes Remaining:</span>
                      <span className="text-rose-400 font-extrabold">{Math.max(0, (appSettings.dailyFreeSwipes || 10) - (currentUserProfile?.dailySwipesCount || 0))} Swipes</span>
                    </div>
                  </div>

                  {/* Hidden Direct Photo Upload Input */}
                  <input
                    type="file"
                    ref={profileDirectPhotoInputRef}
                    accept="image/*"
                    onChange={handleDirectPhotoUpload}
                    className="hidden"
                  />

                  {/* PHOTOS Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-baseline select-none">
                      <span className="text-[10px] font-black text-neutral-400 tracking-wider uppercase">Photos</span>
                      <button onClick={handleOpenEditProfile} className="text-xs font-black text-brand-pink hover:text-brand-pink-hover transition-colors">Manage</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3.5">
                      {currentUserProfile?.images && currentUserProfile.images.length > 0 ? (
                        currentUserProfile.images.map((img: string, idx: number) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-neutral-100/50 bg-neutral-100">
                            <Image src={img} fill alt={`Photo ${idx + 1}`} className="object-cover" />
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-neutral-100/50 bg-neutral-100">
                            <Image src="/ahmed.png" fill alt="Photo 1" className="object-cover" />
                          </div>
                          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-neutral-100/50 bg-neutral-100">
                            <Image src="/couple.png" fill alt="Photo 2" className="object-cover" />
                          </div>
                        </>
                      )}
                      <div 
                        onClick={() => profileDirectPhotoInputRef.current?.click()}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-pink-200 bg-pink-50/30 text-brand-pink hover:bg-pink-50 hover:border-pink-300 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all select-none"
                        title="Click to Upload Photo"
                      >
                        <svg className="h-6 w-6 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[9px] font-black text-brand-pink uppercase tracking-wider">+ Add</span>
                      </div>
                    </div>
                  </div>

                  {/* About Me Card */}
                  <div className="bg-white rounded-2xl border border-neutral-100/80 p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-brand-pink select-none">
                      <svg className="h-4.5 w-4.5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-xs font-black uppercase tracking-wider">About Me</h3>
                    </div>
                    <p className="text-[11.5px] text-neutral-600 leading-relaxed font-semibold">
                      {currentUserProfile?.bio || (currentUserProfile?.hobbies && currentUserProfile.hobbies.length > 0 ? (
                        `Assalamu Alaikum! I am seeking an honest, understanding partner to build a peaceful family life based on respect and religious commitment. My hobbies and interests include: ${currentUserProfile.hobbies.join(", ")}.`
                      ) : (
                        "As a Product Manager in the tech space, I value intentionality and growth. I'm looking for someone who shares a commitment to both professional excellence and spiritual grounding."
                      ))}
                    </p>
                  </div>

                  {/* Religion Card */}
                  <div className="bg-white rounded-2xl border border-neutral-100/80 p-5 shadow-sm flex flex-col gap-3 select-none">
                    <div className="flex items-center gap-2 text-brand-pink">
                      <svg className="h-4.5 w-4.5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <h3 className="text-xs font-black uppercase tracking-wider">Religion</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      {currentUserProfile?.deenAttributes && currentUserProfile.deenAttributes.length > 0 ? (
                        currentUserProfile.deenAttributes.map((attr: string, idx: number) => (
                          <span key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black tracking-wide uppercase">
                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {attr}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black tracking-wide uppercase">
                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Practicing Muslim
                          </span>
                          <span className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black tracking-wide uppercase">
                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Prays 5 Times
                          </span>
                          <span className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black tracking-wide uppercase">
                            Halal Diet Only
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Education & Profession Card */}
                  <div className="bg-white rounded-2xl border border-neutral-100/80 p-5 shadow-sm flex flex-col gap-4.5 select-none">
                    <div className="flex gap-4 items-center">
                      <div className="w-9 h-9 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center flex-shrink-0">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Education</span>
                        <p className="text-xs font-black text-neutral-800 mt-1">{currentUserProfile?.education || "MBA, Harvard University"}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-9 h-9 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center flex-shrink-0">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Profession</span>
                        <p className="text-xs font-black text-neutral-800 mt-1">{currentUserProfile?.profession || "Product Manager"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interests Card */}
                  <div className="bg-white rounded-2xl border border-neutral-100/80 p-5 shadow-sm flex flex-col gap-3.5 select-none">
                    <div className="flex items-center gap-2 text-brand-pink">
                      <svg className="h-4.5 w-4.5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <h3 className="text-xs font-black uppercase tracking-wider">Interests</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentUserProfile?.hobbies && currentUserProfile.hobbies.length > 0 ? (
                        currentUserProfile.hobbies.map((tag: string, idx: number) => (
                          <span key={idx} className="px-3.5 py-2 bg-[#FFF5F8] border border-pink-100 text-[#be185d] rounded-xl text-[10px] font-extrabold tracking-wide uppercase">
                            {tag}
                          </span>
                        ))
                      ) : (
                        ["Travel", "Islamic History", "Fitness", "Photography", "Charity"].map((tag: any, idx: number) => (
                          <span key={idx} className="px-3.5 py-2 bg-neutral-100 text-neutral-800 rounded-xl text-[10px] font-extrabold tracking-wide">
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* PROMINENT LOGOUT BUTTON CARD */}
                  <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm flex items-center justify-between mt-2 select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                        🚪
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-neutral-800 leading-tight">Log Out of Account</h4>
                        <p className="text-[10px] font-bold text-neutral-400 mt-0.5">Safely sign out from this device</p>
                      </div>
                    </div>
                    <button
                      onClick={handleUserLogout}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>Logout</span> 🚪
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Tabs Nav Bar */}
      <footer className={`border-t px-6 py-4 flex justify-between items-center sticky bottom-0 z-20 transition-colors duration-700 ${
        isBoostActive ? "bg-[#14141d] border-purple-900/50" : "bg-white border-neutral-100"
      }`}>
        <button
          onClick={() => {
            setActiveTab("discover");
            setActiveChatId(null);
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "discover" ? "text-brand-pink" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Discover</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("matches");
            setActiveChatId(null);
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "matches" ? "text-brand-pink" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Matches</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("messages");
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "messages" ? "text-brand-pink" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Messages</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("profile");
            setActiveChatId(null);
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${
            activeTab === "profile" ? "text-brand-pink" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </footer>

      {/* MATCH OVERLAY SCREEN ("Al-Qadr Match") - Replicating Image 2 layout */}
      {showMatchOverlay && matchCandidate && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-between p-8 text-center text-white"
          style={{
            backgroundColor: "#180816",
            backgroundImage: `linear-gradient(45deg, #250920 25%, transparent 25%), 
                              linear-gradient(-45deg, #250920 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #250920 75%), 
                              linear-gradient(-45deg, transparent 75%, #250920 75%)`,
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between opacity-80 mt-2">
            <button
              onClick={() => {
                setShowMatchOverlay(false);
                nextProfile();
              }}
              className="text-white hover:text-brand-pink transition-colors text-xl font-bold p-1"
            >
              ✕
            </button>
            <span className="text-sm font-bold tracking-wider uppercase text-neutral-300">Al-Qadr Match</span>
            <button className="text-white opacity-60 text-xl font-bold p-1">⋮</button>
          </div>

          {/* Heading Content */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md">It's a Match!</h2>
            <p className="text-xs text-neutral-300 font-medium max-w-xs leading-relaxed">
              {matchCandidate.name} and you are a great match.
            </p>
          </div>

          {/* Overlapping Avatars Panel */}
          <div className="relative w-full flex justify-center items-center my-6 min-h-[160px]">
            {/* Soft decorative glow background */}
            <div className="absolute w-36 h-36 rounded-full bg-brand-pink/20 blur-xl"></div>
            
            {/* Left avatar (User) */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/95 relative shadow-2xl -mr-6 scale-95 transition-all">
              <Image src="/couple.png" fill alt="You" className="object-cover" />
            </div>

            {/* Right avatar (Matched profile) */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/95 relative shadow-2xl z-10 transition-all">
              <Image src={matchCandidate.image} fill alt={matchCandidate.name} className="object-cover" />
            </div>

            {/* Centered Heart overlap badge */}
            <div className="absolute z-20 flex items-center justify-center w-12 h-12 rounded-full bg-brand-pink text-white border-2 border-white shadow-lg animate-bounce">
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4 w-full mb-4">
            <button
              onClick={() => {
                setShowMatchOverlay(false);
                startChat(matchCandidate);
              }}
              className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-4 rounded-full font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Send Message
            </button>
            
            <button
              onClick={() => {
                setShowMatchOverlay(false);
                nextProfile();
              }}
              className="w-full border border-white/20 bg-white/5 hover:bg-white/10 text-white py-4 rounded-full font-semibold text-sm transition-all"
            >
              Keep Swiping
            </button>

            {/* Bottom Brand */}
            <div className="flex flex-col items-center gap-2 mt-4 opacity-40">
              <div className="flex gap-1.5 text-[6px]">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase">Lovelink Sanctuary</span>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED PROFILE VIEW OVERLAY */}
      {selectedProfileForDetails !== null && (
        <div className="absolute inset-0 bg-[#FCFBF9] z-40 flex flex-col justify-between h-full w-full overflow-y-auto">
          {/* Profile Header (Fixed) */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 bg-white select-none">
            <button 
              onClick={() => setSelectedProfileForDetails(null)} 
              className="p-1.5 text-neutral-500 hover:text-brand-pink transition-colors"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-black text-sm tracking-widest text-brand-pink uppercase">LoveLink</span>
            <button type="button" className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M5 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          {/* Main Details Body */}
          <div className="flex-grow flex flex-col pb-24">
            {/* Huge Cover Image */}
            <div className="w-full aspect-[3/4] relative bg-neutral-200">
              <Image 
                src={selectedProfileForDetails.image} 
                fill 
                alt={selectedProfileForDetails.name} 
                className={`object-cover ${
                  !currentUserProfile?.isPremium && appSettings.requireSubscriptionToViewPhotos !== false
                    ? "filter blur-xl scale-105"
                    : ""
                }`} 
                sizes="400px" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              {/* Overlay details */}
              <div className="absolute bottom-6 left-6 right-6 text-white select-none">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">{selectedProfileForDetails.name}, {selectedProfileForDetails.age}</h2>
                  <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-bold tracking-wide uppercase shadow-sm border border-emerald-400/30 flex-shrink-0">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-neutral-200 mt-1">
                  <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <circle cx="12" cy="11" r="3" />
                  </svg>
                  <span>{selectedProfileForDetails.city}, {selectedProfileForDetails.country}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 flex flex-col gap-6">
              {/* Likes Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-100 p-3.5 flex items-center gap-3 shadow-sm select-none">
                  <div className="w-9 h-9 rounded-full bg-[#FFF5F8] text-brand-pink flex items-center justify-center flex-shrink-0">
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-black text-neutral-800 leading-tight">{selectedProfileForDetails.likesCount}</div>
                    <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">Likes</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-neutral-100 p-3.5 flex items-center gap-3 shadow-sm select-none">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-black text-neutral-800 leading-tight">{selectedProfileForDetails.superLikesCount}</div>
                    <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">Super Likes</div>
                  </div>
                </div>
              </div>

              {/* Profession & Education Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm select-none">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Profession</span>
                  <div className="w-7 h-7 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center mb-2.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-extrabold text-neutral-700 leading-snug">{selectedProfileForDetails.occupation}</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm select-none">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Education</span>
                  <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <p className="text-xs font-extrabold text-neutral-700 leading-snug">{selectedProfileForDetails.education}</p>
                </div>
              </div>

              {/* About Me Section */}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-black text-brand-pink tracking-tight">About Me</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                  {selectedProfileForDetails.detailedBio}
                </p>
              </div>

              {/* Religion & Values Section */}
              <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm relative flex flex-col gap-3 select-none">
                <span className="absolute top-4 right-4 text-xl text-neutral-300">🕌</span>
                <h3 className="text-sm font-black text-brand-pink tracking-tight">Religion & Values</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedProfileForDetails.attributes.map((attr: any, idx: number) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F8] border border-pink-100 text-[#be185d] rounded-full text-[9px] font-black tracking-wide uppercase">
                      {idx === 0 ? "★" : "●"} {attr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-black text-brand-pink tracking-tight">Interests</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProfileForDetails.interests.map((interest: any, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-100/50 shadow-sm group">
                      <Image src={interest.image} fill alt={interest.label} className="object-cover group-hover:scale-105 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <span className="absolute bottom-2.5 left-2.5 text-[9px] font-bold text-white tracking-wide">{interest.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons or Chat Button (Fixed at bottom) */}
          <div className="sticky bottom-4 left-6 right-6 flex items-center justify-between gap-4 z-50 select-none px-4 bg-transparent pb-4">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProfileForDetails(null)}
              className="w-12 h-12 rounded-full bg-white border border-neutral-100 text-neutral-400 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl flex-shrink-0"
            >
              ✕
            </button>

            {/* Start Chat primary action */}
            <button 
              onClick={() => {
                setSelectedProfileForDetails(null);
                startChat(selectedProfileForDetails);
              }}
              className="flex-grow bg-brand-pink hover:bg-brand-pink-hover text-white py-3 px-5 rounded-full font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with {selectedProfileForDetails.name}
            </button>

            {/* Super Like Button */}
            <button 
              onClick={() => {
                setSelectedProfileForDetails(null);
                handleLike();
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-lg flex-shrink-0"
              title="Super Like"
            >
              ★
            </button>

            {/* Report & Block Button */}
            <button 
              onClick={() => {
                setReportCandidate(selectedProfileForDetails);
                setSelectedProfileForDetails(null);
                setShowReportModal(true);
              }}
              className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shadow-sm flex items-center justify-center hover:bg-rose-100 transition-all text-sm flex-shrink-0"
              title="Report or Block Profile"
            >
              🚩
            </button>
          </div>
        </div>
      )}
      {/* Call Overlay (WhatsApp style UI) */}
      {callState !== "idle" && (
        <div className="absolute inset-0 bg-[#121212]/95 backdrop-blur-md z-[200] flex flex-col justify-between p-8 text-white select-none">
          {/* Header info */}
          <div className="text-center mt-12 flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest font-black text-brand-pink mb-2">
              LoveLink {callType === "video" ? "Video Call" : "Voice Call"}
            </span>
            <h2 className="text-2xl font-black text-white">{callPeerName}</h2>
            <p className="text-xs font-bold text-neutral-400 mt-2 animate-pulse">
              {callState === "calling" && "Calling..."}
              {callState === "ringing" && "Ringing..."}
              {callState === "incoming" && "Incoming call..."}
              {callState === "connected" && "Connected"}
            </p>
          </div>

          {/* Central display (Avatars / Video feeds) */}
          <div className="flex-grow flex items-center justify-center relative w-full my-6">
            {callType === "video" && callState === "connected" ? (
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute top-4 right-4 w-24 h-32 rounded-2xl object-cover border-2 border-white/20 shadow-md z-10"
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-36 h-36 rounded-full bg-brand-pink/20 ${callState !== "connected" ? "animate-ping" : ""}`}></div>
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-brand-pink relative shadow-xl">
                  <Image src={callPeerAvatar || "/couple.png"} fill alt="Avatar" className="object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Call Control Actions */}
          <div className="flex justify-center items-center gap-8 mb-12">
            {callState === "incoming" ? (
              <>
                <button
                  type="button"
                  onClick={acceptCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <svg className="h-6 w-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1.024 1.024 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 3.91c0-.55-.45-1-1-1H3.99c-.56 0-1 .45-1 1C2.99 15.89 10.1 23 19 23c.55 0 1-.45 1-1v-5.62c0-.56-.45-1-1-1z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={rejectCall}
                  className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <svg className="h-6 w-6 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 9c-2.2 0-4.3.3-6.2.9c-.24.08-.47.24-.62.46l-2.7 2.7c-.24.24-.28.63-.12.94c1.1 2.2 2.7 4.1 4.7 5.5c.28.2.63.2.94-.04l2.7-2.7c.28-.28.36-.67.24-1c-.5-.9-.8-2-1-3.2v-.22h7v.22c-.2 1.2-.5 2.3-1 3.2c-.12.33-.04.72.24 1l2.7 2.7c.3.24.65.24.94.04c2-1.4 3.6-3.3 4.7-5.5c.16-.3.12-.7-.12-.94l-2.7-2.7c-.15-.22-.38-.38-.62-.46C16.3 9.3 14.2 9 12 9zm0 0l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 3.91c0-.55-.45-1-1-1H3.99c-.56 0-1 .45-1 1C2.99 15.89 10.1 23 19 23c.55 0 1-.45 1-1v-5.62c0-.56-.45-1-1-1z" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={hangupCall}
                className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <svg className="h-6 w-6 text-white fill-current transform rotate-[135deg]" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1.024 1.024 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 3.91c0-.55-.45-1-1-1H3.99c-.56 0-1 .45-1 1C2.99 15.89 10.1 23 19 23c.55 0 1-.45 1-1v-5.62c0-.56-.45-1-1-1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Super Like Golden Star Burst Stamp Overlay */}
      {superLikeEffectActive && (
        <div className="fixed inset-0 bg-amber-500/20 backdrop-blur-xs z-[290] flex items-center justify-center pointer-events-none select-none">
          <div className="flex flex-col items-center justify-center animate-starBurst">
            <span className="text-7xl filter drop-shadow-lg">⭐</span>
            <div className="border-4 border-amber-400 text-amber-300 bg-neutral-950/90 font-black text-2xl px-6 py-2 rounded-2xl tracking-widest uppercase shadow-2xl mt-4 animate-stampZoom">
              SUPER LIKED! ⭐
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer Modal */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[270] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative border border-neutral-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <h3 className="text-lg font-black text-neutral-900">Notifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationsDrawer(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="text-3xl">⭐</div>
                  <p className="text-xs font-bold text-neutral-500">No Super Likes or notifications yet.</p>
                  <p className="text-[10px] text-neutral-400">Keep swiping! Super Likes received from other users will appear here.</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                        <Image src={notif.senderImage || "/couple.png"} fill alt="Sender avatar" className="object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900">{notif.senderName}</div>
                        <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <span>⭐</span> {notif.message}
                        </div>
                        <div className="text-[9px] text-neutral-400 font-semibold mt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        startChat({
                          id: notif.senderEmail,
                          name: notif.senderName,
                          image: notif.senderImage || "/couple.png"
                        });
                        setShowNotificationsDrawer(false);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-black uppercase rounded-xl shadow-xs shrink-0"
                    >
                      Match Back
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Love Heart Burst Effect */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            left: `${heart.left}%`,
            animation: "floatHeartUp 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards"
          }}
          className="fixed bottom-32 text-4xl pointer-events-none z-[210] select-none filter drop-shadow-md"
        >
          {heart.icon}
        </div>
      ))}

      {/* VIP Premium Subscription Modal */}
      {showVipSubscriptionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[260] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative border border-amber-500/30 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowVipSubscriptionModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center hover:bg-neutral-700"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
              👑
            </div>

            <div className="text-center">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Official Platform Plan
              </span>
              <h3 className="text-xl font-black text-white mt-2">{appSettings.subscriptionName || "Matrimony VIP Premium"}</h3>
              <div className="text-2xl font-black text-amber-400 mt-1">
                ${appSettings.subscriptionPrice || 19.99} <span className="text-xs text-neutral-400 font-normal">/ month</span>
              </div>
            </div>

            <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Included Premium Benefits:</div>
              {(appSettings.subscriptionFeatures || [
                "Unblur crystal-clear profile photos of all potential matches",
                "Unlimited direct messages with matches",
                "Unlimited Super Likes & Matrimony Algorithm priority ranking",
                "View who liked your profile & VIP badge"
              ]).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200 font-medium">
                  <span className="text-amber-400 font-extrabold">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowVipSubscriptionModal(false);
                setSelectedStripePackage({
                  pkg: {
                    id: "sub_vip_plan",
                    name: appSettings.subscriptionName || "Matrimony VIP Premium",
                    price: appSettings.subscriptionPrice || 19.99
                  },
                  type: "subscription"
                });
              }}
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>💳 Subscribe with Stripe (${appSettings.subscriptionPrice || 19.99}/mo)</span>
            </button>

            <div className="text-[10px] text-neutral-500 font-semibold text-center border-t border-neutral-800 pt-2">
              🔒 Cancel anytime in settings • Stripe Secured
            </div>
          </div>
        </div>
      )}

      {/* In-App Delayed Match Toast Notification */}
      {matchNotification && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto bg-neutral-900/95 backdrop-blur-md border border-brand-pink/60 text-white rounded-2xl p-3.5 shadow-2xl z-[280] flex items-center justify-between animate-bounce select-none">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-brand-pink shrink-0 shadow-md">
              <Image src={matchNotification.profile.image || "/couple.png"} fill alt="Match avatar" className="object-cover" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-brand-pink tracking-widest flex items-center gap-1">
                <span>💖</span> Al-Qadr Match Found!
              </div>
              <div className="text-xs font-extrabold text-white">
                {matchNotification.profile.name} matched with you!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                startChat(matchNotification.profile);
                setMatchNotification(null);
              }}
              className="px-3.5 py-1.5 bg-brand-pink hover:bg-brand-pink-hover text-white text-[11px] font-extrabold rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Chat Now
            </button>
            <button
              type="button"
              onClick={() => setMatchNotification(null)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search & Matching Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[270] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative border border-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <h3 className="text-lg font-black text-neutral-900">Discovery Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-neutral-800 mb-1 flex justify-between">
                  <span>Age Range Filter</span>
                  <span className="text-brand-pink font-mono">{filterAgeMin} - {filterAgeMax} yrs</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={filterAgeMin}
                    onChange={(e) => setFilterAgeMin(Number(e.target.value))}
                    className="w-full accent-brand-pink"
                  />
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={filterAgeMax}
                    onChange={(e) => setFilterAgeMax(Number(e.target.value))}
                    className="w-full accent-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-800 mb-1 flex justify-between">
                  <span>Minimum Matrimony Match Score</span>
                  <span className="text-brand-teal font-mono">{filterMinMatch}%+</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={filterMinMatch}
                  onChange={(e) => setFilterMinMatch(Number(e.target.value))}
                  className="w-full accent-brand-teal"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFilterAgeMin(18);
                  setFilterAgeMax(50);
                  setFilterMinMatch(0);
                  setShowFiltersModal(false);
                }}
                className="w-1/2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-xs rounded-xl transition-all"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="w-1/2 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report & Block User Modal */}
      {showReportModal && reportCandidate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative border border-neutral-100 text-center">
            <button
              type="button"
              onClick={() => {
                setShowReportModal(false);
                setReportCandidate(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              🚩
            </div>

            <div>
              <h3 className="text-lg font-black text-neutral-900">Report & Block {reportCandidate.name}?</h3>
              <p className="text-xs text-neutral-500 font-medium mt-1">This user will be blocked and hidden from your feed.</p>
            </div>

            <div className="space-y-2 text-left pt-1">
              {["Fake Profile / Impersonation", "Inappropriate Messages", "Spam / Commercial Solicitation", "Other"].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProfiles((prev) => prev.filter((p) => p.id !== reportCandidate.id));
                    setMatchedProfiles((prev) => prev.filter((p) => p.id !== reportCandidate.id));
                    setShowReportModal(false);
                    setReportCandidate(null);
                    showToast(`Blocked & reported ${reportCandidate.name} 🚩`, "error");
                  }}
                  className="w-full p-3 bg-neutral-50 hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 rounded-xl text-xs font-bold text-neutral-800 text-left transition-all flex items-center justify-between"
                >
                  <span>{reason}</span>
                  <span className="text-neutral-400">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner (React Toast Style) */}
      {toastMessage && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl z-[350] flex items-center gap-2.5 border select-none animate-bounce transition-all ${
          toastMessage.type === "error"
            ? "bg-rose-950 border-rose-500/50 text-rose-100 shadow-rose-950/50"
            : "bg-neutral-900 border-amber-500/50 text-white shadow-amber-950/50"
        }`}>
          <span className="text-sm">{toastMessage.type === "error" ? "❌" : "✅"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Daily Swipe Limit Modal */}
      {showSwipeLimitModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[260] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-neutral-100">
            <button
              type="button"
              onClick={() => setShowSwipeLimitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl animate-pulse">
              ⏳
            </div>

            <h3 className="text-xl font-black text-neutral-900">Daily Free Swipe Limit Reached</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              You've used all {appSettings.dailyFreeSwipes || 10} of your daily free swipes. Purchase extra swipes / Super Likes or upgrade to VIP Premium for unlimited swiping!
            </p>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSwipeLimitModal(false);
                  setShowSuperLikesModal(true);
                }}
                className="w-full py-3.5 px-4 bg-brand-pink text-white font-black rounded-2xl shadow-lg hover:shadow-brand-pink/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>⭐</span>
                <span>Purchase Swipes / Super Likes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSwipeLimitModal(false);
                  setShowVipSubscriptionModal(true);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black rounded-2xl shadow-md hover:from-amber-400 hover:to-amber-500 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>👑</span>
                <span>Upgrade to VIP Unlimited</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSwipeLimitModal(false)}
                className="w-full py-2 text-xs font-bold text-neutral-400 hover:text-neutral-600"
              >
                Wait until daily reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Likes Purchase Modal (Stripe Powered) */}
      {showSuperLikesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setShowSuperLikesModal(false);
                setSelectedStripePackage(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
              ⭐
            </div>

            <div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Stripe Test Checkout
              </span>
              <h3 className="text-xl font-black text-neutral-900 mt-2">Get Super Likes</h3>
              <p className="text-xs text-neutral-500 font-medium">Stand out and instantly notify potential matches!</p>
            </div>

            <div className="space-y-3 pt-1">
              {(appSettings.superLikePackages || []).map((pkg: any) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl border border-neutral-200 hover:border-amber-500 bg-neutral-50/50 hover:bg-amber-50/30 flex items-center justify-between transition-all"
                >
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-neutral-900">{pkg.name}</div>
                    <div className="text-[11px] font-bold text-amber-600">⭐ {pkg.superLikesCount} Super Likes</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSuperLikesModal(false);
                      setShowMessageCreditsModal(false);
                      setSelectedStripePackage({ pkg, type: "superlikes" });
                    }}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    ${pkg.price} USD
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-neutral-400 font-medium pt-2 border-t border-neutral-100 flex items-center justify-center gap-1">
              <span>🔒 Powered by Stripe Payments (Admin Test Account)</span>
            </div>
          </div>
        </div>
      )}

      {/* Message Credits Purchase Modal (Stripe Powered) */}
      {showMessageCreditsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setShowMessageCreditsModal(false);
                setSelectedStripePackage(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              💬
            </div>

            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Stripe Test Checkout
              </span>
              <h3 className="text-xl font-black text-neutral-900 mt-2">Get Message Credits</h3>
              <p className="text-xs text-neutral-500 font-medium">Continue messaging your matches without interruption.</p>
            </div>

            <div className="space-y-3 pt-1">
              {(appSettings.messageCreditPackages || []).map((pkg: any) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 hover:bg-emerald-50/30 flex items-center justify-between transition-all"
                >
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-neutral-900">{pkg.name}</div>
                    <div className="text-[11px] font-bold text-emerald-600">💬 {pkg.creditsCount} Messages</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSuperLikesModal(false);
                      setShowMessageCreditsModal(false);
                      setSelectedStripePackage({ pkg, type: "messages" });
                    }}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-emerald-500 hover:text-neutral-950 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    ${pkg.price} USD
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-neutral-400 font-medium pt-2 border-t border-neutral-100 flex items-center justify-center gap-1">
              <span>🔒 Powered by Stripe Payments (Admin Test Account)</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile Boost Purchase Modal (Stripe Powered) */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[260] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-gradient-to-br from-neutral-900 via-purple-950 to-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative border border-purple-500/40 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowBoostModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center hover:bg-neutral-700"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/40 flex items-center justify-center mx-auto text-3xl shadow-xl animate-bounce">
              ⚡
            </div>

            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                Spotlight Profile Boost
              </span>
              <h3 className="text-xl font-black text-white mt-2">Boost Your Profile</h3>
              <p className="text-xs text-neutral-300 font-medium mt-1">
                Get up to 10x more matches! Your profile will be highlighted with a glowing aura & badge and placed FIRST in everyone's discover feed.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {(appSettings.boostPackages || [
                { id: "boost_1day", name: "1 Day Spotlight Boost", price: 2.99, durationDays: 1 },
                { id: "boost_7days", name: "7 Days Super Boost", price: 7.99, durationDays: 7 },
                { id: "boost_30days", name: "1 Month VIP Mega Boost", price: 19.99, durationDays: 30 }
              ]).map((pkg: any) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400 bg-neutral-900/80 hover:bg-purple-900/40 flex items-center justify-between transition-all"
                >
                  <div className="text-left">
                    <div className="text-xs font-black text-white">{pkg.name}</div>
                    <div className="text-[10px] font-bold text-purple-400 flex items-center gap-1 mt-0.5">
                      <span>⚡</span> {pkg.durationDays} {pkg.durationDays === 1 ? "Day" : "Days"} Top Priority
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBoostModal(false);
                      setSelectedStripePackage({ pkg, type: "boost" });
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1 active:scale-95"
                  >
                    ${pkg.price} USD
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-neutral-400 font-medium pt-2 border-t border-neutral-800 flex items-center justify-center gap-1">
              <span>🔒 256-Bit SSL Encrypted • Stripe Payment Gateway</span>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL (Section-by-Section & React Toast Enabled) */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 md:p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="text-lg font-black text-neutral-900">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 font-bold flex items-center justify-center hover:bg-neutral-200 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-left">
              {/* SECTION 1: PHOTOS GALLERY & ADD PHOTO */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📷 Profile Photos & Gallery</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-bold">({editImages.length} Photos)</span>
                </div>

                {/* Existing Photos Grid */}
                {editImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    {editImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 shadow-sm group">
                        <Image src={imgUrl} fill alt={`Photo ${idx + 1}`} className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md hover:bg-rose-700 transition-all"
                          title="Remove Photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Photo Inputs */}
                <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                  <label className="block text-[11px] font-bold text-neutral-700">Add New Photo</label>
                  
                  {/* File Selector */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={editPhotoInputRef}
                      accept="image/*"
                      onChange={(e) => setEditNewPhotoFile(e.target.files?.[0] || null)}
                      className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-pink/10 file:text-brand-pink hover:file:bg-brand-pink/20"
                    />
                    {editNewPhotoFile && (
                      <button
                        type="button"
                        onClick={handleAddPhotoFile}
                        disabled={savingSection === "photo-upload"}
                        className="px-3 py-1.5 bg-brand-pink text-white text-xs font-bold rounded-xl shadow-xs shrink-0 hover:bg-brand-pink-hover"
                      >
                        {savingSection === "photo-upload" ? "Uploading..." : "Upload File ⬆️"}
                      </button>
                    )}
                  </div>

                  {/* Photo URL Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={editNewPhotoUrl}
                      onChange={(e) => setEditNewPhotoUrl(e.target.value)}
                      placeholder="https://... photo link"
                      className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      disabled={!editNewPhotoUrl.trim()}
                      className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 disabled:opacity-50 hover:bg-neutral-800"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BASIC INFO (Name, Age, Phone) */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    👤 Personal Information
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Personal Info", { name: editName, age: Number(editAge), phone: editPhone })}
                    disabled={savingSection === "Personal Info"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Personal Info" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone Number 📞</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: LOCATION (City & Country) */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    📍 Location Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Location", { city: editCity, country: editCountry })}
                    disabled={savingSection === "Location"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Location" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CAREER & EDUCATION */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    🎓 Career & Education
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Career", { profession: editProfession, education: editEducation })}
                    disabled={savingSection === "Career"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Career" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Profession</label>
                    <input
                      type="text"
                      value={editProfession}
                      onChange={(e) => setEditProfession(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Education</label>
                    <input
                      type="text"
                      value={editEducation}
                      onChange={(e) => setEditEducation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: BIO / ABOUT ME */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    📝 About Me / Bio
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Bio", { bio: editBio })}
                    disabled={savingSection === "Bio"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Bio" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell candidates about yourself..."
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 6: RELIGIOUS VALUES (DEEN ATTRIBUTES) */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    🕌 Religious Practice & Deen
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Religious Practice", { deenAttributes: editDeenAttributes })}
                    disabled={savingSection === "Religious Practice"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Religious Practice" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={editDeenAttributes}
                    onChange={(e) => setEditDeenAttributes(e.target.value)}
                    placeholder="PRACTICING MUSLIM, Prays 5 Times, Halal Diet, Quran"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">Separate attributes with commas</span>
                </div>
              </div>

              {/* SECTION 7: HOBBIES & INTERESTS */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    🎨 Hobbies & Interests
                  </h4>
                  <button
                    type="button"
                    onClick={() => saveSection("Hobbies", { hobbies: editHobbies })}
                    disabled={savingSection === "Hobbies"}
                    className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full hover:bg-brand-pink/20 transition-all border border-brand-pink/20"
                  >
                    {savingSection === "Hobbies" ? "Saving..." : "Save Section 💾"}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={editHobbies}
                    onChange={(e) => setEditHobbies(e.target.value)}
                    placeholder="Coffee, Reading, Travel, Coding, Charity"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:border-brand-pink focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 font-bold block mt-1">Separate hobbies with commas</span>
                </div>
              </div>

              {/* SAVE ALL FOOTER */}
              <div className="pt-2 flex items-center gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-1/3 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-xs rounded-xl transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await saveSection("Full Profile", {
                      name: editName,
                      age: Number(editAge),
                      phone: editPhone,
                      city: editCity,
                      country: editCountry,
                      profession: editProfession,
                      education: editEducation,
                      bio: editBio,
                      deenAttributes: editDeenAttributes,
                      hobbies: editHobbies,
                      images: editImages
                    });
                    setShowEditProfileModal(false);
                  }}
                  disabled={savingSection !== null}
                  className="w-2/3 py-3 bg-brand-pink hover:bg-brand-pink-hover text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {savingSection !== null ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    "Save All Changes 💾"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE INTERACTIVE CARD PAYMENT GATEWAY MODAL */}
      {selectedStripePackage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[300] flex items-center justify-center p-6 select-none animate-fadeIn">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative border border-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black text-lg">stripe</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Test Gateway
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStripePackage(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Selected Package Details */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Order Summary</div>
                <div className="text-sm font-black text-white mt-0.5">{selectedStripePackage.pkg.name}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">${selectedStripePackage.pkg.price} USD</div>
                <div className="text-[10px] text-neutral-500 font-semibold">One-time payment</div>
              </div>
            </div>

            {/* Test Card Form */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>💳 Card Information</span>
                <span className="text-[10px] text-amber-400 font-normal">(Stripe Test Card)</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-black text-amber-400 uppercase">
                    VISA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Expires (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">CVC Code</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Pay Button */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={async () => {
                await handlePurchasePackage(selectedStripePackage.pkg, selectedStripePackage.type);
                setSelectedStripePackage(null);
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin"></div>
                  <span>Authorizing with Stripe API...</span>
                </>
              ) : (
                `Pay $${selectedStripePackage.pkg.price} USD with Stripe →`
              )}
            </button>

            <div className="text-[10px] text-neutral-500 font-semibold text-center border-t border-neutral-800 pt-2 flex items-center justify-center gap-1">
              <span>🔒 256-Bit SSL Encrypted • Stripe Payment Gateway</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
