import fs from "node:fs";
import path from "node:path";
import type { DigestFile, PaperEntry } from "./types";

const DIGEST_DIR = path.join(process.cwd(), "data", "digests");

function readDigestFile(fileName: string): DigestFile {
  const raw = fs.readFileSync(path.join(DIGEST_DIR, fileName), "utf-8");
  return JSON.parse(raw) as DigestFile;
}

export function getAllDigestDates(): string[] {
  if (!fs.existsSync(DIGEST_DIR)) return [];
  return fs
    .readdirSync(DIGEST_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort((a, b) => (a < b ? 1 : -1)); // 新しい日付が先頭
}

export function getDigestByDate(date: string): DigestFile | null {
  const fileName = `${date}.json`;
  if (!fs.existsSync(path.join(DIGEST_DIR, fileName))) return null;
  return readDigestFile(fileName);
}

export function getLatestDigest(): DigestFile | null {
  const dates = getAllDigestDates();
  if (dates.length === 0) return null;
  return getDigestByDate(dates[0]);
}

export function getPaperById(id: string): { paper: PaperEntry; date: string } | null {
  const dates = getAllDigestDates();
  for (const date of dates) {
    const digest = getDigestByDate(date);
    const paper = digest?.papers.find((p) => p.id === id);
    if (paper) return { paper, date };
  }
  return null;
}

export function formatDateJa(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  });
}
