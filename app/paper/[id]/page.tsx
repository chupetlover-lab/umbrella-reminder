import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDigestDates, getDigestByDate, getPaperById, formatDateJa } from "@/lib/digest";
import PaperInfographic from "@/components/PaperInfographic";
import TierBadge from "@/components/TierBadge";

export function generateStaticParams() {
  const dates = getAllDigestDates();
  const ids: { id: string }[] = [];
  for (const date of dates) {
    const digest = getDigestByDate(date);
    digest?.papers.forEach((p) => ids.push({ id: p.id }));
  }
  return ids;
}

const FIELD_LABELS: Record<string, string> = {
  studyType: "研究デザイン",
  organ: "対象部位",
  procedure: "術式・処置",
  approach: "アプローチ",
  comparison: "比較対象",
};

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = getPaperById(id);
  if (!result) notFound();
  const { paper, date } = result;
  const s = paper.structured;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/archive/${date}`} className="text-sm text-sky-600 hover:underline dark:text-sky-400">
        ← {formatDateJa(date)} のダイジェストに戻る
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TierBadge tier={paper.journalTier} />
        {paper.isSample && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            サンプル(実データではありません)
          </span>
        )}
        <span className="text-xs text-slate-400">{paper.pubDate}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{paper.title_ja}</h1>
      <p className="mt-2 text-sm italic text-slate-500 dark:text-slate-400">
        {paper.journal} ・ {paper.authors.slice(0, 3).join(", ")}
        {paper.authors.length > 3 ? " ほか" : ""}
      </p>
      <p className="mt-1 text-xs text-slate-400">原題: {paper.title_en}</p>

      <div className="mt-6">
        <PaperInfographic structured={s} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(["studyType", "organ", "procedure", "approach", "comparison"] as const).map((key) =>
          s[key] ? (
            <div key={key} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{FIELD_LABELS[key]}</p>
              <p className="mt-1 text-sm font-medium">{s[key]}</p>
            </div>
          ) : null
        )}
        {s.sampleSize && (
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">対象人数</p>
            <p className="mt-1 text-sm font-medium">{s.sampleSize.toLocaleString("ja-JP")} 人</p>
          </div>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">要点</h2>
        <ul className="mt-3 space-y-2">
          {paper.summary_ja.map((line, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-slate-900">
              <span className="mt-0.5 shrink-0 text-sky-500">▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {s.keyFinding && (
        <section className="mt-6 rounded-lg border-l-4 border-sky-400 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
          <p className="font-semibold text-sky-800 dark:text-sky-300">結論</p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">{s.keyFinding}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Abstract(原文)</h2>
        <p className="mt-3 whitespace-pre-line rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          {paper.abstract_en}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
        {!paper.isSample && paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            PubMed で原文を見る →
          </a>
        )}
        <span className="text-xs text-slate-400">
          {paper.translationSource === "llm"
            ? "この要約はAIによる自動翻訳・要約です。"
            : "この要約は簡易的な自動抽出によるものです(AI要約は未生成)。"}
          臨床判断には必ず原著論文をご確認ください。
        </span>
      </div>
    </div>
  );
}
