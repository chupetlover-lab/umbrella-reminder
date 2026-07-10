import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const journalsConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "journals.json"), "utf-8")
);

const TIER1 = new Set(journalsConfig.journals["1"].map((j) => j.toLowerCase()));
const TIER2 = new Set(journalsConfig.journals["2"].map((j) => j.toLowerCase()));
const TIER_WEIGHT = journalsConfig.tierWeight;
const HALF_LIFE_DAYS = journalsConfig.halfLifeDays;

export function journalTier(journalName) {
  const name = (journalName || "").toLowerCase();
  if ([...TIER1].some((j) => name.includes(j))) return 1;
  if ([...TIER2].some((j) => name.includes(j))) return 2;
  return 3;
}

/**
 * impactScore = 掲載誌ティアの重み × (0.35 + 0.65 × 新着度の指数減衰)
 * 新着論文ほど高スコアだが、トップジャーナル掲載であれば数日経っても
 * 一般誌の新着論文より優先されるようバランスを取る。
 */
export function impactScore({ tier, pubDate, now = new Date() }) {
  const days = Math.max(0, (now - new Date(pubDate)) / (1000 * 60 * 60 * 24));
  const recency = Math.exp(-days / HALF_LIFE_DAYS);
  const weight = TIER_WEIGHT[String(tier)] ?? TIER_WEIGHT["3"];
  return Math.round(weight * (0.35 + 0.65 * recency) * 10) / 10;
}
