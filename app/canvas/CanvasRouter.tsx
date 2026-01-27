"use client";

/**
 * CanvasRouter - Routes to appropriate canvas based on sector
 * 
 * - Oil & Gas: Uses OilGas2DCanvas (2D SVG visualization)
 * - Other sectors: Uses standard CanvasClient (drag-drop experience)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDataAsync } from "@/lib/utils";
import { CanvasClient } from "./CanvasClientV2";
import { AnimatePresence } from "framer-motion";
import { WelcomeOverlay, SECTOR_COLORS } from "@/components/canvas";
import { OilGas2DCanvas } from "@/components/canvas/OilGas2DCanvas";

const BRAND = {
  indigo: "#2E3093",
  yellow: "#FAE452",
};

export function CanvasRouter() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [userSector, setUserSector] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [sectorColor, setSectorColor] = useState(BRAND.yellow);
  const [showWelcome, setShowWelcome] = useState(true);

  // Check if sector is Oil & Gas
  const isOilGas = (sector: string): boolean => {
    const normalized = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
    return ["oilgas", "oil&gas", "oilandgas"].includes(normalized);
  };

  // Start session API call
  const startSession = async (phone: string) => {
    try {
      await fetch("/api/user/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const userData = await getUserDataAsync();
      if (!userData || !userData.sector) {
        router.push("/");
        return;
      }

      const sector = userData.sector || "";
      
      setUserSector(sector);
      setUserName(userData.name || "Engineer");
      setUserPhone(userData.phone || "");
      setSectorColor(SECTOR_COLORS[sector] || BRAND.yellow);
      setIsClient(true);

      // Show welcome then 3D scene for Oil & Gas
      setTimeout(() => {
        setShowWelcome(false);
        if (!isOilGas(sector)) {
          // Start session for non-oil-gas
          startSession(userData.phone);
        }
      }, 3500);
    };

    loadUserData();
  }, [router]);

  // Loading state
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.indigo }}>
        <div style={{ color: `${BRAND.yellow}80` }}>Loading...</div>
      </div>
    );
  }

  // Oil & Gas sector - use 2D canvas
  if (isOilGas(userSector)) {
    return (
      <>
        {/* Welcome overlay */}
        <AnimatePresence>
          {showWelcome && (
            <WelcomeOverlay sector={userSector} sectorColor={sectorColor} />
          )}
        </AnimatePresence>

        {/* Oil & Gas 2D Canvas */}
        {!showWelcome && (
          <OilGas2DCanvas 
            userName={userName}
            userPhone={userPhone}
            userSector={userSector}
            onExit={() => router.push("/leaderboard")}
          />
        )}
      </>
    );
  }

  // Other sectors - use standard canvas
  return <CanvasClient />;
}
