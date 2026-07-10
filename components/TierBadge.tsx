import type { JournalTier } from "@/lib/types";

const TIER_STYLE: Record<JournalTier, { label: string; className: string }> = {
  1: { label: "トップジャーナル", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  2: { label: "専門誌", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  3: { label: "一般誌", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

export default function TierBadge({ tier }: { tier: JournalTier }) {
  const s = TIER_STYLE[tier];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
