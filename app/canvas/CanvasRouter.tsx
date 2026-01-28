"use client";

/**
 * CanvasRouter - Routes to appropriate canvas based on sector
 * 
 * - Oil & Gas: Uses OilGas2DCanvas (2D SVG visualization)
 * - HVAC: Uses HVAC2DCanvas (Smart building visualization)
 * - Other sectors: Uses standard CanvasClient (drag-drop experience)
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDataAsync } from "@/lib/utils";
import { CanvasClient } from "./CanvasClientV2";
import { AnimatePresence } from "framer-motion";
import { WelcomeOverlay, SECTOR_COLORS } from "@/components/canvas";
import { OilGas2DCanvas } from "@/components/canvas/OilGas2DCanvas";
import { HVAC2DCanvas } from "@/components/canvas/HVAC2DCanvas";
import { HVACWelcomeOverlay } from "@/components/canvas/HVACWelcomeOverlay";
import { MEP2DCanvas } from "@/components/canvas/MEP2DCanvas";
import { MEPWelcomeOverlay } from "@/components/canvas/MEPWelcomeOverlay";
import Electrical2DCanvas from "@/components/canvas/Electrical2DCanvas";
import ElectricalWelcomeOverlay from "@/components/canvas/ElectricalWelcomeOverlay";
import Process2DCanvas from "@/components/canvas/Process2DCanvas";
import ProcessWelcomeOverlay from "@/components/canvas/ProcessWelcomeOverlay";

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

  // Check if sector is HVAC
  const isHVAC = (sector: string): boolean => {
    const normalized = sector?.toLowerCase().replace(/\s+/g, "");
    return ["hvac", "heating", "ventilation", "airconditioning", "hvac&r"].includes(normalized);
  };

  // Check if sector is MEP
  const isMEP = (sector: string): boolean => {
    const normalized = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
    return ["mep", "mechanicalelectricalplumbing", "mepe", "mepf"].includes(normalized);
  };

  // Check if sector is Electrical
  const isElectrical = (sector: string): boolean => {
    const normalized = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
    return ["electrical", "electric", "powerelectrical", "electricalengineering", "electricalsystems"].includes(normalized);
  };

  // Check if sector is Process
  const isProcess = (sector: string): boolean => {
    const normalized = sector?.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
    return ["process", "processengineering", "chemicalprocess", "distillation", "refinery", "petrochemical"].includes(normalized);
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

  // HVAC sector - use HVAC 2D canvas with HVAC-specific welcome
  if (isHVAC(userSector)) {
    return (
      <>
        {/* HVAC Welcome overlay - Smart building themed */}
        <AnimatePresence>
          {showWelcome && (
            <HVACWelcomeOverlay sector={userSector} sectorColor={sectorColor} />
          )}
        </AnimatePresence>

        {/* HVAC 2D Canvas */}
        {!showWelcome && (
          <HVAC2DCanvas 
            userName={userName}
            userPhone={userPhone}
            userSector={userSector}
            onExit={() => router.push("/leaderboard")}
          />
        )}
      </>
    );
  }

  // MEP sector - use MEP 2D canvas with building cross-section theme
  if (isMEP(userSector)) {
    return (
      <>
        {/* MEP Welcome overlay - Building floor structure themed */}
        <AnimatePresence>
          {showWelcome && (
            <MEPWelcomeOverlay sector={userSector} sectorColor={sectorColor} />
          )}
        </AnimatePresence>

        {/* MEP 2D Canvas */}
        {!showWelcome && (
          <MEP2DCanvas 
            userName={userName}
            userPhone={userPhone}
            userSector={userSector}
            onExit={() => router.push("/leaderboard")}
          />
        )}
      </>
    );
  }

  // Electrical sector - use Electrical 2D canvas with power system theme
  if (isElectrical(userSector)) {
    return (
      <>
        {/* Electrical Welcome overlay - Power system themed */}
        <AnimatePresence>
          {showWelcome && (
            <ElectricalWelcomeOverlay onComplete={() => setShowWelcome(false)} />
          )}
        </AnimatePresence>

        {/* Electrical 2D Canvas */}
        {!showWelcome && (
          <Electrical2DCanvas 
            userName={userName}
            userPhone={userPhone}
            userSector={userSector}
            onExit={() => router.push("/leaderboard")}
          />
        )}
      </>
    );
  }

  // Process sector - use Process 2D canvas with distillation theme
  if (isProcess(userSector)) {
    return (
      <>
        {/* Process Welcome overlay - Distillation themed */}
        <AnimatePresence>
          {showWelcome && (
            <ProcessWelcomeOverlay 
              onComplete={() => setShowWelcome(false)} 
              userName={userName}
            />
          )}
        </AnimatePresence>

        {/* Process 2D Canvas */}
        {!showWelcome && (
          <Process2DCanvas 
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
