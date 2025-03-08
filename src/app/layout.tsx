import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather Twin",
  description: "Find cities with climates matching your own!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
