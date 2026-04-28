import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string; //  for navigation
  variant?: "default" | "cta" | "outline";
}

export default function Button({
  children,
  className = "",
  href,
  variant = "default",
}: ButtonProps) {
  const baseClasses =
    "inline-block px-6 py-3 rounded-lg font-medium transition";

  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    cta: "bg-blue-600 text-white shadow-lg hover:bg-blue-700", // CTA  blue
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
