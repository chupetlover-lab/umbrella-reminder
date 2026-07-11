import { useEffect, useRef, useState } from "react";
import type { AppData, Goal, PracticeSession, SurgicalCase } from "./types";
import {
  exportAllDataAsJson,
  importAllData,
  loadCases,
  loadGoals,
  loadPracticeSessions,
  saveCases,
  saveGoals,
  savePracticeSessions,
} from "./lib/storage";
import { Button } from "./components/ui";
import { CasesPage } from "./pages/CasesPage";
import { PracticePage } from "./pages/PracticePage";
import { DashboardPage } from "./pages/DashboardPage";
import { GoalsPage } from "./pages/GoalsPage";

type Tab = "dashboard" | "cases" | "practice" | "goals";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "ダッシュボード" },
  { key: "cases", label: "症例ログ" },
  { key: "practice", label: "練習記録" },
  { key: "goals", label: "目標" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cases, setCases] = useState<SurgicalCase[]>(() => loadCases());
  const [sessions, setSessions] = useState<PracticeSession[]>(() => loadPracticeSessions());
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveCases(cases), [cases]);
  useEffect(() => savePracticeSessions(sessions), [sessions]);
  useEffect(() => saveGoals(goals), [goals]);

  function handleExport() {
    const blob = new Blob([exportAllDataAsJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `surgical-skills-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as AppData;
      importAllData(data);
      setCases(data.cases ?? []);
      setSessions(data.practiceSessions ?? []);
      setGoals(data.goals ?? []);
    } catch {
      alert("ファイルの読み込みに失敗しました。正しいバックアップファイルか確認してください。");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Surgical Skill Tracker</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">外科医のための手術技術振り返り・トレーニング記録アプリ</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            <Button variant="secondary" onClick={handleImportClick}>
              インポート
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              バックアップ書き出し
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "dashboard" && <DashboardPage cases={cases} sessions={sessions} />}
        {tab === "cases" && (
          <CasesPage
            cases={cases}
            onAdd={(c) => setCases((prev) => [...prev, c])}
            onUpdate={(c) => setCases((prev) => prev.map((x) => (x.id === c.id ? c : x)))}
            onDelete={(id) => {
              if (confirm("この症例記録を削除しますか?")) setCases((prev) => prev.filter((x) => x.id !== id));
            }}
          />
        )}
        {tab === "practice" && (
          <PracticePage
            sessions={sessions}
            onAdd={(s) => setSessions((prev) => [...prev, s])}
            onDelete={(id) => {
              if (confirm("この練習記録を削除しますか?")) setSessions((prev) => prev.filter((x) => x.id !== id));
            }}
          />
        )}
        {tab === "goals" && (
          <GoalsPage
            goals={goals}
            onAdd={(g) => setGoals((prev) => [...prev, g])}
            onUpdate={(g) => setGoals((prev) => prev.map((x) => (x.id === g.id ? g : x)))}
            onDelete={(id) => {
              if (confirm("この目標を削除しますか?")) setGoals((prev) => prev.filter((x) => x.id !== id));
            }}
          />
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        データはこの端末のブラウザ内にのみ保存されます。患者を特定できる情報は入力しないでください。定期的に「バックアップ書き出し」で保存することをおすすめします。
      </footer>
    </div>
  );
}
