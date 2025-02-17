const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://wngyegxnuzuyvzvliyen.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ3llZ3hudXp1eXZ6dmxpeWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MzQ5NjAsImV4cCI6MjA1NTAxMDk2MH0.70EzqnALbUqc77I-FZupUNmT3GyT8QKdQ-mitTwERm0",
  },
});

module.exports = nextConfig;
