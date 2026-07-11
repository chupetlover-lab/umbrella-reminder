import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sticky top-0 z-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-50">
            消化器外科 論文ダイジェスト
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
            今日のダイジェスト
          </Link>
          <Link href="/archive" className="hover:text-slate-900 dark:hover:text-white">
            過去の記事
          </Link>
        </nav>
      </div>
    </header>
  );
}
