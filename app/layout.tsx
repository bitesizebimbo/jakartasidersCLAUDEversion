import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIRAL / GEM — Jakarta Food Discovery",
  description:
    "Discover what Jakarta is talking about, and what it hasn't discovered yet. Viral spots and hidden gems across Jakarta, mapped.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex h-full min-h-full flex-col overflow-hidden bg-off-white text-ink">
        <Providers>
          <div className="relative flex min-h-0 flex-1 flex-col pb-16">{children}</div>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
