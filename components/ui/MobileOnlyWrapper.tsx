"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MobileOnlyWrapperProps {
  children: React.ReactNode;
}

export function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile viewport (768px is standard tablet/mobile breakpoint)
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Loading state
  if (isMobile === null) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0a4d8c" }}
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: "rgba(250, 228, 82, 0.6)", borderTopColor: "transparent" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Desktop message
  if (!isMobile) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
        style={{ backgroundColor: "#0a4d8c" }}
      >
        {/* Blueprint grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(250, 228, 82, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250, 228, 82, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(5, 40, 80, 0.7) 100%)",
          }}
        />

        <motion.div
          className="relative z-10 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile icon */}
          <motion.div
            className="mb-8 flex justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#FAE452" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" />
            </svg>
          </motion.div>

          <h1 
            className="text-2xl md:text-3xl font-light mb-4 tracking-wide"
            style={{ color: "#FAE452" }}
          >
            Mobile Experience Only
          </h1>

          <p 
            className="text-base mb-8 leading-relaxed"
            style={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Genesis is designed exclusively for mobile devices. 
            Please open this app on your phone to continue.
          </p>

          {/* QR code suggestion */}
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-lg"
            style={{
              background: "rgba(250, 228, 82, 0.1)",
              border: "1px solid rgba(250, 228, 82, 0.3)",
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="rgba(250, 228, 82, 0.8)" 
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
            <span style={{ color: "rgba(250, 228, 82, 0.9)" }} className="text-sm">
              Scan QR or visit on mobile
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mobile view - show the app
  return <>{children}</>;
}
