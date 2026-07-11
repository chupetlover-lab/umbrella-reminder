import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import type { PracticeSession, SurgicalCase } from "../types";
import { OSATS_DOMAINS, averageScore } from "../lib/osats";
import { Card, EmptyState, SectionTitle } from "../components/ui";

const COLOR_SERIES_1 = "#2a78d6"; // blue - categorical slot 1 / sequential hue
const COLOR_SERIES_2 = "#1baf7a"; // aqua - categorical slot 2
const COLOR_GRID = "#e1e0d9";
const COLOR_AXIS = "#c3c2b7";
const COLOR_MUTED = "#898781";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </Card>
  );
}

export function DashboardPage({ cases, sessions }: { cases: SurgicalCase[]; sessions: PracticeSession[] }) {
  const sortedCases = useMemo(() => [...cases].sort((a, b) => (a.date < b.date ? -1 : 1)), [cases]);

  const trendData = useMemo(
    () =>
      sortedCases.map((c) => ({
        date: c.date,
        score: Number(averageScore(c.scores).toFixed(2)),
        label: c.procedureName,
      })),
    [sortedCases],
  );

  const overallAvg = useMemo(() => {
    if (sortedCases.length === 0) return null;
    return sortedCases.reduce((sum, c) => sum + averageScore(c.scores), 0) / sortedCases.length;
  }, [sortedCases]);

  const recentAvg = useMemo(() => {
    const recent = sortedCases.slice(-5);
    if (recent.length === 0) return null;
    return recent.reduce((sum, c) => sum + averageScore(c.scores), 0) / recent.length;
  }, [sortedCases]);

  const radarData = useMemo(() => {
    const recent = sortedCases.slice(-5);
    const earlier = sortedCases.slice(0, Math.max(0, sortedCases.length - 5));
    return OSATS_DOMAINS.map((d) => {
      const recentVal = recent.length ? recent.reduce((s, c) => s + c.scores[d.key], 0) / recent.length : 0;
      const earlierVal = earlier.length ? earlier.reduce((s, c) => s + c.scores[d.key], 0) / earlier.length : 0;
      return { domain: d.label, 直近5件: Number(recentVal.toFixed(2)), それ以前: Number(earlierVal.toFixed(2)) };
    });
  }, [sortedCases]);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cases) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return [...counts.entries()].map(([category, count]) => ({ category, count }));
  }, [cases]);

  const weeklyPractice = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + (s.durationMinutes ?? 0));
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([week, minutes]) => ({ week, minutes }));
  }, [sessions]);

  if (cases.length === 0 && sessions.length === 0) {
    return (
      <div>
        <SectionTitle subtitle="症例と練習を記録すると、ここに推移が表示されます">進捗ダッシュボード</SectionTitle>
        <EmptyState title="データがまだありません" description="「症例ログ」や「練習記録」からデータを追加すると、技術の推移がグラフで確認できます。" />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle subtitle="技術評価と練習の推移を俯瞰します">進捗ダッシュボード</SectionTitle>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="記録症例数" value={`${cases.length}件`} />
        <StatTile label="全期間 平均スコア" value={overallAvg ? overallAvg.toFixed(2) : "—"} sub="/ 5.0" />
        <StatTile
          label="直近5件 平均スコア"
          value={recentAvg ? recentAvg.toFixed(2) : "—"}
          sub={overallAvg && recentAvg ? (recentAvg >= overallAvg ? "▲ 全期間平均以上" : "▽ 全期間平均以下") : undefined}
        />
        <StatTile label="練習セッション数" value={`${sessions.length}回`} />
      </div>

      {cases.length > 0 && (
        <Card className="mb-6 p-5">
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">総合スコアの推移(症例ごと)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ left: -10, right: 10, top: 10 }}>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLOR_MUTED }} stroke={COLOR_AXIS} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: COLOR_MUTED }} stroke={COLOR_AXIS} width={30} />
              <Tooltip
                formatter={(value) => [value, "平均スコア"]}
                labelFormatter={(label, payload) => `${label} ${payload?.[0]?.payload?.label ?? ""}`}
              />
              <Line type="monotone" dataKey="score" name="平均スコア" stroke={COLOR_SERIES_1} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {cases.length > 0 && (
        <Card className="mb-6 p-5">
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">領域別スキルプロファイル(直近5件 vs それ以前)</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius={110}>
              <PolarGrid stroke={COLOR_GRID} />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: COLOR_MUTED }} />
              <Radar name="それ以前" dataKey="それ以前" stroke={COLOR_SERIES_2} fill={COLOR_SERIES_2} fillOpacity={0.15} strokeWidth={2} />
              <Radar name="直近5件" dataKey="直近5件" stroke={COLOR_SERIES_1} fill={COLOR_SERIES_1} fillOpacity={0.25} strokeWidth={2} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {categoryData.length > 0 && (
          <Card className="p-5">
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">分野別 症例数</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke={COLOR_GRID} vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: COLOR_MUTED }} stroke={COLOR_AXIS} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLOR_MUTED }} stroke={COLOR_AXIS} width={30} />
                <Tooltip formatter={(value) => [value, "症例数"]} />
                <Bar dataKey="count" name="症例数" fill={COLOR_SERIES_1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {weeklyPractice.length > 0 && (
          <Card className="p-5">
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">週別 練習時間(直近8週)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyPractice} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke={COLOR_GRID} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: COLOR_MUTED }} stroke={COLOR_AXIS} />
                <YAxis tick={{ fontSize: 11, fill: COLOR_MUTED }} stroke={COLOR_AXIS} width={30} />
                <Tooltip formatter={(value) => [`${value}分`, "練習時間"]} />
                <Bar dataKey="minutes" name="練習時間(分)" fill={COLOR_SERIES_2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
