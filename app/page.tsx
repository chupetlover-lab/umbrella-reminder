import Link from "next/link";
import { getLatestDigest, formatDateJa } from "@/lib/digest";
import PaperCard from "@/components/PaperCard";

export default function Home() {
  const digest = getLatestDigest();

  if (!digest || digest.papers.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">まだダイジェストがありません</h1>
        <p className="mt-2 text-slate-500">
          <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">npm run fetch-digest</code>{" "}
          を実行するか、GitHub Actions の日次ジョブが初回実行されると表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-sky-600 dark:text-sky-400">{formatDateJa(digest.date)}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          今日の消化器外科 論文ダイジェスト
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          PubMed から収集した消化器外科関連の新着論文を、掲載誌のティアと新着度から算出したインパクトスコア順に掲載しています。各カードのアイコン図は論文の要旨を自動解析して生成した簡易インフォグラフィックです。
        </p>
        {digest.isSample && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            ⚠️ これはレイアウト確認用の<strong>サンプルデータ</strong>です。実際の論文ではありません。
            <code className="mx-1 rounded bg-white/60 px-1 dark:bg-black/30">npm run fetch-digest</code>
            を実行するか GitHub Actions の日次ジョブが動くと、実データに置き換わります。
          </div>
        )}
      </div>

      <div className="space-y-4">
        {digest.papers.map((paper, i) => (
          <PaperCard key={paper.id} paper={paper} rank={i + 1} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/archive" className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
          過去のダイジェストを見る →
        </Link>
      </div>
    </div>
  );
}
