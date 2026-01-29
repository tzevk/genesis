"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
  dark: "#0a0a1a",
};

interface Photo {
  id: string;
  photo: string;
  userName: string;
  companyName: string;
  capturedAt: string;
}

// Generate random rotation for polaroid effect
const getRandomRotation = (index: number) => {
  const rotations = [-6, -3, 0, 3, 6, -4, 2, -2, 4, -5];
  return rotations[index % rotations.length];
};

export default function PhotoWallPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos");
        const data = await response.json();
        if (data.success) {
          setPhotos(data.photos);
        }
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();

    // Auto-refresh every 10 seconds for live updates
    const interval = setInterval(fetchPhotos, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{
        background: `linear-gradient(135deg, ${BRAND.dark} 0%, #1a1a2e 50%, ${BRAND.dark} 100%)`,
      }}
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 backdrop-blur-xl py-4 px-4 md:px-8"
        style={{
          background: `${BRAND.dark}90`,
          borderBottom: `1px solid ${BRAND.yellow}20`,
        }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${BRAND.yellow}20` }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={BRAND.yellow}
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <h1
                className="text-lg md:text-xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.yellow} 0%, ${BRAND.white} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                GENESIS Photo Wall
              </h1>
              <p className="text-[10px] md:text-xs" style={{ color: `${BRAND.white}50` }}>
                Memories from our visitors
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${BRAND.yellow}15`,
              border: `1px solid ${BRAND.yellow}30`,
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: BRAND.yellow }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium" style={{ color: BRAND.yellow }}>
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
              className="w-16 h-16 rounded-full"
              style={{ border: `3px solid ${BRAND.yellow}30`, borderTopColor: BRAND.yellow }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-sm" style={{ color: `${BRAND.white}60` }}>
              Loading photos...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ background: `${BRAND.yellow}10` }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke={BRAND.yellow}
                strokeWidth="1.5"
                style={{ opacity: 0.5 }}
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: BRAND.white }}
            >
              No photos yet!
            </h2>
            <p className="text-sm" style={{ color: `${BRAND.white}50` }}>
              Be the first to take a photo at the GENESIS booth
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 20, rotate: getRandomRotation(index) }}
                animate={{ opacity: 1, y: 0, rotate: getRandomRotation(index) }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{
                  scale: 1.05,
                  rotate: 0,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Polaroid Card */}
                <div
                  className="rounded-sm overflow-hidden shadow-2xl"
                  style={{
                    background: BRAND.white,
                    padding: "8px 8px 32px 8px",
                  }}
                >
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={photo.photo}
                      alt={`Photo by ${photo.userName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Caption */}
                  <div className="pt-2 text-center">
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: BRAND.dark }}
                    >
                      {photo.userName}
                    </p>
                    <p
                      className="text-[9px] truncate"
                      style={{ color: "#666" }}
                    >
                      {photo.companyName}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.9)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative max-w-lg w-full"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large Polaroid */}
              <div
                className="rounded-sm overflow-hidden shadow-2xl"
                style={{
                  background: BRAND.white,
                  padding: "16px 16px 60px 16px",
                }}
              >
                {/* Photo */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm">
                  <img
                    src={selectedPhoto.photo}
                    alt={`Photo by ${selectedPhoto.userName}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Caption */}
                <div className="pt-4 text-center">
                  <p
                    className="text-lg font-bold"
                    style={{ color: BRAND.dark }}
                  >
                    {selectedPhoto.userName}
                  </p>
                  <p className="text-sm" style={{ color: "#666" }}>
                    {selectedPhoto.companyName}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "#999" }}
                  >
                    {formatDate(selectedPhoto.capturedAt)}
                  </p>
                </div>

                {/* GENESIS Stamp */}
                <div
                  className="absolute bottom-4 right-4 px-2 py-1 rounded"
                  style={{
                    background: `${BRAND.indigo}15`,
                    border: `1px solid ${BRAND.indigo}30`,
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: BRAND.indigo }}
                  >
                    GENESIS 2026
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: BRAND.yellow,
                  color: BRAND.dark,
                }}
                onClick={() => setSelectedPhoto(null)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className="py-6 text-center"
        style={{ borderTop: `1px solid ${BRAND.white}10` }}
      >
        <p className="text-[10px]" style={{ color: `${BRAND.white}30` }}>
          <span style={{ color: `${BRAND.yellow}60` }}>Accent Techno Solutions</span>
          {" × "}
          <span>Suvidya Institute of Technology</span>
        </p>
        <p
          className="text-[9px] mt-1 uppercase tracking-wider"
          style={{ color: `${BRAND.white}20` }}
        >
          GENESIS — Engineering Simulation Platform
        </p>
      </footer>
    </div>
  );
}
