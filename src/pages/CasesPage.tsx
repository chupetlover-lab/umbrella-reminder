import { useMemo, useState } from "react";
import type { OsatsScores, Role, SurgicalCase } from "../types";
import { emptyOsatsScores } from "../types";
import { OSATS_DOMAINS, PRESET_PROCEDURE_CATEGORIES, averageScore } from "../lib/osats";
import { newId, nowIso } from "../lib/storage";
import { Badge, Button, Card, EmptyState, Input, Label, Select, SectionTitle, TextArea } from "../components/ui";
import { ScoreSlider } from "../components/ScoreSlider";

const ROLES: Role[] = ["執刀", "指導執刀", "助手", "見学"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyDraft(): Omit<SurgicalCase, "id" | "createdAt" | "updatedAt"> {
  return {
    date: todayIso(),
    procedureName: "",
    category: PRESET_PROCEDURE_CATEGORIES[0],
    role: "執刀",
    durationMinutes: undefined,
    scores: emptyOsatsScores(),
    complications: "なし",
    reflectionGood: "",
    reflectionImprove: "",
    nextAction: "",
    notes: "",
  };
}

export function CasesPage({
  cases,
  onAdd,
  onUpdate,
  onDelete,
}: {
  cases: SurgicalCase[];
  onAdd: (c: SurgicalCase) => void;
  onUpdate: (c: SurgicalCase) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft());

  const sorted = useMemo(
    () => [...cases].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [cases],
  );

  function startNew() {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(c: SurgicalCase) {
    const { id, createdAt, updatedAt, ...rest } = c;
    setDraft(rest);
    setEditingId(id);
    setShowForm(true);
  }

  function setScore(key: keyof OsatsScores, value: number) {
    setDraft((d) => ({ ...d, scores: { ...d.scores, [key]: value } }));
  }

  function submit() {
    if (!draft.procedureName.trim()) return;
    if (editingId) {
      onUpdate({ ...draft, id: editingId, createdAt: cases.find((c) => c.id === editingId)!.createdAt, updatedAt: nowIso() });
    } else {
      onAdd({ ...draft, id: newId(), createdAt: nowIso(), updatedAt: nowIso() });
    }
    setShowForm(false);
    setEditingId(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle subtitle="OSATS準拠の自己評価で、術後すぐに振り返りを記録します">症例ログ</SectionTitle>
        {!showForm && <Button onClick={startNew}>+ 症例を記録</Button>}
      </div>

      {showForm && (
        <Card className="mb-6 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>日付</Label>
              <Input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            </div>
            <div>
              <Label>術式名</Label>
              <Input
                placeholder="例: 腹腔鏡下胆嚢摘出術"
                value={draft.procedureName}
                onChange={(e) => setDraft((d) => ({ ...d, procedureName: e.target.value }))}
              />
            </div>
            <div>
              <Label>診療科・分野</Label>
              <Select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
                {PRESET_PROCEDURE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>役割</Label>
              <Select value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as Role }))}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>手術時間(分)</Label>
              <Input
                type="number"
                min={0}
                value={draft.durationMinutes ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <Label>合併症・トラブル</Label>
              <Input
                placeholder="なし / 出血多量 など"
                value={draft.complications}
                onChange={(e) => setDraft((d) => ({ ...d, complications: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">技術自己評価 (1〜5)</p>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {OSATS_DOMAINS.map((domain) => (
                <ScoreSlider key={domain.key} domain={domain} value={draft.scores[domain.key]} onChange={(v) => setScore(domain.key, v)} />
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">振り返り</p>
            <div>
              <Label>良かった点</Label>
              <TextArea rows={2} value={draft.reflectionGood} onChange={(e) => setDraft((d) => ({ ...d, reflectionGood: e.target.value }))} />
            </div>
            <div>
              <Label>改善すべき点</Label>
              <TextArea
                rows={2}
                value={draft.reflectionImprove}
                onChange={(e) => setDraft((d) => ({ ...d, reflectionImprove: e.target.value }))}
              />
            </div>
            <div>
              <Label>次回への具体的アクション</Label>
              <TextArea rows={2} value={draft.nextAction} onChange={(e) => setDraft((d) => ({ ...d, nextAction: e.target.value }))} />
            </div>
            <div>
              <Label>メモ (任意・患者情報は記載しないこと)</Label>
              <TextArea rows={2} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              キャンセル
            </Button>
            <Button onClick={submit}>{editingId ? "更新する" : "保存する"}</Button>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="まだ症例が記録されていません" description="「+ 症例を記録」から最初の1件を記録してみましょう。" />
      ) : (
        <div className="space-y-3">
          {sorted.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{c.procedureName}</span>
                    <Badge>{c.category}</Badge>
                    <Badge tone="teal">{c.role}</Badge>
                    {c.complications && c.complications !== "なし" && <Badge tone="red">{c.complications}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {c.date}
                    {c.durationMinutes ? ` ・ ${c.durationMinutes}分` : ""} ・ 平均スコア {averageScore(c.scores).toFixed(1)} / 5
                  </p>
                  {c.reflectionImprove && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">改善点:</span> {c.reflectionImprove}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="secondary" onClick={() => startEdit(c)}>
                    編集
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(c.id)}>
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
