"use client";
// src/app/sw-register.tsx
import { useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        console.log("SW registered:", reg.scope);

        // Ask for push permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Subscribe to push
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          // Already subscribed — re-send to server in case it was lost
          await sendSubscriptionToServer(existing);
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await sendSubscriptionToServer(subscription);
      } catch (err) {
        console.error("SW/Push setup failed:", err);
      }
    }

    setup();
  }, []);

  return null;
}

async function sendSubscriptionToServer(subscription: PushSubscription) {
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  if (!key || !auth) return;

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(
          Array.from(new Uint8Array(key))
            .map((b) => String.fromCharCode(b))
            .join(""),
        ),
        auth: btoa(
          Array.from(new Uint8Array(auth))
            .map((b) => String.fromCharCode(b))
            .join(""),
        ),
      },
    }),
  });
}
