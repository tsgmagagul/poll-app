import type React from "react";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "./components/ui/Navbar"; // Import the Navbar component

// Define metadata
export const metadata: Metadata = {
  title: "Quick",
  description: "A simple app to create and manage polls.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/icon2.png", // Add favicon here
  },
};

// Define viewport configuration
export const viewport: Viewport = {
  themeColor: "#ffffff", // Move themeColor here
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar /> {/* Add the Navbar component */}
        {children}
        {/* Footer */}
        <footer className="bg-zinc-800 text-white py-4 text-center">
          <p>&copy; 2025 AI Voting. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}