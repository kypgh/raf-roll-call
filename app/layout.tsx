import type { Metadata, Viewport } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import RouteProgress from "@/components/RouteProgress";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Boo Boo",
  description: "Attendance tracker",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    // "default" keeps the status bar opaque instead of letting content run
    // underneath it -- deliberately avoiding the edge-to-edge look so the
    // phone keeps reserving safe space around the notch and status bar.
    statusBarStyle: "default",
    title: "Boo Boo",
  },
};

export const viewport: Viewport = {
  themeColor: "#241B2F",
  // No viewportFit: "cover" -- that's what would push content under the
  // notch/home-indicator. Leaving it out keeps the safe-area behavior
  // identical to a normal browser tab.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable}`}>
      <body className="bg-ink min-h-screen font-body text-ink">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
