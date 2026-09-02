import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
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
  title: "Roll Call",
  description: "Attendance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable}`}>
      <body className="bg-ink min-h-screen font-body text-ink">{children}</body>
    </html>
  );
}
