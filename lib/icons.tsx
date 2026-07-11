import type { Trend } from "./types";

/**
 * 自動生成インフォグラフィック用のアイコン集。
 * 解剖学的な写実表現ではなく、構造化データ(臓器・術式・傾向)を
 * 一目で識別できる抽象化されたピクトグラムとして描画する。
 */

export const ORGAN_STYLES: Record<
  string,
  { label: string; color: string; path: string }
> = {
  "食道": {
    label: "食道",
    color: "#f59e0b",
    path: "M32 4c-4 6 4 10 0 16s4 10 0 16s4 10 0 16",
  },
  "胃": {
    label: "胃",
    color: "#ef4444",
    path: "M20 8c-8 2-14 10-13 20s10 18 22 16c8-1.5 14-8 13-16c-1-7-8-8-9-14c-1-5 -5-8-13-6z",
  },
  "大腸・直腸": {
    label: "大腸・直腸",
    color: "#0ea5e9",
    path: "M8 12h30a10 10 0 0 1 0 20h-6a8 8 0 0 0 0 16h4",
  },
  "肝臓": {
    label: "肝臓",
    color: "#a16207",
    path: "M6 20c2-10 16-14 28-10c10 3.5 16 12 12 20c-4 8-16 10-26 6c-9-3.5-15-9-14-16z",
  },
  "膵臓": {
    label: "膵臓",
    color: "#84cc16",
    path: "M6 26c0-4 6-6 14-6c10 0 22 3 28-2c2 4-2 9-10 11c-8 2-20 1-26 3c-4 1.5-6-2-6-6z",
  },
  "胆道": {
    label: "胆道",
    color: "#22c55e",
    path: "M22 6c6 0 10 4 10 9c0 4-3 6-3 10c6 0 9 4 9 9c0 6-6 10-13 10s-13-4-13-9c0-4 3-6 3-9c-5-1-8-5-8-10c0-6 6-10 15-10z",
  },
  "一般腹部": {
    label: "一般腹部",
    color: "#64748b",
    path: "M8 32c0-14 11-24 24-24s24 10 24 24s-11 20-24 20s-24-6-24-20z",
  },
};

export const APPROACH_STYLES: Record<
  string,
  { label: string; icon: "lap" | "robot" | "open" | "endo" | "none" }
> = {
  "腹腔鏡下": { label: "腹腔鏡下", icon: "lap" },
  "ロボット支援": { label: "ロボット支援", icon: "robot" },
  "開腹": { label: "開腹", icon: "open" },
  "内視鏡的": { label: "内視鏡的", icon: "endo" },
  "非手術": { label: "非手術/内科的", icon: "none" },
};

export function OrganGlyph({ organ, size = 72 }: { organ: string | null; size?: number }) {
  const style = (organ && ORGAN_STYLES[organ]) || ORGAN_STYLES["一般腹部"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={style.label}
      className="shrink-0"
    >
      <circle cx="32" cy="32" r="30" fill={style.color} fillOpacity="0.12" />
      <path
        d={style.path}
        fill="none"
        stroke={style.color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LapIcon({ color }: { color: string }) {
  return (
    <>
      <rect x="28" y="6" width="6" height="30" rx="2" fill={color} />
      <circle cx="31" cy="42" r="8" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="31" cy="42" r="2.5" fill={color} />
    </>
  );
}
function RobotIcon({ color }: { color: string }) {
  return (
    <>
      <circle cx="31" cy="16" r="7" fill="none" stroke={color} strokeWidth="3" />
      <path d="M31 23v8" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M18 44l13-13l13 13" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="44" r="3" fill={color} />
      <circle cx="44" cy="44" r="3" fill={color} />
    </>
  );
}
function OpenIcon({ color }: { color: string }) {
  return (
    <>
      <path d="M12 44 L40 16" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 12 L44 20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M10 46 L16 44 L14 38 Z" fill={color} />
    </>
  );
}
function EndoIcon({ color }: { color: string }) {
  return (
    <>
      <path d="M10 14c10 0 8 10 18 10s8-10 18-10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="14" r="3" fill={color} />
      <path d="M10 14v18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function ApproachGlyph({ approach, size = 56 }: { approach: string | null; size?: number }) {
  const style = (approach && APPROACH_STYLES[approach]) || null;
  const color = "#334155";
  return (
    <svg width={size} height={size} viewBox="0 0 62 62" role="img" aria-label={style?.label ?? "詳細不明"}>
      <rect x="1" y="1" width="60" height="60" rx="14" fill="#f1f5f9" />
      {style?.icon === "lap" && <LapIcon color={color} />}
      {style?.icon === "robot" && <RobotIcon color={color} />}
      {style?.icon === "open" && <OpenIcon color={color} />}
      {style?.icon === "endo" && <EndoIcon color={color} />}
      {(!style || style.icon === "none") && (
        <circle cx="31" cy="31" r="9" fill="none" stroke={color} strokeWidth="3" />
      )}
    </svg>
  );
}

export const TREND_STYLE: Record<Trend, { color: string; bg: string; arrow: string; label: string }> = {
  positive: { color: "#15803d", bg: "#dcfce7", arrow: "M6 18 L14 6 L22 18", label: "良好な結果" },
  negative: { color: "#b91c1c", bg: "#fee2e2", arrow: "M6 6 L14 18 L22 6", label: "注意が必要" },
  neutral: { color: "#475569", bg: "#e2e8f0", arrow: "M6 12 L22 12", label: "中立/差なし" },
};

export function TrendGlyph({ trend, size = 28 }: { trend: Trend; size?: number }) {
  const s = TREND_STYLE[trend];
  return (
    <svg width={size} height={size} viewBox="0 0 28 24" role="img" aria-label={s.label}>
      <path d={s.arrow} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
