import type { Metadata } from "next";
import {IBM_Plex_Sans} from "next/font/google";
import "./globals.css";
import { ClerkProvider} from "@clerk/nextjs";
import { Analytics } from '@vercel/analytics/react';


const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "GenCable",
  description: "Ai powered image generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/"} appearance={{variables:{colorPrimary: '#624cf5'}}}>
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable}  antialiased`}
      >
  
        
        {children}
        <Analytics />
      </body>
    </html>
    </ClerkProvider>
  );
}
