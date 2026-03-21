"use client";
// src/components/PushPermissionBanner.tsx
import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(Array.from(new Uint8Array(buffer)).map((b) => String.fromCharCode(b)).join(""));
}

export function PushPermissionBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") {
      // Already granted — register silently
      registerPush();
      return;
    }
    if (Notification.permission === "denied") return;
    // permission is "default" — show banner
    setShow(true);
  }, []);

  async function registerPush() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await sendToServer(existing);
        return;
      }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await sendToServer(subscription);
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }

  async function sendToServer(subscription: PushSubscription) {
    const key = subscription.getKey("p256dh");
    const auth = subscription.getKey("auth");
    if (!key || !auth) return;

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(key),
          auth: arrayBufferToBase64(auth),
        },
      }),
    });
  }

  async function handleAllow() {
    setLoading(true);
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerPush();
    }
    setShow(false);
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white border border-blue-200 rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Aktiver varsler</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Få beskjed når det registreres nye avvik eller du mottar en melding
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Aktiverer..." : "Tillat varsler"}
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-3 py-1.5 text-gray-500 text-xs rounded-lg hover:bg-gray-100"
            >
              Ikke nå
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
