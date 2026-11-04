
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "Komunitas belajar bersama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
