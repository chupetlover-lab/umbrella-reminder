import Link from "next/link";
import { getAllDigestDates, getDigestByDate, formatDateJa } from "@/lib/digest";

export default function ArchivePage() {
  const dates = getAllDigestDates();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">過去のダイジェスト</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        日ごとのダイジェストを一覧できます。
      </p>

      {dates.length === 0 ? (
        <p className="mt-8 text-slate-500">まだ記録がありません。</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {dates.map((date) => {
            const digest = getDigestByDate(date);
            return (
              <li key={date}>
                <Link
                  href={`/archive/${date}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div>
                    <p className="font-medium">{formatDateJa(date)}</p>
                    <p className="text-xs text-slate-500">{digest?.papers.length ?? 0} 件の論文</p>
                  </div>
                  <span className="text-slate-400">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
