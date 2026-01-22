"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BlinkDetectorProps {
  onBlink: () => void;
  disabled?: boolean;
}

// Blink detection using face-api.js
const BLINK_COOLDOWN = 700; // ms between blinks
const EAR_THRESHOLD = 0.25; // Eye Aspect Ratio threshold for closed eyes

export function BlinkDetector({ onBlink, disabled }: BlinkDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceapiRef = useRef<any>(null);
  const lastBlinkRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkFeedback, setBlinkFeedback] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Calculate Eye Aspect Ratio (EAR)
  const calculateEAR = useCallback((eye: { x: number; y: number }[]) => {
    if (eye.length < 6) return 1;
    
    const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => 
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    // Vertical distances (points 1-5 and 2-4)
    const v1 = distance(eye[1], eye[5]);
    const v2 = distance(eye[2], eye[4]);
    
    // Horizontal distance (points 0-3)
    const h = distance(eye[0], eye[3]);
    
    if (h === 0) return 1;
    return (v1 + v2) / (2.0 * h);
  }, []);

  // Initialize camera and face-api.js
  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    const initializeDetector = async () => {
      try {
        setLoadingStatus("Requesting camera access...");
        
        // Request camera permission with higher resolution for better detection
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user", 
            width: { ideal: 640 }, 
            height: { ideal: 480 } 
          }
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        currentStream = stream;
        streamRef.current = stream;

        // Wait a tick for the video element to be in DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise<void>((resolve) => {
            if (!videoRef.current) return resolve();
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current && mounted) {
                videoRef.current.play()
                  .then(() => {
                    setIsVideoReady(true);
                    resolve();
                  })
                  .catch(() => resolve());
              } else {
                resolve();
              }
            };
          });
        }

        if (!mounted) return;

        setHasPermission(true);
        setLoadingStatus("Loading face detection...");

        // Dynamic import for @vladmandic/face-api (includes TensorFlow.js)
        const faceapi = await import("@vladmandic/face-api");
        
        if (!mounted) return;
        
        faceapiRef.current = faceapi;
        
        // Load models from CDN
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";
        
        setLoadingStatus("Loading detection models...");
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        if (mounted) {
          setIsLoading(false);
          setIsDetecting(true);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
        if (mounted) {
          setHasPermission(false);
          setIsLoading(false);
          setLoadingStatus("Failed to initialize");
        }
      }
    };

    initializeDetector();

    return () => {
      mounted = false;
      // Clean up stream
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isDetecting || !faceapiRef.current || !videoRef.current || !isVideoReady || disabled) return;

    const faceapi = faceapiRef.current;
    let wasEyesClosed = false;
    let noFaceFrames = 0;
    let isRunning = true;

    const detect = async () => {
      if (!isRunning) return;
      
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 320,
            scoreThreshold: 0.5 
          }))
          .withFaceLandmarks(true);

        if (detections) {
          noFaceFrames = 0;
          setFaceDetected(true);
          
          const landmarks = detections.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          const leftEAR = calculateEAR(leftEye);
          const rightEAR = calculateEAR(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;
          
          const now = Date.now();
          
          if (avgEAR < EAR_THRESHOLD) {
            wasEyesClosed = true;
          } else if (wasEyesClosed && now - lastBlinkRef.current > BLINK_COOLDOWN) {
            // Blink completed (eyes opened after being closed)
            wasEyesClosed = false;
            lastBlinkRef.current = now;
            
            // Visual feedback
            setBlinkFeedback(true);
            setTimeout(() => setBlinkFeedback(false), 300);
            
            onBlink();
          }
        } else {
          noFaceFrames++;
          if (noFaceFrames > 10) {
            setFaceDetected(false);
          }
        }
      } catch {
        // Silently continue on detection errors
      }

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, isVideoReady, disabled, onBlink, calculateEAR]);

  // Permission denied
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-48 h-36 rounded-xl flex flex-col items-center justify-center"
          style={{
            background: "rgba(255, 100, 100, 0.1)",
            border: "2px solid rgba(255, 100, 100, 0.4)",
          }}
        >
          <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 100, 100, 0.8)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
          </svg>
          <p className="text-xs tracking-wider text-center px-4" style={{ color: "rgba(255, 200, 200, 0.8)" }}>
            CAMERA ACCESS<br/>REQUIRED
          </p>
        </div>
        <p className="text-xs text-white/40 text-center max-w-48">
          Please allow camera access to use blink detection
        </p>
      </div>
    );
  }

  // Main render - single video element that persists through loading and active states
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Camera preview with face alignment guide */}
      <div className="relative">
        <motion.div
          className="w-48 h-36 rounded-xl overflow-hidden relative"
          style={{
            background: "rgba(10, 77, 140, 0.3)",
            border: blinkFeedback 
              ? "3px solid #FAE452" 
              : faceDetected 
                ? "2px solid rgba(100, 255, 100, 0.6)" 
                : "2px solid rgba(250, 228, 82, 0.4)",
            boxShadow: blinkFeedback 
              ? "0 0 30px rgba(250, 228, 82, 0.6)" 
              : faceDetected 
                ? "0 0 20px rgba(100, 255, 100, 0.2)"
                : "none",
          }}
          animate={blinkFeedback ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Single persistent video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
            autoPlay
            style={{ opacity: isVideoReady ? 1 : 0 }}
          />
          
          {/* Face alignment guide overlay - only show when not loading */}
          {!isLoading && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Face oval guide */}
              <svg className="w-full h-full" viewBox="0 0 192 144" preserveAspectRatio="xMidYMid meet">
                {/* Oval guide for face positioning */}
                <ellipse
                  cx="96"
                  cy="72"
                  rx="40"
                  ry="52"
                  fill="none"
                  stroke={faceDetected ? "rgba(100, 255, 100, 0.4)" : "rgba(250, 228, 82, 0.3)"}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* Eye level line */}
                <line
                  x1="56"
                  y1="58"
                  x2="136"
                  y2="58"
                  stroke={faceDetected ? "rgba(100, 255, 100, 0.3)" : "rgba(250, 228, 82, 0.2)"}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Corner brackets */}
                <path d="M20 30 L20 20 L30 20" fill="none" stroke="rgba(250, 228, 82, 0.4)" strokeWidth="1.5" />
                <path d="M162 30 L172 30 L172 20" fill="none" stroke="rgba(250, 228, 82, 0.4)" strokeWidth="1.5" />
                <path d="M20 114 L20 124 L30 124" fill="none" stroke="rgba(250, 228, 82, 0.4)" strokeWidth="1.5" />
                <path d="M162 124 L172 124 L172 114" fill="none" stroke="rgba(250, 228, 82, 0.4)" strokeWidth="1.5" />
              </svg>
            </div>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent mb-3"
                  style={{ borderColor: "rgba(250, 228, 82, 0.6)", borderTopColor: "transparent" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-xs tracking-wider px-4 text-center" style={{ color: "rgba(250, 228, 82, 0.8)" }}>
                  {loadingStatus.toUpperCase()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disabled overlay */}
          {disabled && !isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(10, 77, 140, 0.8)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#FAE452" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                </svg>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Status indicator */}
        <AnimatePresence>
          {!disabled && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: faceDetected ? "rgba(100, 255, 100, 0.2)" : "rgba(250, 228, 82, 0.2)",
                border: `1px solid ${faceDetected ? "rgba(100, 255, 100, 0.4)" : "rgba(250, 228, 82, 0.4)"}`,
                color: faceDetected ? "rgba(100, 255, 100, 0.9)" : "rgba(250, 228, 82, 0.9)",
              }}
            >
              {faceDetected ? "✓ FACE DETECTED" : "ALIGN FACE"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {!disabled && !isLoading && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <motion.p
            className="text-sm font-medium tracking-wider"
            style={{ color: "#FAE452" }}
            animate={{ opacity: faceDetected ? [0.7, 1, 0.7] : 0.5 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {faceDetected ? "BLINK TO SPIN" : "POSITION YOUR FACE"}
          </motion.p>
          <p className="text-xs text-white/40 text-center max-w-48">
            {faceDetected 
              ? "Close and open your eyes to trigger the spin" 
              : "Center your face in the oval guide"}
          </p>
        </div>
      )}

      {/* Loading instructions */}
      {isLoading && (
        <p className="text-xs text-white/40 text-center max-w-48">
          Setting up camera and face detection...
        </p>
      )}
    </div>
  );
}

export default BlinkDetector;
