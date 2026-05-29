"use client";

import { useEffect, useState } from "react";
import { PWAInstallBanner } from "./PWAInstallBanner";

/**
 * ZiCash PWA Core Installer
 * Captures native browser install prompts and stashes for custom UI triggering.
 */
export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Service Worker Registration (Production Protocol)
    if ("serviceWorker" in navigator) {
      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          console.log("ZiCash PWA: Service Worker Active. Scope:", registration.scope);
        } catch (error) {
          console.error("ZiCash PWA: Service Worker Registration Failed:", error);
        }
      };

      if (document.readyState === "complete") {
        handleRegister();
      } else {
        window.addEventListener("load", handleRegister);
      }
    }

    // 2. Installability Listener (The "Hard Fix" for Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("ZiCash PWA: Installability detected by browser.");
      // Prevent automatic prompt
      e.preventDefault();
      // Stash event for later use
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log("ZiCash PWA: App successfully installed to local system.");
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
      console.warn("ZiCash PWA: Attempted to trigger install, but prompt is missing.");
      return;
    }
    
    console.log("ZiCash PWA: Triggering native system installation sheet.");
    // Show native prompt
    deferredPrompt.prompt();
    
    // Wait for user outcome
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`ZiCash PWA: User response - ${outcome}`);
    
    // Clear stash
    setDeferredPrompt(null);
  };

  return (
    <>
      {deferredPrompt && (
        <PWAInstallBanner 
          onInstall={handleInstallClick} 
          onDismiss={() => {
            console.log("ZiCash PWA: User dismissed install banner.");
            setDeferredPrompt(null);
          }} 
        />
      )}
    </>
  );
}
