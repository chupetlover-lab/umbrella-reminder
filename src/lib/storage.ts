import type { AppData, Goal, PracticeSession, SurgicalCase } from "../types";

const KEYS = {
  cases: "surgical-skills.cases.v1",
  practice: "surgical-skills.practice.v1",
  goals: "surgical-skills.goals.v1",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadCases(): SurgicalCase[] {
  return load<SurgicalCase[]>(KEYS.cases, []);
}

export function saveCases(cases: SurgicalCase[]) {
  save(KEYS.cases, cases);
}

export function loadPracticeSessions(): PracticeSession[] {
  return load<PracticeSession[]>(KEYS.practice, []);
}

export function savePracticeSessions(sessions: PracticeSession[]) {
  save(KEYS.practice, sessions);
}

export function loadGoals(): Goal[] {
  return load<Goal[]>(KEYS.goals, []);
}

export function saveGoals(goals: Goal[]) {
  save(KEYS.goals, goals);
}

export function loadAllData(): AppData {
  return {
    cases: loadCases(),
    practiceSessions: loadPracticeSessions(),
    goals: loadGoals(),
  };
}

export function exportAllDataAsJson(): string {
  return JSON.stringify(loadAllData(), null, 2);
}

export function importAllData(data: AppData) {
  saveCases(data.cases ?? []);
  savePracticeSessions(data.practiceSessions ?? []);
  saveGoals(data.goals ?? []);
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
