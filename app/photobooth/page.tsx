"use client";

import { useEffect, useState } from "react";
import { ThankYouPhotobooth } from "@/components/login/ThankYouPhotobooth";
import { getUserDataAsync } from "@/lib/utils";

export default function PhotoboothPage() {
  const [userData, setUserData] = useState<{ name: string; educationLevel?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserDataAsync();
        if (data) {
          setUserData({
            name: data.name || "Guest",
            educationLevel: data.educationLevel || "Student",
          });
        } else {
          // Fallback for guests
          setUserData({ name: "Guest", educationLevel: "Student" });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        setUserData({ name: "Guest", educationLevel: "Student" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a1a" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-3"
            style={{
              borderColor: "#FAE45230",
              borderTopColor: "#FAE452",
              animation: "spin 1s linear infinite",
            }}
          />
          <p className="text-sm" style={{ color: "#ffffff60" }}>
            Setting up photobooth...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ThankYouPhotobooth
      userName={userData?.name || "Guest"}
      educationLevel={userData?.educationLevel}
    />
  );
}
