"use client";

import { useEffect, useState } from "react";
import { PWAInstallBanner } from "./PWAInstallBanner";

/**
 * PWA Registration & Install Handler
 * Manages the silent Service Worker registration and catches the install prompt.
 */
export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
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

    // 2. Catch Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log("ZiCash PWA: Install Prompt Stashed");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
      console.log("ZiCash PWA: Successfully Installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`ZiCash PWA: User response to install - ${outcome}`);
    
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
