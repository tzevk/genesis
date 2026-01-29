"use client";

import { useEffect } from "react";
import { syncPendingBackups, getLocalBackups } from "@/lib/utils";

/**
 * BackupSync component - runs on app initialization
 * Attempts to sync any locally backed up data that failed to save previously
 */
export function BackupSync() {
  useEffect(() => {
    const syncBackups = async () => {
      const backups = getLocalBackups();
      if (backups.length > 0) {
        console.log(`Found ${backups.length} unsaved score(s). Attempting to sync...`);
        const syncedCount = await syncPendingBackups();
        if (syncedCount > 0) {
          console.log(`Successfully synced ${syncedCount} backup(s) to server.`);
        }
        const remaining = getLocalBackups();
        if (remaining.length > 0) {
          console.warn(`${remaining.length} backup(s) still pending. Will retry on next app load.`);
        }
      }
    };

    // Run sync after a short delay to not block initial render
    const timer = setTimeout(syncBackups, 2000);
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
