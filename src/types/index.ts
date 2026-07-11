export type Role = "執刀" | "指導執刀" | "助手" | "見学";

export interface OsatsScores {
  tissueHandling: number; // 組織の愛護的な扱い
  timeAndMotion: number; // 時間と動作の効率
  instrumentHandling: number; // 器具の扱い
  useOfAssistants: number; // 助手の活用
  flowAndForwardPlanning: number; // 手術の流れ・先読み
  proceduralKnowledge: number; // 術式に関する知識
  overallPerformance: number; // 総合評価
}

export const emptyOsatsScores = (): OsatsScores => ({
  tissueHandling: 3,
  timeAndMotion: 3,
  instrumentHandling: 3,
  useOfAssistants: 3,
  flowAndForwardPlanning: 3,
  proceduralKnowledge: 3,
  overallPerformance: 3,
});

export interface SurgicalCase {
  id: string;
  date: string; // YYYY-MM-DD
  procedureName: string;
  category: string;
  role: Role;
  durationMinutes?: number;
  scores: OsatsScores;
  complications: string;
  reflectionGood: string;
  reflectionImprove: string;
  nextAction: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSession {
  id: string;
  date: string; // YYYY-MM-DD
  skill: string;
  durationMinutes?: number;
  reps?: number;
  selfScore: number; // 1-5
  notes?: string;
  createdAt: string;
}

export type GoalStatus = "進行中" | "達成" | "中止";

export interface Goal {
  id: string;
  title: string;
  targetDate?: string;
  metric?: string;
  status: GoalStatus;
  progressNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  cases: SurgicalCase[];
  practiceSessions: PracticeSession[];
  goals: Goal[];
}
