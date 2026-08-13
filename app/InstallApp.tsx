"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome:"accepted" | "dismissed"; platform:string }>;
}

interface StandaloneNavigator extends Navigator {
  standalone?: boolean;
}

const INSTALL_PROMPT_DISMISSED_KEY = "aa-portfolio-install-prompt-dismissed";

export default function InstallApp() {
  const [installPrompt,setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showSafariHelp,setShowSafariHelp] = useState(false);
  const [isMacSafari,setIsMacSafari] = useState(false);

  useEffect(() => {
    const standaloneQueries = ["standalone","fullscreen","minimal-ui"]
      .map((mode) => window.matchMedia(`(display-mode: ${mode})`));
    const isStandalone = () => standaloneQueries.some((query) => query.matches)
      || Boolean((navigator as StandaloneNavigator).standalone);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if (isStandalone()) return;

    try {
      if (window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "true") return;
    } catch {
      // The prompt can still work when private browsing blocks local storage.
    }

    const macSafari = /Macintosh/.test(navigator.userAgent)
      && /Safari/.test(navigator.userAgent)
      && !/(Chrome|Chromium|CriOS|Edg)/.test(navigator.userAgent);
    const safariTimer = window.setTimeout(() => setIsMacSafari(macSafari),0);

    const handleInstallPrompt = (event:Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      try {
        window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY,"true");
      } catch {
        // The standalone display-mode check remains the primary safeguard.
      }
      setInstallPrompt(null);
      setIsMacSafari(false);
    };
    const handleDisplayModeChange = () => {
      if (isStandalone()) handleInstalled();
    };

    window.addEventListener("beforeinstallprompt",handleInstallPrompt);
    window.addEventListener("appinstalled",handleInstalled);
    standaloneQueries.forEach((query) => query.addEventListener("change",handleDisplayModeChange));
    return () => {
      window.clearTimeout(safariTimer);
      window.removeEventListener("beforeinstallprompt",handleInstallPrompt);
      window.removeEventListener("appinstalled",handleInstalled);
      standaloneQueries.forEach((query) => query.removeEventListener("change",handleDisplayModeChange));
    };
  },[]);

  if (!installPrompt && !isMacSafari) return null;

  const install = async () => {
    if (!installPrompt) {
      setShowSafariHelp(true);
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismissInstallPrompt = () => {
    try {
      window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY,"true");
    } catch {
      // Hiding still works for this visit if storage is unavailable.
    }
    setShowSafariHelp(false);
    setInstallPrompt(null);
    setIsMacSafari(false);
  };

  return (
    <>
      <aside className="aa-install-card" aria-label="Install AA Portfolio">
        <button className="aa-install-app" type="button" onClick={install} aria-haspopup={isMacSafari ? "dialog" : undefined}>
          <Image src="/favicon.svg" alt="" width="32" height="32" />
          <span>
            <strong>{isMacSafari ? "Add this tool to your Dock" : "Install this tool"}</strong>
            <small>{isMacSafari ? "Open it like a Mac app" : "Then pin it to your taskbar"}</small>
          </span>
          <b aria-hidden="true">{isMacSafari ? "↗" : "↓"}</b>
        </button>
        <button
          className="aa-install-dismiss"
          type="button"
          onClick={dismissInstallPrompt}
          aria-label="Already installed — hide this prompt"
          title="Already installed"
        >
          ×
        </button>
      </aside>

      {showSafariHelp ? (
        <div className="aa-install-help-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSafariHelp(false);
        }}>
          <section className="aa-install-help" role="dialog" aria-modal="true" aria-labelledby="aa-install-help-title">
            <Image src="/icons/app-icon-maskable-192.png" alt="" width="54" height="54" />
            <div>
              <small>SAFARI FOR MAC</small>
              <h2 id="aa-install-help-title">Add AA Portfolio to your Dock</h2>
              <ol>
                <li>Open the <strong>File</strong> menu at the top of your screen.</li>
                <li>Choose <strong>Add to Dock…</strong></li>
                <li>Select <strong>Add</strong>.</li>
              </ol>
              <p>You’ll then have an AA icon in your Dock that opens the tool like an app.</p>
            </div>
            <button type="button" onClick={dismissInstallPrompt} autoFocus>I’ve added it</button>
          </section>
        </div>
      ) : null}
    </>
  );
}
