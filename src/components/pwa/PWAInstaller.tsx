"use client";

import { useEffect } from "react";

/**
 * Handles Service Worker registration for PWA functionality.
 * This is required for the "Install App" prompt to trigger on mobile devices.
 */
export function PWAInstaller() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ZiCash PWA Core: Active", registration.scope);
          })
          .catch((err) => {
            console.error("ZiCash PWA Core: Offline", err);
          });
      });
    }
  }, []);

  return null;
}
