"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EDUCATION_LEVELS, LOCATIONS } from "@/lib/constants";
import { validateLoginForm, loginUser } from "@/lib/utils";
import { FormErrors } from "@/lib/types";
import { ThankYouGlobe } from "./ThankYouGlobe";

type UserType = "student" | "professional";
type ScanStep = "idle" | "options" | "scanning" | "confirm-front" | "confirm-back" | "complete";

interface LoginFormProps {
  onStartSimulation?: () => void;
}

export function LoginForm({ onStartSimulation }: LoginFormProps) {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    educationLevel: "",
    companyName: "",
    companyId: "",
    companyLocation: "",
  });
  const [businessCardFront, setBusinessCardFront] = useState<string | null>(null);
  const [businessCardBack, setBusinessCardBack] = useState<string | null>(null);
  const [useBusinessCard, setUseBusinessCard] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>("idle");
  const [isScanning, setIsScanning] = useState(false);
  const [showThankYouGlobe, setShowThankYouGlobe] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show scanning animation
      setIsScanning(true);
      setScanStep("scanning");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        
        // Simulate scanning delay for futuristic effect
        setTimeout(() => {
          if (side === "front") {
            setBusinessCardFront(base64);
            setIsScanning(false);
            setScanStep("confirm-front");
          } else {
            setBusinessCardBack(base64);
            setIsScanning(false);
            setScanStep("confirm-back");
          }
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleConfirmFront = () => {
    setScanStep("options"); // Go back to options for back scan
  };

  const handleConfirmBack = () => {
    setScanStep("complete");
  };

  const handleRetakeFront = () => {
    setBusinessCardFront(null);
    setScanStep("options");
  };

  const handleRetakeBack = () => {
    setBusinessCardBack(null);
    setScanStep("options");
  };

  const triggerCamera = (side: "front" | "back") => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute("data-side", side);
      setScanStep("idle"); // Close dropdown before opening camera
      cameraInputRef.current.click();
    }
  };

  const triggerGallery = (side: "front" | "back") => {
    if (galleryInputRef.current) {
      galleryInputRef.current.setAttribute("data-side", side);
      setScanStep("idle"); // Close dropdown before opening gallery
      galleryInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData, userType, useBusinessCard);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await loginUser({ 
        ...formData, 
        userType,
        businessCardFront: useBusinessCard ? businessCardFront : undefined,
        businessCardBack: useBusinessCard ? businessCardBack : undefined,
      });
      
      // For students: redirect based on education level
      // For professionals without business card scan: show globe
      if (userType === "student") {
        // Start cinematic fade to black then redirect
        setIsFadingOut(true);
        setTimeout(() => {
          // Use replace to prevent back navigation to login
          // If education level is "Others", redirect to industry quiz instructions
          if (formData.educationLevel === "Others") {
            router.replace("/industry-quiz-instructions");
          } else {
            router.replace("/sector-wheel");
          }
        }, 1200);
      } else {
        // Professional - show thank you globe
        setShowThankYouGlobe(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      setErrors({ name: errorMessage });
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setErrors({});
    setUseBusinessCard(false);
    setScanStep("idle");
    setBusinessCardFront(null);
    setBusinessCardBack(null);
  };

  const handleBusinessCardContinue = async () => {
    if (!formData.companyLocation.trim()) return;
    if (!formData.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await loginUser({ 
        ...formData, 
        userType,
        businessCardFront: businessCardFront || undefined,
        businessCardBack: businessCardBack || undefined,
      });
      
      // Show the thank you globe after successful login
      setShowThankYouGlobe(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setErrors({ businessCard: errorMessage });
      setIsLoading(false);
    }
  };

  // Show the thank you globe screen - stays on this screen permanently
  if (showThankYouGlobe) {
    return (
      <ThankYouGlobe
        userName={formData.name}
        companyName={formData.companyName}
        companyLocation={formData.companyLocation} onContinue={function (): void {
          throw new Error("Function not implemented.");
        } }      />
    );
  }

  return (
    <>
      {/* Cinematic fade to black overlay */}
      <AnimatePresence>
        {isFadingOut && (
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: "#2E3093" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Glassmorphic Card */}
      <motion.div 
        className="w-full max-w-[340px] mx-auto px-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className="rounded-2xl p-5 md:p-8 relative overflow-hidden"
          style={{
            background: "rgb(255, 255, 255)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(42, 107, 181, 0.3)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Content */}
          <div className="relative z-10">
            {/* White Logo Container */}
            <motion.div 
              className="mb-4 p-2 rounded-xl flex justify-center items-center gap-3"
              style={{
                background: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Image
                src="/ats.png"
                alt="Accent Techno Solutions"
                width={60}
                height={35}
                className="object-contain"
              />
              <div 
                className="w-px h-5" 
                style={{ background: "linear-gradient(180deg, transparent, rgba(46, 48, 147, 0.3), transparent)" }} 
              />
              <Image
                src="/sit.png"
                alt="Suvidya Institute of Technology"
                width={60}
                height={35}
                className="object-contain"
              />
            </motion.div>

            {/* User Type Toggle - Compact */}
            <motion.div
              className="mb-3 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.span 
                className="text-[11px] font-medium"
                animate={{ 
                  color: userType === "student" ? "#2E3093" : "rgba(46, 48, 147, 0.4)",
                }}
                transition={{ duration: 0.2 }}
              >
                Student
              </motion.span>
              
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleUserTypeChange(userType === "student" ? "professional" : "student")}
                className="relative w-10 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none"
                style={{
                  background: userType === "professional" 
                    ? "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)"
                    : "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(46, 48, 147, 0.25)",
                }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full bg-white flex items-center justify-center"
                  animate={{ 
                    x: userType === "student" ? 0 : 18,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: userType === "student" ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {userType === "student" ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2E3093" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2E3093" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    )}
                  </motion.div>
                </motion.div>
              </button>
              
              <motion.span 
                className="text-[11px] font-medium"
                animate={{ 
                  color: userType === "professional" ? "#2E3093" : "rgba(46, 48, 147, 0.4)",
                }}
                transition={{ duration: 0.2 }}
              >
                Professional
              </motion.span>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label
                  htmlFor="name"
                  className="block text-xs font-medium mb-1"
                  style={{ color: "#2E3093" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-300 focus:outline-none"
                  style={{
                    background: "#FFFFFF",
                    border: errors.name 
                      ? "2px solid #FAE452" 
                      : "2px solid rgba(46, 48, 147, 0.3)",
                    color: "#2E3093",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2E3093";
                    e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                  }}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                    {errors.name}
                  </p>
                )}
              </motion.div>

              {/* Student Fields */}
              {userType === "student" && (
                <>
                  {/* Email Field */}
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#2E3093" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-300 focus:outline-none"
                      style={{
                        background: "#FFFFFF",
                        border: errors.email 
                          ? "2px solid #FAE452" 
                          : "2px solid rgba(46, 48, 147, 0.3)",
                        color: "#2E3093",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#2E3093";
                        e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.email ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                      }}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                        {errors.email}
                      </p>
                    )}
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#2E3093" }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-300 focus:outline-none"
                      style={{
                        background: "#FFFFFF",
                        border: errors.phone 
                          ? "2px solid #FAE452" 
                          : "2px solid rgba(46, 48, 147, 0.3)",
                        color: "#2E3093",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#2E3093";
                        e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.phone ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                      }}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                        {errors.phone}
                      </p>
                    )}
                  </motion.div>

                  {/* Education Level Field */}
                  <motion.div
                    key="educationLevel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label
                      htmlFor="educationLevel"
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#2E3093" }}
                    >
                      Education Level
                    </label>
                    <div className="relative">
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-300 focus:outline-none"
                        style={{
                          background: "#FFFFFF",
                          border: errors.educationLevel 
                            ? "2px solid #FAE452" 
                            : "2px solid rgba(46, 48, 147, 0.3)",
                          color: formData.educationLevel ? "#2E3093" : "rgba(46, 48, 147, 0.5)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#2E3093";
                          e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.educationLevel ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                          e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                        }}
                      >
                        <option value="" style={{ background: "#FFFFFF", color: "rgba(46, 48, 147, 0.5)" }}>
                          Select education level
                        </option>
                        {EDUCATION_LEVELS.map((option) => (
                          <option 
                            key={option} 
                            value={option} 
                            style={{ background: "#FFFFFF", color: "#2E3093" }}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* Chevron */}
                      <div 
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#2E3093" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {errors.educationLevel && (
                      <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                        {errors.educationLevel}
                      </p>
                    )}
                  </motion.div>
                </>
              )}

              {/* Industry Professional Fields */}
              {userType === "professional" && (
                <>
                  {/* Business Card Toggle */}
                  <motion.div
                    key="businessCardToggle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                  >
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: "linear-gradient(135deg, rgba(46, 48, 147, 0.05) 0%, rgba(42, 107, 181, 0.05) 100%)",
                        border: "1px dashed rgba(46, 48, 147, 0.3)",
                      }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={useBusinessCard}
                            onChange={(e) => setUseBusinessCard(e.target.checked)}
                            className="sr-only"
                          />
                          <motion.div
                            className="w-10 h-6 rounded-full p-1"
                            style={{
                              background: useBusinessCard 
                                ? "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)"
                                : "rgba(46, 48, 147, 0.2)",
                            }}
                            animate={{ background: useBusinessCard 
                              ? "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)"
                              : "rgba(46, 48, 147, 0.2)" 
                            }}
                          >
                            <motion.div
                              className="w-4 h-4 rounded-full bg-white shadow-md"
                              animate={{ x: useBusinessCard ? 16 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.div>
                        </div>
                        <div>
                          <span className="text-xs font-medium" style={{ color: "#2E3093" }}>
                            I have a business card
                          </span>
                          <p className="text-[10px] mt-0.5" style={{ color: "rgba(46, 48, 147, 0.6)" }}>
                            Upload front & back
                          </p>
                        </div>
                      </label>
                    </div>
                  </motion.div>

                  {/* Business Card Upload Area */}
                  <AnimatePresence>
                    {useBusinessCard && (
                      <motion.div
                        key="businessCardUpload"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "visible" }}
                      >
                        <div className="pt-1 relative" style={{ zIndex: 50, overflow: "visible" }}>
                          {/* Hidden Inputs */}
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const side = e.target.getAttribute("data-side") as "front" | "back" || "front";
                              handleImageUpload(e, side);
                            }}
                            className="hidden"
                            data-side="front"
                          />
                          <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const side = e.target.getAttribute("data-side") as "front" | "back" || "front";
                              handleImageUpload(e, side);
                            }}
                            className="hidden"
                            data-side="front"
                          />
                          
                          {/* Scanning Animation Overlay */}
                          <AnimatePresence>
                            {isScanning && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 flex items-center justify-center"
                                style={{ 
                                  background: "rgba(0, 0, 0, 0.85)",
                                  zIndex: 100,
                                  backdropFilter: "blur(8px)",
                                }}
                              >
                                <div className="text-center">
                                  {/* Futuristic Scanner */}
                                  <motion.div
                                    className="relative w-64 h-40 mx-auto mb-6 rounded-xl overflow-hidden"
                                    style={{
                                      background: "linear-gradient(135deg, rgba(46, 48, 147, 0.3) 0%, rgba(42, 107, 181, 0.3) 100%)",
                                      border: "2px solid rgba(46, 48, 147, 0.5)",
                                    }}
                                  >
                                    {/* Corner Markers */}
                                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: "#00D4FF" }} />
                                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2" style={{ borderColor: "#00D4FF" }} />
                                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2" style={{ borderColor: "#00D4FF" }} />
                                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: "#00D4FF" }} />
                                    
                                    {/* Scanning Line */}
                                    <motion.div
                                      className="absolute left-0 right-0 h-1"
                                      style={{
                                        background: "linear-gradient(90deg, transparent 0%, #00D4FF 20%, #2E3093 50%, #00D4FF 80%, transparent 100%)",
                                        boxShadow: "0 0 20px #00D4FF, 0 0 40px rgba(0, 212, 255, 0.5)",
                                      }}
                                      animate={{ top: ["0%", "100%", "0%"] }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                    />
                                    
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0" style={{ 
                                      backgroundImage: `
                                        linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
                                      `,
                                      backgroundSize: "20px 20px",
                                    }} />
                                    
                                    {/* Pulse Effect */}
                                    <motion.div
                                      className="absolute inset-0"
                                      style={{
                                        background: "radial-gradient(circle at center, rgba(0, 212, 255, 0.2) 0%, transparent 70%)",
                                      }}
                                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                  </motion.div>
                                  
                                  <motion.p
                                    className="text-lg font-medium"
                                    style={{ color: "#00D4FF" }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    Scanning...
                                  </motion.p>
                                  <p className="text-sm mt-2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                                    Processing your business card
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {/* Main Scan Interface */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="relative"
                            style={{ zIndex: 50, overflow: "visible" }}
                          >
                            {/* Initial State - Scan Box */}
                            {(scanStep === "idle" || scanStep === "options") && !businessCardFront && (
                              <div style={{ paddingBottom: scanStep === "options" ? "200px" : "0", transition: "padding 0.2s ease" }}>
                                <motion.button
                                  type="button"
                                  onClick={() => setScanStep(scanStep === "options" ? "idle" : "options")}
                                  className="w-full py-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 relative"
                                  style={{
                                    background: "linear-gradient(135deg, rgba(46, 48, 147, 0.06) 0%, rgba(42, 107, 181, 0.06) 100%)",
                                    border: errors.businessCard 
                                      ? "2px dashed #FAE452"
                                      : "2px dashed rgba(46, 48, 147, 0.25)",
                                  }}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <motion.div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(46, 48, 147, 0.1)" }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E3093" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                      <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                  </motion.div>
                                  <div className="text-center">
                                    <span className="text-xs font-semibold block" style={{ color: "#2E3093" }}>
                                      Scan Business Card
                                    </span>
                                    <span className="text-[10px] mt-0.5 block" style={{ color: "rgba(46, 48, 147, 0.5)" }}>
                                      Capture front & back
                                    </span>
                                  </div>
                                </motion.button>

                                {/* Options Dropdown */}
                                <AnimatePresence>
                                  {scanStep === "options" && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                      transition={{ duration: 0.2, ease: "easeOut" }}
                                      className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden"
                                      style={{
                                        background: "#FFFFFF",
                                        boxShadow: "0 10px 40px rgba(46, 48, 147, 0.3), 0 4px 20px rgba(0, 0, 0, 0.15)",
                                        border: "1px solid rgba(46, 48, 147, 0.15)",
                                        zIndex: 100,
                                      }}
                                    >
                                      <div className="px-4 py-2.5" style={{ background: "rgba(46, 48, 147, 0.05)", borderBottom: "1px solid rgba(46, 48, 147, 0.1)" }}>
                                        <span className="text-xs font-medium" style={{ color: "#2E3093" }}>Step 1: Scan Front Side</span>
                                      </div>
                                      <motion.button
                                        type="button"
                                        onClick={() => triggerCamera("front")}
                                        className="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                                        style={{ borderBottom: "1px solid rgba(46, 48, 147, 0.1)" }}
                                        whileHover={{ backgroundColor: "rgba(46, 48, 147, 0.05)" }}
                                      >
                                        <div 
                                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                                          style={{ background: "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)" }}
                                        >
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                            <circle cx="12" cy="13" r="4"/>
                                          </svg>
                                        </div>
                                        <div className="text-left">
                                          <span className="text-sm font-semibold block" style={{ color: "#2E3093" }}>
                                            Open Camera
                                          </span>
                                          <span className="text-xs" style={{ color: "rgba(46, 48, 147, 0.5)" }}>
                                            Take a photo now
                                          </span>
                                        </div>
                                      </motion.button>
                                      
                                      <motion.button
                                        type="button"
                                        onClick={() => triggerGallery("front")}
                                        className="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                                        whileHover={{ backgroundColor: "rgba(46, 48, 147, 0.05)" }}
                                      >
                                        <div 
                                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                                          style={{ background: "linear-gradient(135deg, #2A6BB5 0%, #2E3093 100%)" }}
                                        >
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                          </svg>
                                        </div>
                                        <div className="text-left">
                                          <span className="text-sm font-semibold block" style={{ color: "#2E3093" }}>
                                            Choose from Gallery
                                          </span>
                                          <span className="text-xs" style={{ color: "rgba(46, 48, 147, 0.5)" }}>
                                            Select an existing photo
                                          </span>
                                        </div>
                                      </motion.button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {/* Front Confirmation State */}
                            {scanStep === "confirm-front" && businessCardFront && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-xl overflow-hidden"
                                style={{
                                  background: "#FFFFFF",
                                  border: "2px solid rgba(46, 48, 147, 0.2)",
                                  boxShadow: "0 8px 32px rgba(46, 48, 147, 0.15)",
                                }}
                              >
                                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(46, 48, 147, 0.05)", borderBottom: "1px solid rgba(46, 48, 147, 0.1)" }}>
                                  <motion.div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)" }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  </motion.div>
                                  <span className="text-sm font-semibold" style={{ color: "#2E3093" }}>Front Side Captured</span>
                                </div>
                                <div className="p-4">
                                  <div 
                                    className="w-full h-32 rounded-lg mb-4 bg-center bg-cover"
                                    style={{ backgroundImage: `url(${businessCardFront})` }}
                                  />
                                  <div className="flex gap-2">
                                    <motion.button
                                      type="button"
                                      onClick={handleRetakeFront}
                                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                      style={{ 
                                        background: "rgba(46, 48, 147, 0.1)",
                                        color: "#2E3093",
                                      }}
                                      whileHover={{ background: "rgba(46, 48, 147, 0.15)" }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Retake
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      onClick={handleConfirmFront}
                                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                                      style={{ 
                                        background: "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)",
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Continue to Back →
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Back Side Options (after front is confirmed) */}
                            {scanStep === "options" && businessCardFront && !businessCardBack && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl overflow-hidden"
                                style={{
                                  background: "#FFFFFF",
                                  border: "2px solid rgba(46, 48, 147, 0.2)",
                                  boxShadow: "0 8px 32px rgba(46, 48, 147, 0.15)",
                                }}
                              >
                                {/* Front preview small */}
                                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "rgba(46, 48, 147, 0.05)", borderBottom: "1px solid rgba(46, 48, 147, 0.1)" }}>
                                  <div 
                                    className="w-12 h-8 rounded bg-center bg-cover"
                                    style={{ backgroundImage: `url(${businessCardFront})`, border: "1px solid rgba(46, 48, 147, 0.2)" }}
                                  />
                                  <div className="flex-1">
                                    <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#2E3093" }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                      Front captured
                                    </span>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <p className="text-sm font-semibold mb-3" style={{ color: "#2E3093" }}>Step 2: Scan Back Side</p>
                                  <div className="flex gap-2">
                                    <motion.button
                                      type="button"
                                      onClick={() => triggerCamera("back")}
                                      className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-white text-sm font-medium"
                                      style={{ background: "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)" }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                      </svg>
                                      Camera
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      onClick={() => triggerGallery("back")}
                                      className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                                      style={{ 
                                        background: "rgba(46, 48, 147, 0.1)",
                                        color: "#2E3093",
                                      }}
                                      whileHover={{ background: "rgba(46, 48, 147, 0.15)" }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                      </svg>
                                      Gallery
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Back Confirmation State */}
                            {scanStep === "confirm-back" && businessCardBack && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-xl overflow-hidden"
                                style={{
                                  background: "#FFFFFF",
                                  border: "2px solid rgba(46, 48, 147, 0.2)",
                                  boxShadow: "0 8px 32px rgba(46, 48, 147, 0.15)",
                                }}
                              >
                                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(46, 48, 147, 0.05)", borderBottom: "1px solid rgba(46, 48, 147, 0.1)" }}>
                                  <motion.div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%)" }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  </motion.div>
                                  <span className="text-sm font-semibold" style={{ color: "#2E3093" }}>Back Side Captured</span>
                                </div>
                                <div className="p-4">
                                  <div 
                                    className="w-full h-32 rounded-lg mb-4 bg-center bg-cover"
                                    style={{ backgroundImage: `url(${businessCardBack})` }}
                                  />
                                  <div className="flex gap-2">
                                    <motion.button
                                      type="button"
                                      onClick={handleRetakeBack}
                                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                      style={{ 
                                        background: "rgba(46, 48, 147, 0.1)",
                                        color: "#2E3093",
                                      }}
                                      whileHover={{ background: "rgba(46, 48, 147, 0.15)" }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Retake
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      onClick={handleConfirmBack}
                                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                                      style={{ 
                                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      ✓ Complete
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Complete State - Both Cards */}
                            {scanStep === "complete" && businessCardFront && businessCardBack && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-lg overflow-hidden"
                                style={{
                                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                                  border: "2px solid rgba(16, 185, 129, 0.3)",
                                }}
                              >
                                <div className="p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <motion.div
                                      className="w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500 }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    </motion.div>
                                    <span className="text-xs font-semibold" style={{ color: "#059669" }}>Business Card Scanned!</span>
                                  </div>
                                  <div className="flex gap-2 mb-3">
                                    <div 
                                      className="flex-1 h-14 rounded-lg bg-center bg-cover relative"
                                      style={{ backgroundImage: `url(${businessCardFront})`, border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                    >
                                      <span className="absolute bottom-1 left-1 text-[9px] px-1 py-0.5 rounded bg-white/90 font-medium" style={{ color: "#2E3093" }}>Front</span>
                                    </div>
                                    <div 
                                      className="flex-1 h-14 rounded-lg bg-center bg-cover relative"
                                      style={{ backgroundImage: `url(${businessCardBack})`, border: "1px solid rgba(16, 185, 129, 0.3)" }}
                                    >
                                      <span className="absolute bottom-1 left-1 text-[9px] px-1 py-0.5 rounded bg-white/90 font-medium" style={{ color: "#2E3093" }}>Back</span>
                                    </div>
                                  </div>

                                  {/* Location Input for Globe */}
                                  <div className="mb-3">
                                    <label
                                      htmlFor="companyLocationScan"
                                      className="block text-[10px] font-medium mb-1"
                                      style={{ color: "#059669" }}
                                    >
                                      Where are you based?
                                    </label>
                                    <div className="relative">
                                      <select
                                        id="companyLocationScan"
                                        name="companyLocation"
                                        value={formData.companyLocation}
                                        onChange={handleChange}
                                        className="w-full px-2.5 py-2 rounded-lg text-xs transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                                        style={{
                                          background: "#FFFFFF",
                                          border: "2px solid rgba(16, 185, 129, 0.3)",
                                          color: formData.companyLocation ? "#2E3093" : "#9CA3AF",
                                        }}
                                        onFocus={(e) => {
                                          e.target.style.borderColor = "#10B981";
                                        }}
                                        onBlur={(e) => {
                                          e.target.style.borderColor = "rgba(16, 185, 129, 0.3)";
                                        }}
                                      >
                                        <option value="">Select your location</option>
                                        {LOCATIONS.map((loc) => (
                                          <option key={loc.value} value={loc.value}>
                                            {loc.label}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                        <svg className="h-4 w-4" style={{ color: "#10B981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <motion.button
                                      type="button"
                                      onClick={() => {
                                        setBusinessCardFront(null);
                                        setBusinessCardBack(null);
                                        setScanStep("idle");
                                      }}
                                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                                      style={{ 
                                        background: "rgba(46, 48, 147, 0.1)",
                                        color: "#2E3093",
                                      }}
                                      whileHover={{ background: "rgba(46, 48, 147, 0.15)" }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Rescan
                                    </motion.button>
                                    <motion.button
                                      type="button"
                                      onClick={handleBusinessCardContinue}
                                      disabled={isLoading || !formData.companyLocation.trim()}
                                      className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
                                      style={{ 
                                        background: formData.companyLocation.trim() && !isLoading
                                          ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                          : "rgba(16, 185, 129, 0.4)",
                                        cursor: formData.companyLocation.trim() && !isLoading ? "pointer" : "not-allowed",
                                      }}
                                      whileHover={formData.companyLocation.trim() && !isLoading ? { scale: 1.02 } : {}}
                                      whileTap={formData.companyLocation.trim() && !isLoading ? { scale: 0.98 } : {}}
                                    >
                                      {isLoading ? "Saving..." : "Continue →"}
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                        {errors.businessCard && (
                          <p className="mt-2 text-xs" style={{ color: "#FAE452" }}>
                            {errors.businessCard}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual Entry Fields (shown when not using business card) */}
                  <AnimatePresence>
                    {!useBusinessCard && (
                      <motion.div
                        key="manualFields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-3 overflow-hidden"
                      >
                        {/* Company Name Field */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <label
                            htmlFor="companyName"
                            className="block text-xs font-medium mb-1"
                            style={{ color: "#2E3093" }}
                          >
                            Company Name
                          </label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-300 focus:outline-none"
                            style={{
                              background: "#FFFFFF",
                              border: errors.companyName 
                                ? "2px solid #FAE452" 
                                : "2px solid rgba(46, 48, 147, 0.3)",
                              color: "#2E3093",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#2E3093";
                              e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = errors.companyName ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                            }}
                          />
                          {errors.companyName && (
                            <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                              {errors.companyName}
                            </p>
                          )}
                        </motion.div>

                        {/* Company Location Field */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <label
                            htmlFor="companyLocation"
                            className="block text-xs font-medium mb-1"
                            style={{ color: "#2E3093" }}
                          >
                            Based In / Location
                          </label>
                          <div className="relative">
                            <select
                              id="companyLocation"
                              name="companyLocation"
                              value={formData.companyLocation}
                              onChange={handleChange}
                              className="w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                              style={{
                                background: "#FFFFFF",
                                border: errors.companyLocation 
                                  ? "2px solid #FAE452" 
                                  : "2px solid rgba(46, 48, 147, 0.3)",
                                color: formData.companyLocation ? "#2E3093" : "#9CA3AF",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#2E3093";
                                e.target.style.boxShadow = "0 4px 16px rgba(46, 48, 147, 0.25)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = errors.companyLocation ? "#FAE452" : "rgba(46, 48, 147, 0.3)";
                                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                              }}
                            >
                              <option value="">Select your location</option>
                              {LOCATIONS.map((loc) => (
                                <option key={loc.value} value={loc.value}>
                                  {loc.label}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                              <svg className="h-4 w-4" style={{ color: "#2E3093" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.companyLocation && (
                            <p className="mt-1.5 text-xs" style={{ color: "#FAE452" }}>
                              {errors.companyLocation}
                            </p>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Submit Button - Yellow CTA */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 mt-4"
                style={{
                  background: isLoading 
                    ? "rgba(250, 228, 82, 0.4)" 
                    : "#FAE452",
                  color: "#2E3093",
                  boxShadow: isLoading ? "none" : "0 4px 20px rgba(250, 228, 82, 0.3)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={!isLoading ? { 
                  scale: 1.02,
                  boxShadow: "0 8px 30px rgba(250, 228, 82, 0.4)"
                } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="w-4 h-4 border-2 rounded-full"
                      style={{ borderColor: "rgba(46, 48, 147, 0.3)", borderTopColor: "#2E3093" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Entering...
                  </span>
                ) : (
                  "Start Exploration"
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default LoginForm;