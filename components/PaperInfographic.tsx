import type { StructuredFindings } from "@/lib/types";
import { OrganGlyph, ApproachGlyph, TrendGlyph, TREND_STYLE } from "@/lib/icons";

export default function PaperInfographic({
  structured,
  compact = false,
}: {
  structured: StructuredFindings;
  compact?: boolean;
}) {
  const trendStyle = TREND_STYLE[structured.trend];

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 ${
        compact ? "" : "sm:gap-5 sm:p-5"
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <OrganGlyph organ={structured.organ} size={compact ? 48 : 64} />
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {structured.organ ?? "部位不明"}
        </span>
      </div>

      <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-slate-300 dark:text-slate-600">
        <path d="M2 10h14M11 4l6 6l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="flex flex-col items-center gap-1">
        <ApproachGlyph approach={structured.approach} size={compact ? 40 : 52} />
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {structured.approach ?? "術式不明"}
        </span>
      </div>

      <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-slate-300 dark:text-slate-600">
        <path d="M2 10h14M11 4l6 6l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div
        className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-center"
        style={{ backgroundColor: trendStyle.bg }}
      >
        <div className="flex items-center gap-1">
          <TrendGlyph trend={structured.trend} size={compact ? 18 : 22} />
          <span className="text-xs font-semibold" style={{ color: trendStyle.color }}>
            {structured.statHighlight ?? trendStyle.label}
          </span>
        </div>
        {!compact && structured.sampleSize && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            n = {structured.sampleSize.toLocaleString("ja-JP")}
          </span>
        )}
      </div>
    </div>
  );
}
