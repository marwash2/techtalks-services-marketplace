"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import BecomeProviderSection from "@/components/layout/BecomeProvider";
import HeroSection from "@/components/layout/HeroSection";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      return;
    } // if not logged in, stay on homepage

    if (session.user.role === "provider") {
      router.push("/provider/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  }, [session]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <HeroSection />
      <BecomeProviderSection />
      {/*HERO SECTION: title+search*/}
      {/*Categories */}
      {/*featured Services */}
    </div>
  );
}
