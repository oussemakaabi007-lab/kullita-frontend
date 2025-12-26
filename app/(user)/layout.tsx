import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AudioProvider } from "@/app/components/AudioPlayerProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kullita",
  description: "Kullita music app",
  openGraph: {
    title: "Kullita",
    description: "hello this is kullita.",
    url: "https://kullita-frontend.vercel.app",
    siteName: "Kullita",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Kullita Music Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
        <AudioProvider>
        {children}
        </AudioProvider>
      
  );
}
