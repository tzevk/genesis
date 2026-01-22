"use client";

import { motion } from "framer-motion";
import { SECTORS } from "@/lib/constants";
import { ProcessIcon, HVACIcon, OilGasIcon, ElectricalIcon, MEPIcon } from "@/components/icons";

interface GlassSectorWheelProps {
  rotation: number;
  isVisible: boolean;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  process: ProcessIcon,
  hvac: HVACIcon,
  oilgas: OilGasIcon,
  electrical: ElectricalIcon,
  mep: MEPIcon,
};

export function GlassSectorWheel({ rotation, isVisible }: GlassSectorWheelProps) {
  return (
    <motion.div
      className="relative w-80 h-80 md:w-96 md:h-96 mx-auto"
      initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
      animate={isVisible ? { 
        opacity: 1, 
        scale: 1, 
        rotateY: 0,
      } : { opacity: 0, scale: 0.3, rotateY: -90 }}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Apple-style spring
        scale: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
      }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-[-20px] rounded-full"
        animate={{
          boxShadow: [
            "0 0 60px rgba(250, 228, 82, 0.2), inset 0 0 60px rgba(250, 228, 82, 0.05)",
            "0 0 80px rgba(250, 228, 82, 0.3), inset 0 0 80px rgba(250, 228, 82, 0.1)",
            "0 0 60px rgba(250, 228, 82, 0.2), inset 0 0 60px rgba(250, 228, 82, 0.05)",
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glassmorphism container */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
      />

      {/* Pointer */}
      <WheelPointer />

      {/* Wheel */}
      <motion.div
        className="absolute inset-4 rounded-full overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {SECTORS.map((sector, index) => (
          <WheelSegment
            key={sector.name}
            sector={sector}
            index={index}
            totalSectors={SECTORS.length}
          />
        ))}

        {/* Center circle with glassmorphism */}
        <CenterCircle />
      </motion.div>

      {/* Reflection highlight */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  );
}

function WheelPointer() {
  return (
    <motion.div 
      className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glassmorphic pointer */}
      <div
        className="relative"
        style={{
          width: "40px",
          height: "50px",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
            background: "linear-gradient(180deg, rgba(250, 228, 82, 0.9) 0%, rgba(250, 228, 82, 0.7) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 20px rgba(250, 228, 82, 0.4)",
          }}
        />
        {/* Pointer highlight */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-2"
          style={{
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%)",
            clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
          }}
        />
      </div>
    </motion.div>
  );
}

interface WheelSegmentProps {
  sector: { name: string; color: string; icon: string };
  index: number;
  totalSectors: number;
}

function WheelSegment({ sector, index, totalSectors }: WheelSegmentProps) {
  const angle = (360 / totalSectors) * index;
  const skew = 90 - 360 / totalSectors;
  const IconComponent = iconMap[sector.icon];

  return (
    <div
      className="absolute w-1/2 h-1/2 origin-bottom-right"
      style={{
        transform: `rotate(${angle}deg) skewY(${skew}deg)`,
        background: `linear-gradient(135deg, ${sector.color}dd 0%, ${sector.color}aa 100%)`,
        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        className="absolute text-white drop-shadow-lg"
        style={{
          transform: `skewY(${-skew}deg) rotate(${360 / totalSectors / 2}deg)`,
          left: "40%",
          top: "20%",
        }}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
    </div>
  );
}

function CenterCircle() {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
      }}
    >
      <span 
        className="font-semibold text-xs tracking-wider"
        style={{ 
          color: "rgba(255, 255, 255, 0.9)",
          textShadow: "0 0 10px rgba(250, 228, 82, 0.5)"
        }}
      >
        GENESIS
      </span>
    </motion.div>
  );
}

export default GlassSectorWheel;
