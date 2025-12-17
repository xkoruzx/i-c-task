import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "I/C TASK",
  description: "Task & Attendance Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased bg-cozy-bg text-cozy-text font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
