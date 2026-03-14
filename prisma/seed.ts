import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const checklistData = [
  {
    title: "Vaske",
    color: "blue",
    order: 0,
    items: [
      "Presse 1",
      "Rør 1",
      "Presse 2",
      "Rør 2",
      "Presse 3",
      "Rør 3",
      "Tralle tunell",
      "Vaske rør 4",
    ],
  },
  {
    title: "Nybygg",
    color: "green",
    order: 1,
    items: ["Rulle 1", "Rulle 2", "Rulle 3", "Frotte maskiner", "Uren side"],
  },
  {
    title: "Gammelbygg",
    color: "purple",
    order: 2,
    items: ["Rulle 4", "Rulle 5", "Rulle 6", "Frotte maskiner", "Uren side"],
  },
  {
    title: "Finisjering",
    color: "orange",
    order: 3,
    items: ["Finisjering oppe", "Finisjering nede"],
  },
  {
    title: "Tørketromler",
    color: "red",
    order: 4,
    items: [
      "Tørkeloft",
      "Tørketromler NB",
      "Enestående Tørketrommel NB",
      "Enestående Tørketrommel GB",
      "Tørketrommel Vaskerør 4",
    ],
  },
  {
    title: "Uregelmessige Oppgaver",
    color: "yellow",
    order: 5,
    items: [
      "Vaske kinner",
      "Vaske Gulv bak enestående vaskemaskiner",
      "Dispenser 1",
      "Dispenser 4",
      "Dispenser 5",
    ],
  },
];

async function main() {
  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Nour",
        password: hashed,
        role: "admin",
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // Checklist groups and items
  for (const group of checklistData) {
    const exists = await prisma.checklistGroup.findFirst({
      where: { title: group.title },
    });
    if (exists) {
      console.log(`ℹ️  Group exists: ${group.title}`);
      continue;
    }
    await prisma.checklistGroup.create({
      data: {
        title: group.title,
        color: group.color,
        order: group.order,
        items: { create: group.items.map((label, i) => ({ label, order: i })) },
      },
    });
    console.log(`✅ Created group: ${group.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
