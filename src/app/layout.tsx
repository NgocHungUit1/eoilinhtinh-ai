import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EOI Linh Tinh · Đèn in 3D điều khiển bằng cử chỉ",
  description:
    "Vẫy tay trước webcam để lướt qua bộ sưu tập đèn in 3D EOI Linh Tinh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
