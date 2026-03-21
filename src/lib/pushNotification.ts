// src/lib/pushNotification.ts
import webpush from "web-push";
import { prisma } from "./prisma";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@example.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushToAll(payload: PushPayload, excludeUserId?: string) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: excludeUserId ? { userId: { not: excludeUserId } } : {},
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Remove expired/invalid subscriptions
  const expired = subscriptions.filter((_, i) => {
    const result = results[i];
    return result.status === "rejected";
  });

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

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
}
