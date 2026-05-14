import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: ` try {
              var mode = localStorage.getItem("theme-mode");
              document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");
            } catch (_) {
              document.documentElement.setAttribute("data-theme", "light");
            }`,
          }}
        ></Script>
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
