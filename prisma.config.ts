// prisma.config.ts
// This file is used by Prisma 7+. If you are on Prisma 6.19.0 (pinned in
// package.json) this file is ignored — the url stays in schema.prisma.
// If npm ever upgrades you to Prisma 7, this file takes over.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
