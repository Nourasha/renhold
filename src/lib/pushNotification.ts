// src/lib/pushNotification.ts
import webpush from "web-push";
import { prisma } from "./prisma";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@example.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

const APP_URL = process.env.NEXTAUTH_URL || "";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToAll(payload: PushPayload, excludeUserId?: string) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: excludeUserId ? { userId: { not: excludeUserId } } : {},
  });

  // Use full URL so SW doesn't need to guess origin
  const fullPayload = {
    ...payload,
    url: payload.url ? `${APP_URL}${payload.url}` : `${APP_URL}/dashboard`,
  };

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(fullPayload)
      )
    )
  );

  const expired = subscriptions.filter((_, i) => results[i].status === "rejected");
  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expired.map((s) => s.endpoint) } },
    });
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const fullPayload = {
    ...payload,
    url: payload.url ? `${APP_URL}${payload.url}` : `${APP_URL}/dashboard`,
  };

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(fullPayload)
      )
    )
  );
}
