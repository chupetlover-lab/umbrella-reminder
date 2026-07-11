import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "消化器外科 論文ダイジェスト",
  description:
    "PubMedなどから消化器外科領域のインパクトの強い最新論文を毎日自動収集し、日本語要約と自動生成インフォグラフィックで紹介するダイジェストアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
          本サイトは研究・情報共有を目的とした自動要約であり、診療方針の決定は必ず一次情報(原著論文)と専門家の判断に基づいて行ってください。
        </footer>
      </body>
    </html>
  );
}
