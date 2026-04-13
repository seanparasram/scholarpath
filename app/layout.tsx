import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarPath — Find Scholarships Built for You",
  description:
    "Match with college scholarships based on your profile. AI-powered essay writing assistant included.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
