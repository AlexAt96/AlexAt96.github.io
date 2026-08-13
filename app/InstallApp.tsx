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

export default function InstallApp() {
  const [installPrompt,setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showSafariHelp,setShowSafariHelp] = useState(false);
  const [isMacSafari,setIsMacSafari] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || Boolean((navigator as StandaloneNavigator).standalone);

    if (isStandalone) return;

    const macSafari = /Macintosh/.test(navigator.userAgent)
      && /Safari/.test(navigator.userAgent)
      && !/(Chrome|Chromium|CriOS|Edg)/.test(navigator.userAgent);
    const safariTimer = window.setTimeout(() => setIsMacSafari(macSafari),0);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleInstallPrompt = (event:Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsMacSafari(false);
    };

    window.addEventListener("beforeinstallprompt",handleInstallPrompt);
    window.addEventListener("appinstalled",handleInstalled);
    return () => {
      window.clearTimeout(safariTimer);
      window.removeEventListener("beforeinstallprompt",handleInstallPrompt);
      window.removeEventListener("appinstalled",handleInstalled);
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

  return (
    <>
      <button className="aa-install-app" type="button" onClick={install} aria-haspopup={isMacSafari ? "dialog" : undefined}>
        <Image src="/favicon.svg" alt="" width="32" height="32" />
        <span>
          <strong>{isMacSafari ? "Add this tool to your Dock" : "Install this tool"}</strong>
          <small>{isMacSafari ? "Open it like a Mac app" : "Then pin it to your taskbar"}</small>
        </span>
        <b aria-hidden="true">{isMacSafari ? "↗" : "↓"}</b>
      </button>

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
            <button type="button" onClick={() => setShowSafariHelp(false)} autoFocus>Got it</button>
          </section>
        </div>
      ) : null}
    </>
  );
}
