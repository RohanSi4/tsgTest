import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Tracking Starter",
  description: "Ultra barebones CSV-backed order tracking workshop starter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
