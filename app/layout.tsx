import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const zpix = localFont({
  src: "./fonts/zpix.woff2",
  variable: "--font-zpix",
  display: "swap",
});

export const metadata: Metadata = {
  title: "安西 · 失落频率 Lost Frequency",
  description:
    "8-bit cyber-archaeology field terminal — lost signals from the Parallel Tang Dynasty Anxi Protectorate, 640–808 AD",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body className={zpix.variable}>{children}</body>
    </html>
  );
}
