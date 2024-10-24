import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { BlockchainProviders } from "@/Providers/Blockchainproviders";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

export const metadata: Metadata = {
  title: "HelpStream",
  description: "Streams of charity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-nudic flex flex-col min-h-screen">
        <BlockchainProviders>
          <Toaster />
          <Header /> {/* Stays at the top */}
          <div className="flex-grow py-6 max-w-7xl mx-auto space-y-8 sm:px-6 lg:px-8">
            {children} {/* Main content area */}
          </div>
          <Footer />
          
        </BlockchainProviders>
      </body>
    </html>
  );
}