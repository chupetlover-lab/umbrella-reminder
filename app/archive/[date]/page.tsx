import { notFound } from "next/navigation";
import { getAllDigestDates, getDigestByDate, formatDateJa } from "@/lib/digest";
import PaperCard from "@/components/PaperCard";

export function generateStaticParams() {
  return getAllDigestDates().map((date) => ({ date }));
}

export default async function ArchiveDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const digest = getDigestByDate(date);
  if (!digest) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-sky-600 dark:text-sky-400">{formatDateJa(digest.date)}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">論文ダイジェスト</h1>

      <div className="mt-6 space-y-4">
        {digest.papers.map((paper, i) => (
          <PaperCard key={paper.id} paper={paper} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
