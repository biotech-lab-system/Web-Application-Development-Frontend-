import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Helix Lab", template: "%s | Helix Lab" },
  description: "Modern laboratory management workspace for biotechnology teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><AuthProvider>{children}</AuthProvider></body></html>;
}
