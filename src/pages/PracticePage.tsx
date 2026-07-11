import { useMemo, useState } from "react";
import type { PracticeSession } from "../types";
import { PRESET_PRACTICE_SKILLS } from "../lib/osats";
import { newId, nowIso } from "../lib/storage";
import { Badge, Button, Card, EmptyState, Input, Label, Select, SectionTitle, TextArea } from "../components/ui";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyDraft(): Omit<PracticeSession, "id" | "createdAt"> {
  return {
    date: todayIso(),
    skill: PRESET_PRACTICE_SKILLS[0],
    durationMinutes: undefined,
    reps: undefined,
    selfScore: 3,
    notes: "",
  };
}

function currentStreakDays(sessions: PracticeSession[]): number {
  const days = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const iso = cursor.toISOString().slice(0, 10);
    if (days.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function PracticePage({
  sessions,
  onAdd,
  onDelete,
}: {
  sessions: PracticeSession[];
  onAdd: (s: PracticeSession) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const sorted = useMemo(() => [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1)), [sessions]);
  const streak = useMemo(() => currentStreakDays(sessions), [sessions]);
  const last30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return sessions.filter((s) => new Date(s.date) >= cutoff);
  }, [sessions]);

  function submit() {
    if (!draft.skill.trim()) return;
    onAdd({ ...draft, id: newId(), createdAt: nowIso() });
    setDraft(emptyDraft());
    setShowForm(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle subtitle="計画的な反復練習(deliberate practice)は技術向上に直結します">練習・トレーニング記録</SectionTitle>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ 練習を記録</Button>}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">連続記録日数</p>
          <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{streak}日</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">直近30日の練習回数</p>
          <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{last30.length}回</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">直近30日の合計時間</p>
          <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">
            {last30.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0)}分
          </p>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>日付</Label>
              <Input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            </div>
            <div>
              <Label>練習内容</Label>
              <Select value={draft.skill} onChange={(e) => setDraft((d) => ({ ...d, skill: e.target.value }))}>
                {PRESET_PRACTICE_SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>時間(分)</Label>
              <Input
                type="number"
                min={0}
                value={draft.durationMinutes ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <Label>反復回数</Label>
              <Input
                type="number"
                min={0}
                value={draft.reps ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, reps: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>自己評価 (1〜5): {draft.selfScore}</Label>
              <input
                type="range"
                min={1}
                max={5}
                value={draft.selfScore}
                onChange={(e) => setDraft((d) => ({ ...d, selfScore: Number(e.target.value) }))}
                className="w-full accent-teal-600"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>気づき・メモ</Label>
              <TextArea rows={2} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              キャンセル
            </Button>
            <Button onClick={submit}>保存する</Button>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="練習記録がありません" description="結紮・縫合の反復練習やシミュレーターでの訓練を記録して、継続を可視化しましょう。" />
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{s.skill}</span>
                    <Badge tone="teal">自己評価 {s.selfScore}/5</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {s.date}
                    {s.durationMinutes ? ` ・ ${s.durationMinutes}分` : ""}
                    {s.reps ? ` ・ ${s.reps}回` : ""}
                  </p>
                  {s.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.notes}</p>}
                </div>
                <Button variant="danger" onClick={() => onDelete(s.id)}>
                  削除
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
