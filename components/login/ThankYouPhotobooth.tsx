"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#0a0a1a",
};

interface ThankYouPhotoboothProps {
  userName: string;
  companyName: string;
  companyLocation: string;
}

// Pre-generate confetti positions
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: (i * 37 + 13) % 100,
  delay: (i % 10) * 0.1,
  duration: 2 + (i % 3) * 0.5,
  color: i % 3 === 0 ? BRAND.yellow : i % 3 === 1 ? BRAND.blue : BRAND.white,
}));

export function ThankYouPhotobooth({ userName, companyName }: ThankYouPhotoboothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        // Use back camera on mobile devices
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Camera access denied:", error);
        setCameraError(true);
      }
    };

    initCamera();

    return () => {
      // Cleanup: stop camera stream
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Fetch user count and show content
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/user/count');
        const data = await response.json();
        if (data.success) {
          setUserCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };
    fetchUserCount();
    
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame (no mirroring for back camera)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add branded overlay
    const gradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    gradient.addColorStop(0, "rgba(46, 48, 147, 0)");
    gradient.addColorStop(1, "rgba(46, 48, 147, 0.9)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Add text overlay
    ctx.fillStyle = BRAND.white;
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(userName, canvas.width / 2, canvas.height - 50);
    
    ctx.fillStyle = BRAND.yellow;
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillText(companyName || "Professional Visitor", canvas.width / 2, canvas.height - 25);

    // Add GENESIS branding
    ctx.fillStyle = `${BRAND.white}80`;
    ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("GENESIS × Accent Techno Solutions", 15, canvas.height - 10);

    // Get data URL
    const photoData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(photoData);
  }, [userName, companyName]);

  // Start countdown for photo
  const startCountdown = useCallback(() => {
    if (countdown !== null || capturedPhoto) return;
    
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Flash effect
          setFlash(true);
          setTimeout(() => setFlash(false), 200);
          // Capture photo
          setTimeout(() => capturePhoto(), 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [countdown, capturedPhoto, capturePhoto]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    setCountdown(null);
  }, []);

  // Download photo
  const downloadPhoto = useCallback(() => {
    if (!capturedPhoto) return;
    
    const link = document.createElement("a");
    link.href = capturedPhoto;
    link.download = `genesis-${userName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.jpg`;
    link.click();
  }, [capturedPhoto, userName]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.indigo}30 50%, ${BRAND.dark} 100%)`,
        zIndex: 200,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Confetti Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {capturedPhoto && CONFETTI.map((c) => (
          <motion.div
            key={c.id}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${c.left}%`,
              top: -10,
              background: c.color,
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              opacity: [1, 0.5],
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Flash Effect */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="absolute inset-0 bg-white z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="text-center mb-4 z-10 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="text-xl xs:text-2xl md:text-3xl font-bold mb-1"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND.yellow} 0%, ${BRAND.white} 50%, ${BRAND.yellow} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thank You, {userName}!
            </h1>
            <p className="text-xs xs:text-sm text-white/80">
              Take a photo to remember your visit
            </p>
            
            {/* Visitor Count */}
            {userCount !== null && (
              <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: `${BRAND.yellow}15`,
                    border: `1px solid ${BRAND.yellow}30`,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BRAND.yellow} strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-[10px] xs:text-xs font-medium" style={{ color: BRAND.yellow }}>
                    {userCount} {userCount === 1 ? 'visitor' : 'visitors'}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera/Photo Frame */}
      <motion.div
        className="relative w-full max-w-xs xs:max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "4/3",
          background: BRAND.dark,
          border: `3px solid ${BRAND.yellow}50`,
          boxShadow: `0 0 40px ${BRAND.yellow}20, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Camera Error State */}
        {cameraError && !capturedPhoto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-4">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke={BRAND.white} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            <p className="text-white/70 text-sm mb-2">Camera access denied</p>
            <p className="text-white/50 text-xs">Please enable camera permissions</p>
          </div>
        )}

        {/* Video Feed (hidden when photo captured) */}
        {!capturedPhoto && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{}} // Back camera - no mirror needed
          />
        )}

        {/* Captured Photo */}
        {capturedPhoto && (
          <motion.img
            src={capturedPhoto}
            alt="Captured photo"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                className="text-7xl font-bold"
                style={{ color: BRAND.yellow }}
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Ready Indicator */}
        {cameraReady && !capturedPhoto && countdown === null && (
          <motion.div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] text-white font-medium">LIVE</span>
          </motion.div>
        )}

        {/* Photo Captured Badge */}
        {capturedPhoto && (
          <motion.div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: `${BRAND.yellow}90` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BRAND.dark} strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-[10px] font-bold" style={{ color: BRAND.dark }}>CAPTURED</span>
          </motion.div>
        )}

        {/* Frame Corners */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: BRAND.yellow }} />
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2" style={{ borderColor: BRAND.yellow }} />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2" style={{ borderColor: BRAND.yellow }} />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: BRAND.yellow }} />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-3 z-10 px-4 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {!capturedPhoto ? (
          <motion.button
            className="w-full py-3 xs:py-4 rounded-xl font-bold text-sm xs:text-base flex items-center justify-center gap-2"
            style={{
              background: BRAND.yellow,
              color: BRAND.dark,
            }}
            onClick={startCountdown}
            disabled={!cameraReady || countdown !== null}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {countdown !== null ? "Get Ready..." : "Take Photo"}
          </motion.button>
        ) : (
          <>
            <motion.button
              className="w-full py-3 xs:py-4 rounded-xl font-bold text-sm xs:text-base flex items-center justify-center gap-2"
              style={{
                background: BRAND.yellow,
                color: BRAND.dark,
              }}
              onClick={downloadPhoto}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Photo
            </motion.button>
            <motion.button
              className="w-full py-2.5 xs:py-3 rounded-xl font-medium text-xs xs:text-sm flex items-center justify-center gap-2"
              style={{
                background: `${BRAND.white}10`,
                color: BRAND.white,
                border: `1px solid ${BRAND.white}20`,
              }}
              onClick={retakePhoto}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Retake Photo
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        className="absolute bottom-4 xs:bottom-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p 
          className="text-[10px] xs:text-xs"
          style={{ color: `${BRAND.white}40` }}
        >
          <span style={{ color: BRAND.yellow }}>Accent Techno Solutions</span>
          {" × "}
          <span>Suvidya Institute of Technology</span>
        </p>
        <p 
          className="text-[9px] xs:text-[10px] mt-0.5 uppercase tracking-wider"
          style={{ color: `${BRAND.white}25` }}
        >
          GENESIS — Engineering Simulation Platform
        </p>
      </motion.div>
    </motion.div>
  );
}
