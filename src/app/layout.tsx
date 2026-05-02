import "./globals.css";
import type { Metadata } from "next";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/layout/SidebarContext";

// Import wrapper (NOT SessionProvider directly)
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Khidmati | Services Marketplace",
  description: "Find trusted service providers using AI-powered matching.",
  icons: {
    icon: "/background_removal.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 ">
        {/* Client wrapper inside server layout */}
        <SessionProviderWrapper>
          <SidebarProvider>
            <Navbar />

            <main className="bg-white ">{children}</main>

            <Footer />
          </SidebarProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
