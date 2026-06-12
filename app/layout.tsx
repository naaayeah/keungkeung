import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sillage — 추구미로 찾는 향수",
  description: "추구미 이미지를 올리면 AI가 딱 맞는 향수를 골라드려요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#F4F5F7] min-h-screen">
        {children}
      </body>
    </html>
  );
}
