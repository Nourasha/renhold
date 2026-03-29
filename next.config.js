/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};
