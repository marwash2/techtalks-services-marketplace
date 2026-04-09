
import "./globals.css"; 
// Imports global styles (Tailwind, resets, etc.)

import type { Metadata } from "next"; 
// Used to define SEO metadata (title, description)


import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Prevents Font Awesome from adding CSS automatically (avoids conflicts)
config.autoAddCss = false;

// Import your global components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


// Metadata (SEO + browser title)
export const metadata: Metadata = {
  title: "Matchify | Services Marketplace",
  description:
    "Find trusted service providers using AI-powered matching. Compare, choose, and book easily.",
};


// Root Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body className="bg-gray-50 text-gray-900">
        {/* Global body styling (background + text color) */}

        {/* NAVBAR (appears on ALL pages) */}
        <Navbar />

        {/* MAIN CONTENT */}
        <main className="min-h-screen px-4 md:px-6 lg:px-8">
        {
          /*
            The `children` prop is where the content of each page will be rendered.
            When you navigate to a page, its content gets injected here.
          */
        }
          {children}
        </main>

        {/* FOOTER (appears on ALL pages) */}
        <Footer />

      </body>
    </html>
  );
}