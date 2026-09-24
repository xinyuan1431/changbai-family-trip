import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "长白山 · 秋日旅行",
  description: "六位家人的共享行程、旅行账本与行前准备。",
  robots: { index: false, follow: false },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
