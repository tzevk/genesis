"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { validateLoginForm, loginUser } from "@/lib/utils";
import { FormErrors } from "@/lib/types";

interface LoginFormProps {
  onStartSimulation?: () => void;
}

export function LoginForm({ onStartSimulation }: LoginFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    educationLevel: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await loginUser(formData);
      
      // Start cinematic fade to black
      setIsFadingOut(true);
      
      // Wait for fade animation then trigger simulation
      setTimeout(() => {
        if (onStartSimulation) {
          onStartSimulation();
        }
      }, 1200);
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ name: "Login failed. Please try again." });
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
        className="w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
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
              className="mb-8 p-4 rounded-xl flex justify-center items-center gap-5"
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
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
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

              {/* Phone Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
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
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label
                  htmlFor="educationLevel"
                  className="block text-sm font-medium mb-2"
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
                className="w-full py-4 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 mt-8"
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
                      className="w-5 h-5 border-2 rounded-full"
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