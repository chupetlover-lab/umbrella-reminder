export type JournalTier = 1 | 2 | 3;

export type Trend = "positive" | "negative" | "neutral";

export interface StructuredFindings {
  studyType: string | null; // RCT, メタ解析, コホート研究, 症例対照研究, レビュー など
  organ: string | null; // 食道, 胃, 大腸・直腸, 肝臓, 膵臓, 胆道, 一般腹部 など
  procedure: string | null; // 胃切除術, 大腸切除術, 肝切除術 など (日本語)
  approach: string | null; // 開腹 / 腹腔鏡下 / ロボット支援 / 内視鏡的 / 非手術
  sampleSize: number | null;
  comparison: string | null; // 比較対象の説明 (例: 腹腔鏡下 vs 開腹)
  keyFinding: string | null; // 結論の要点(日本語 1文)
  trend: Trend; // 結果の方向性(良好/要注意/中立) - 可視化用
  statHighlight: string | null; // 目立たせる数値・統計 (例: "合併症 -32%")
}

export interface PaperEntry {
  id: string; // pmid、またはサンプルの場合は "SAMPLE-xxx"
  pmid: string | null;
  isSample: boolean;
  title_en: string;
  title_ja: string;
  journal: string;
  journalTier: JournalTier;
  pubDate: string; // ISO date (YYYY-MM-DD)
  authors: string[];
  doi: string | null;
  url: string; // PubMed または DOI リンク
  abstract_en: string;
  summary_ja: string[]; // 箇条書き要約 (3〜5点)
  impactScore: number;
  structured: StructuredFindings;
  translationSource: "llm" | "heuristic"; // 要約・翻訳の生成方法
}

export interface DigestFile {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO timestamp
  query: string;
  isSample: boolean;
  papers: PaperEntry[];
}
