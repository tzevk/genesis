"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import createGlobe from "cobe";
import { LOCATIONS } from "@/lib/constants";

function getCoordinatesFromLocation(location: string): [number, number] {
  const normalizedLocation = location.toLowerCase().trim();
  
  // Find location in LOCATIONS array
  const found = LOCATIONS.find(
    (loc) => loc.value.toLowerCase() === normalizedLocation || 
             loc.label.toLowerCase().includes(normalizedLocation)
  );
  
  if (found) {
    return [found.coords[0], found.coords[1]];
  }
  
  // Default to India center
  return [20.5937, 78.9629];
}

interface ThankYouGlobeProps {
  userName: string;
  companyName: string;
  companyLocation: string;
  onContinue: () => void;
}

// Pre-generate star positions outside component to avoid impure function calls during render
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: (i * 37 + 13) % 100, // Deterministic pseudo-random distribution
  top: (i * 59 + 7) % 100,
  duration: 2 + (i % 5) * 0.5,
  delay: (i % 8) * 0.3,
}));

export function ThankYouGlobe({ userName, companyName, companyLocation, onContinue }: ThankYouGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [showMarker, setShowMarker] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomComplete, setZoomComplete] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [userCount, setUserCount] = useState<number | null>(null);
  
  const locationCoords = getCoordinatesFromLocation(companyLocation);
  
  // Convert lat/lng to phi/theta for cobe
  const phi = (90 - locationCoords[0]) * (Math.PI / 180);
  const theta = (locationCoords[1] + 180) * (Math.PI / 180);

  useEffect(() => {
    // Fetch professional user count
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
    
    // Delay content appearance for dramatic effect
    const contentTimer = setTimeout(() => setShowContent(true), 500);
    const markerTimer = setTimeout(() => setShowMarker(true), 2000);
    // Start zoom animation after marker appears
    const zoomTimer = setTimeout(() => setIsZooming(true), 3500);
    
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(markerTimer);
      clearTimeout(zoomTimer);
    };
  }, []);

  // Zoom animation
  useEffect(() => {
    if (!isZooming) return;
    
    let animationFrame: number;
    let currentScale = 1;
    const targetScale = 1.8; // Reduced zoom to prevent overlap
    const zoomSpeed = 0.03;
    
    const animateZoom = () => {
      currentScale += (targetScale - currentScale) * zoomSpeed;
      setZoomScale(currentScale);
      
      if (currentScale < targetScale - 0.05) {
        animationFrame = requestAnimationFrame(animateZoom);
      } else {
        // Ensure we reach target
        setZoomScale(targetScale);
        // Zoom complete
        setZoomComplete(true);
      }
    };
    
    animationFrame = requestAnimationFrame(animateZoom);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isZooming]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let currentPhi = 0;
    const targetPhi = theta;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: phi,
      dark: 1,
      diffuse: 3,
      mapSamples: 24000,
      mapBrightness: 8,
      baseColor: [0.15, 0.16, 0.5],
      markerColor: [0.98, 0.89, 0.32],
      glowColor: [0.2, 0.5, 0.9],
      markers: showMarker ? [
        { location: [locationCoords[0], locationCoords[1]], size: 0.12 }
      ] : [],
      onRender: (state) => {
        // Rotate to target location
        currentPhi += (targetPhi - currentPhi) * 0.02;
        state.phi = currentPhi;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [phi, theta, showMarker, locationCoords]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)",
        zIndex: 200,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {STARS.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Thank You Header - Always visible at top */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="text-center mb-6 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="text-2xl md:text-3xl font-bold mb-1"
              style={{ 
                background: "linear-gradient(135deg, #FAE452 0%, #FFFFFF 50%, #FAE452 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thank You, {userName}!
            </h1>
            <p className="text-sm text-white/80">
              for signing up with us
            </p>
            
            {/* Visitor Count */}
            {userCount !== null && (
              <motion.div
                className="mt-3 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(250, 228, 82, 0.15)",
                    border: "1px solid rgba(250, 228, 82, 0.3)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FAE452" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-xs font-medium" style={{ color: "#FAE452" }}>
                    {userCount} {userCount === 1 ? 'visitor' : 'visitors'}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Globe Container */}
      <div className="relative w-full max-w-sm mx-auto px-4" style={{ height: "280px", overflow: "hidden" }}>
        {/* Globe */}
        <motion.div
          className="relative mx-auto"
          style={{ 
            width: "100%", 
            maxWidth: "240px", 
            aspectRatio: "1/1",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: zoomScale, 
            opacity: 1 
          }}
          transition={{ 
            duration: isZooming ? 0.1 : 1.2, 
            ease: isZooming ? "easeOut" : [0.16, 1, 0.3, 1] 
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              contain: "layout paint size",
            }}
          />
          
          {/* Glow ring around globe */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: "0 0 60px rgba(250, 228, 82, 0.3), 0 0 120px rgba(46, 48, 147, 0.4)",
            }}
            animate={{
              boxShadow: [
                "0 0 60px rgba(250, 228, 82, 0.3), 0 0 120px rgba(46, 48, 147, 0.4)",
                "0 0 80px rgba(250, 228, 82, 0.5), 0 0 150px rgba(46, 48, 147, 0.6)",
                "0 0 60px rgba(250, 228, 82, 0.3), 0 0 120px rgba(46, 48, 147, 0.4)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Location Pulse */}
          {showMarker && (
            <motion.div
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="rounded-full"
                style={{ 
                  background: "#FAE452",
                  width: isZooming ? `${Math.max(4, 16 / zoomScale)}px` : "16px",
                  height: isZooming ? `${Math.max(4, 16 / zoomScale)}px` : "16px",
                }}
                animate={!isZooming ? {
                  scale: [1, 2, 1],
                  opacity: [1, 0.5, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Expanding rings during zoom */}
              {isZooming && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: "#FAE452" }}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: "#FAE452" }}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        {/* Location Info - shown before zoom */}
        <AnimatePresence>
          {showContent && !isZooming && (
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(250, 228, 82, 0.15)",
                  border: "1px solid rgba(250, 228, 82, 0.3)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#FAE452" }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-medium" style={{ color: "#FAE452" }}>
                  {companyName} • {companyLocation}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zooming to location text */}
        <AnimatePresence>
          {isZooming && !zoomComplete && (
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p 
                className="text-sm font-medium"
                style={{ color: "#FAE452" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Locating {companyLocation}...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final state after zoom complete */}
        <AnimatePresence>
          {zoomComplete && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Located Badge with Pin Icon */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Location Pin Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: "#10B981" }}>
                  Located
                </span>
              </motion.div>

              <h2 
                className="text-lg font-bold"
                style={{ 
                  background: "linear-gradient(135deg, #FAE452 0%, #FFFFFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {companyLocation}
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                {companyName}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
