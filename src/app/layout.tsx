import "./globals.css";
import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { SidebarProvider } from "@/components/layout/SidebarContext";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import NavbarFooterWrapper from "@/components/layout/NavbarFooterWrapper";
import ThemeInitializer from "@/components/providers/ThemeInitializer";

export const metadata: Metadata = {
  title: "Khidmati | Services Marketplace",
  description: "Find trusted service providers using AI-powered matching.",
  icons: { icon: "/background_removal.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <SessionProviderWrapper>
          <ThemeInitializer />
          <SidebarProvider>
            <NavbarFooterWrapper>{children}</NavbarFooterWrapper>
          </SidebarProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
