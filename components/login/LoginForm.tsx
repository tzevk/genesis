"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { validateLoginForm, loginUser } from "@/lib/utils";
import { FormErrors } from "@/lib/types";

interface LoginFormProps {
  onStartSimulation?: () => void;
}

export function LoginForm({ }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    educationLevel: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showPhotoConsentModal, setShowPhotoConsentModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData, "student", false);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await loginUser({ 
        ...formData, 
        userType: "student",
      });
      
      setIsLoading(false);
      // All students go to sector-wheel after photobooth
      setPendingRedirect("/sector-wheel");
      // Show photo consent modal
      setShowPhotoConsentModal(true);
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

  // Handle photo consent agreement
  const handlePhotoConsentAgree = () => {
    setShowPhotoConsentModal(false);
    setIsFadingOut(true);
    setTimeout(() => {
      // Redirect to photobooth first, which will then redirect to the quiz/simulation
      router.replace(`/photobooth?next=${encodeURIComponent(pendingRedirect || "/sector-wheel")}`);
    }, 800);
  };

  // Handle photo consent decline
  const handlePhotoConsentDecline = () => {
    setShowPhotoConsentModal(false);
    setIsFadingOut(true);
    setTimeout(() => {
      // Skip photobooth and go directly to quiz/simulation
      router.replace(pendingRedirect || "/sector-wheel");
    }, 800);
  };

  return (
    <>
      {/* Photo Consent Modal for Students */}
      <AnimatePresence>
        {showPhotoConsentModal && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0, 0, 0, 0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2E3093 0%, #1a1d5c 100%)",
                border: "1px solid rgba(250, 228, 82, 0.3)",
                borderBottom: "none",
                boxShadow: "0 -10px 50px rgba(0, 0, 0, 0.5)",
                paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Camera Icon */}
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #FAE452 0%, #f5d93a 100%)",
                  boxShadow: "0 10px 40px rgba(250, 228, 82, 0.4)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "#2E3093" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-xl font-bold mb-3"
                style={{ color: "#FAE452" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Photo Consent
              </motion.h2>

              {/* Terms & Conditions */}
              <motion.div
                className="text-left mb-4 p-4 rounded-xl max-h-48 overflow-y-auto"
                style={{ 
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm mb-3" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  By clicking &quot;I Agree&quot;, you consent to:
                </p>
                <ul className="text-xs space-y-2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  <li className="flex items-start gap-2">
                    <span style={{ color: "#FAE452" }}>•</span>
                    Having your photo taken at the GENESIS photobooth
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: "#FAE452" }}>•</span>
                    Your photo being displayed on the ChemTECH 2026 photo wall
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: "#FAE452" }}>•</span>
                    Potential use of your photo for event promotion and social media
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: "#FAE452" }}>•</span>
                    Storage of your photo for the duration of the event
                  </li>
                </ul>
              </motion.div>

              {/* Note */}
              <motion.p
                className="text-xs mb-5"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You can skip the photobooth if you prefer not to participate.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={handlePhotoConsentDecline}
                  className="flex-1 py-4 px-4 rounded-xl text-base font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={handlePhotoConsentAgree}
                  className="flex-1 py-4 px-4 rounded-xl text-base font-bold transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #FAE452 0%, #f5d93a 100%)",
                    color: "#2E3093",
                    boxShadow: "0 4px 20px rgba(250, 228, 82, 0.3)",
                  }}
                >
                  I Agree
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        className="w-full max-w-[380px] mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className="rounded-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden"
          style={{
            background: "rgb(255, 255, 255)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(42, 107, 181, 0.3)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Content */}
          <div className="relative z-10">
            {/* Logo Container */}
            <motion.div 
              className="mb-4 p-3 rounded-xl"
              style={{
                background: "rgba(46, 48, 147, 0.05)",
                border: "1px solid rgba(46, 48, 147, 0.1)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p 
                className="text-xs text-center mb-2 font-medium"
                style={{ color: "rgba(46, 48, 147, 0.6)" }}
              >
                Powered by
              </p>
              <div className="flex justify-center items-center gap-4">
                <Image
                  src="/ats.png"
                  alt="Accent Techno Solutions"
                  width={90}
                  height={50}
                  className="object-contain"
                />
                <div 
                  className="w-px h-8" 
                  style={{ background: "linear-gradient(180deg, transparent, rgba(46, 48, 147, 0.3), transparent)" }} 
                />
                <Image
                  src="/sit.png"
                  alt="Suvidya Institute of Technology"
                  width={90}
                  height={50}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
                  autoComplete="name"
                  className="w-full px-4 py-3.5 rounded-xl text-base transition-all duration-300 focus:outline-none"
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

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
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
                  autoComplete="email"
                  inputMode="email"
                  className="w-full px-4 py-3.5 rounded-xl text-base transition-all duration-300 focus:outline-none"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full px-4 py-3.5 rounded-xl text-base transition-all duration-300 focus:outline-none"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
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
                    className="w-full px-4 py-3.5 rounded-xl text-base appearance-none cursor-pointer transition-all duration-300 focus:outline-none"
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

              {/* Submit Button - Yellow CTA */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 mt-5"
                style={{
                  background: isLoading 
                    ? "rgba(250, 228, 82, 0.4)" 
                    : "#FAE452",
                  color: "#2E3093",
                  boxShadow: isLoading ? "none" : "0 4px 20px rgba(250, 228, 82, 0.3)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
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
