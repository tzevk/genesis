"use client";

import Image from "next/image";

export function PartnerLogos() {
  return (
    <div className="flex justify-center items-center gap-12 mb-10">
      <LogoCard src="/ats.png" alt="ATS Logo" />
      <LogoCard src="/sit.png" alt="SIT Logo" />
    </div>
  );
}

interface LogoCardProps {
  src: string;
  alt: string;
}

function LogoCard({ src, alt }: LogoCardProps) {
  return (
    <div 
      className="p-4 rounded-lg backdrop-blur-sm flex items-center justify-center"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 0 30px rgba(250, 228, 82, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)",
        width: "140px",
        height: "90px"
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        className="object-contain"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );
}

export default PartnerLogos;
