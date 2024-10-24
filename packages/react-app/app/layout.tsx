import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
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
      <body className="flex flex-col min-h-screen bg-nudic">
        <BlockchainProviders>
          <Toaster />
          <Header /> {/* Stays at the top */}
          <main className="flex-grow py-6 max-w-7xl mx-auto w-full sm:px-6 lg:px-8">
            {children} {/* Main content area */}
          </main>
          <Footer /> {/* Stays at the bottom */}
        </BlockchainProviders>
      </body>
    </html>
  );
}
