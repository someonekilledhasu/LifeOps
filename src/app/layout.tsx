import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { BotanicalBackground } from "@/components/botanical-background";
import { CustomCursor } from "@/components/custom-cursor";import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LifeOps", template: "%s | LifeOps" },
  description: "The AI that handles the annoying decisions you make every day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
<BotanicalBackground />
        <CustomCursor />        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
