import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "./components/ui/button"

export const metadata: Metadata = {
  title: "Quick",
  description: "A simple app to create and manage polls.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <head>
        <link rel="icon" href="/images/icon2.png" />
          </head>
        <nav className="flex justify-between items-center p-4 bg-purple-50">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Home
          </Link>
          <div className="flex gap-4">
            <Link className={buttonVariants({ variant: "outline" })} href="/createpoll">
              Create poll
            </Link>
            <Link className={buttonVariants({ variant: "outline" })} href="/viewpoll">
              View Polls
            </Link>
          </div>
        </nav>
        {children}
        {/* Footer */}
        <footer className="bg-zinc-800 text-white py-4 text-center">
          <p>&copy; 2025 AI Voting. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}

