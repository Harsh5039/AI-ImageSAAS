import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs";


const iBMPlex = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: '--font-ibm-plex'
});

export const metadata: Metadata = {
  title: "AI-SAAS",
  description: "SAAS dealing with IMAGES",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables:{colorPrimary:'#624cf5'}
    }}><html lang="en">
    <body className={cn("font-IBMPlex antialiased",iBMPlex.variable)}>
      {children}
      </body>
  </html>
  </ClerkProvider>
    
  );
}
