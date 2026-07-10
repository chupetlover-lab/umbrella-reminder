import { useMemo, useState } from "react";
import type { Goal, GoalStatus } from "../types";
import { newId, nowIso } from "../lib/storage";
import { Badge, Button, Card, EmptyState, Input, Label, Select, SectionTitle, TextArea } from "../components/ui";

const STATUSES: GoalStatus[] = ["進行中", "達成", "中止"];

function emptyDraft(): Omit<Goal, "id" | "createdAt" | "updatedAt"> {
  return { title: "", targetDate: "", metric: "", status: "進行中", progressNotes: "" };
}

export function GoalsPage({
  goals,
  onAdd,
  onUpdate,
  onDelete,
}: {
  goals: Goal[];
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const sorted = useMemo(
    () => [...goals].sort((a, b) => (a.status === "進行中" ? -1 : 1) - (b.status === "進行中" ? -1 : 1)),
    [goals],
  );

  function submit() {
    if (!draft.title.trim()) return;
    onAdd({ ...draft, id: newId(), createdAt: nowIso(), updatedAt: nowIso() });
    setDraft(emptyDraft());
    setShowForm(false);
  }

  function cycleStatus(g: Goal) {
    const idx = STATUSES.indexOf(g.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    onUpdate({ ...g, status: next, updatedAt: nowIso() });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle subtitle="具体的で測定可能な技術目標を設定し、症例・練習ログと連動させて振り返ります">目標</SectionTitle>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ 目標を追加</Button>}
      </div>

      {showForm && (
        <Card className="mb-6 p-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>目標</Label>
              <Input
                placeholder="例: 腹腔鏡下胆嚢摘出術のOSATS総合評価を平均4.0以上にする"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>達成目標日 (任意)</Label>
                <Input type="date" value={draft.targetDate} onChange={(e) => setDraft((d) => ({ ...d, targetDate: e.target.value }))} />
              </div>
              <div>
                <Label>状態</Label>
                <Select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as GoalStatus }))}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>達成基準 (どう測るか)</Label>
              <Input
                placeholder="例: 直近5件の平均スコアで判定"
                value={draft.metric}
                onChange={(e) => setDraft((d) => ({ ...d, metric: e.target.value }))}
              />
            </div>
            <div>
              <Label>進捗メモ</Label>
              <TextArea rows={2} value={draft.progressNotes} onChange={(e) => setDraft((d) => ({ ...d, progressNotes: e.target.value }))} />
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
        <EmptyState title="目標が設定されていません" description="達成したい技術目標を1つ設定すると、日々の記録に方向性が生まれます。" />
      ) : (
        <div className="space-y-3">
          {sorted.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{g.title}</span>
                    <button onClick={() => cycleStatus(g)}>
                      <Badge tone={g.status === "達成" ? "teal" : g.status === "中止" ? "red" : "amber"}>{g.status}</Badge>
                    </button>
                  </div>
                  {g.metric && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">達成基準: {g.metric}</p>}
                  {g.targetDate && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">目標日: {g.targetDate}</p>}
                  {g.progressNotes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{g.progressNotes}</p>}
                </div>
                <Button variant="danger" onClick={() => onDelete(g.id)}>
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
