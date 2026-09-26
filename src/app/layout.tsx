import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_NAME, SHOW_JEWELLERY, SHOW_BLOCKPRINT } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  weight: "variable",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const scopeDescription =
  SHOW_JEWELLERY && SHOW_BLOCKPRINT
    ? "two AI design tools for Indian fashion brands — a jewellery design studio and a block-print studio"
    : SHOW_JEWELLERY
    ? "an AI jewellery design studio for Indian fashion brands"
    : "an AI block-print design studio for Indian fashion brands";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Concept Demo`,
  description: `A concept demo: ${scopeDescription} — from idea to a feasibility check, in minutes.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf5ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
