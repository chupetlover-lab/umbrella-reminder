import Link from "next/link";
import type { PaperEntry } from "@/lib/types";
import PaperInfographic from "./PaperInfographic";
import TierBadge from "./TierBadge";

export default function PaperCard({ paper, rank }: { paper: PaperEntry; rank: number }) {
  return (
    <Link
      href={`/paper/${encodeURIComponent(paper.id)}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
            {rank}
          </span>
          <TierBadge tier={paper.journalTier} />
          {paper.isSample && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              サンプル
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-slate-400">{paper.pubDate}</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900 group-hover:underline dark:text-slate-50">
        {paper.title_ja}
      </h2>
      <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">{paper.journal}</p>

      <div className="mt-4">
        <PaperInfographic structured={paper.structured} compact />
      </div>

      <ul className="mt-4 space-y-1.5">
        {paper.summary_ja.slice(0, 3).map((line, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
