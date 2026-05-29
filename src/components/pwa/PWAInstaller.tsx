"use client";

import { useEffect, useState } from "react";
import { PWAInstallBanner } from "./PWAInstallBanner";

/**
 * PWA Registration & Native Install Handler
 * Capture the browser's beforeinstallprompt to trigger the native installation UI.
 */
export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Service Worker Registration
    if ("serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          console.log("ZiCash PWA: Service Worker registered. Scope:", registration.scope);
        } catch (error) {
          console.error("ZiCash PWA: Service Worker registration failed:", error);
        }
      };

      // Register on window load
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 2. Installability Listener (Native Browser Event)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("ZiCash PWA: Native install capability detected (beforeinstallprompt fired)");
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered by our custom button later.
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log("ZiCash PWA: App successfully installed to Home Screen");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn("ZiCash PWA: Install trigger requested but no prompt stashed.");
      return;
    }
    
    console.log("ZiCash PWA: Initiating browser-native install dialog");
    // Show the browser's native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`ZiCash PWA: Native dialog response - ${outcome}`);
    
    // Clear the stashed prompt
    setDeferredPrompt(null);
  };

  return (
    <>
      {deferredPrompt && (
        <PWAInstallBanner onInstall={handleInstallClick} onDismiss={() => setDeferredPrompt(null)} />
      )}
    </>
  );
}