// __tests__/pushNotification.test.ts
import { sendPushToAll, sendPushToUser } from "@/lib/pushNotification";

// Mock web-push
jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({ statusCode: 201 }),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pushSubscription: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const mockSendNotification = webpush.sendNotification as jest.Mock;
const mockFindMany = prisma.pushSubscription.findMany as jest.Mock;
const mockDeleteMany = prisma.pushSubscription.deleteMany as jest.Mock;

const mockSubscriptions = [
  { id: "1", userId: "user1", endpoint: "https://push.example.com/1", p256dh: "key1", auth: "auth1" },
  { id: "2", userId: "user2", endpoint: "https://push.example.com/2", p256dh: "key2", auth: "auth2" },
  { id: "3", userId: "user3", endpoint: "https://push.example.com/3", p256dh: "key3", auth: "auth3" },
];

const mockPayload = {
  title: "Test varsel",
  body: "Dette er en test",
  url: "/dashboard",
};

describe("sendPushToAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue(mockSubscriptions);
    mockSendNotification.mockResolvedValue({ statusCode: 201 });
  });

  it("sender varsler til alle abonnenter", async () => {
    await sendPushToAll(mockPayload);

    expect(mockFindMany).toHaveBeenCalledWith({ where: {} });
    expect(mockSendNotification).toHaveBeenCalledTimes(3);
  });

  it("ekskluderer avsender når excludeUserId er satt", async () => {
    mockFindMany.mockResolvedValue(mockSubscriptions.filter((s) => s.userId !== "user1"));

    await sendPushToAll(mockPayload, "user1");

    expect(mockFindMany).toHaveBeenCalledWith({ where: { userId: { not: "user1" } } });
    expect(mockSendNotification).toHaveBeenCalledTimes(2);
  });

  it("sender riktig payload til push-tjenesten", async () => {
    mockFindMany.mockResolvedValue([mockSubscriptions[0]]);

    await sendPushToAll(mockPayload);

    expect(mockSendNotification).toHaveBeenCalledWith(
      {
        endpoint: "https://push.example.com/1",
        keys: { p256dh: "key1", auth: "auth1" },
      },
      JSON.stringify(mockPayload)
    );
  });

  it("sletter utgåtte abonnementer ved feil", async () => {
    mockSendNotification
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockRejectedValueOnce(new Error("Subscription expired"))
      .mockResolvedValueOnce({ statusCode: 201 });

    await sendPushToAll(mockPayload);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { endpoint: { in: ["https://push.example.com/2"] } },
    });
  });

  it("gjør ingenting hvis ingen abonnenter finnes", async () => {
    mockFindMany.mockResolvedValue([]);

    await sendPushToAll(mockPayload);

    expect(mockSendNotification).not.toHaveBeenCalled();
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});

describe("sendPushToUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendNotification.mockResolvedValue({ statusCode: 201 });
  });

  it("sender varsel kun til spesifikk bruker", async () => {
    mockFindMany.mockResolvedValue([mockSubscriptions[0]]);

    await sendPushToUser("user1", mockPayload);

    expect(mockFindMany).toHaveBeenCalledWith({ where: { userId: "user1" } });
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
  });

  it("sender til alle enheter hvis bruker har flere", async () => {
    const multipleDevices = [
      { ...mockSubscriptions[0], id: "1a" },
      { ...mockSubscriptions[0], id: "1b", endpoint: "https://push.example.com/1b" },
    ];
    mockFindMany.mockResolvedValue(multipleDevices);

    await sendPushToUser("user1", mockPayload);

    expect(mockSendNotification).toHaveBeenCalledTimes(2);
  });

  it("gjør ingenting hvis bruker ikke har abonnement", async () => {
    mockFindMany.mockResolvedValue([]);

    await sendPushToUser("user1", mockPayload);

    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
