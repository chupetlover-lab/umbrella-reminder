import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchRecentPmids, fetchArticles, DEFAULT_QUERY } from "./lib/pubmed.mjs";
import { journalTier, impactScore } from "./lib/scoring.mjs";
import { summarizePaper } from "./lib/summarize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIGEST_DIR = path.join(__dirname, "..", "data", "digests");
const LOOKBACK_DAYS = Number(process.env.DIGEST_LOOKBACK_DAYS || 3);
const MAX_PAPERS = Number(process.env.DIGEST_MAX_PAPERS || 15);
const CONCURRENCY = Number(process.env.DIGEST_CONCURRENCY || 3);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  console.log(`[fetch-digest] Searching PubMed (lookback=${LOOKBACK_DAYS}d)...`);
  const pmids = await searchRecentPmids({ query: DEFAULT_QUERY, lookbackDays: LOOKBACK_DAYS, retmax: 80 });
  console.log(`[fetch-digest] Found ${pmids.length} candidate PMIDs.`);

  if (pmids.length === 0) {
    console.log("[fetch-digest] No candidates found; leaving existing digests untouched.");
    return;
  }

  const articles = await fetchArticles(pmids);
  console.log(`[fetch-digest] Parsed ${articles.length} articles with abstracts.`);

  const now = new Date();
  const scored = articles
    .map((a) => {
      const tier = journalTier(a.journal);
      return { ...a, tier, score: impactScore({ tier, pubDate: a.pubDate, now }) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PAPERS);

  console.log(`[fetch-digest] Summarizing top ${scored.length} papers...`);
  const papers = await mapWithConcurrency(scored, CONCURRENCY, async (a) => {
    const result = await summarizePaper({ title: a.title, journal: a.journal, abstract: a.abstract });
    return {
      id: a.pmid,
      pmid: a.pmid,
      isSample: false,
      title_en: a.title,
      title_ja: result.title_ja,
      journal: a.journal,
      journalTier: a.tier,
      pubDate: a.pubDate,
      authors: a.authors,
      doi: a.doi,
      url: a.url,
      abstract_en: a.abstract,
      summary_ja: result.summary_ja,
      impactScore: a.score,
      structured: result.structured,
      translationSource: result.source,
    };
  });

  const digest = {
    date: todayIso(),
    generatedAt: new Date().toISOString(),
    query: DEFAULT_QUERY,
    isSample: false,
    papers,
  };

  fs.mkdirSync(DIGEST_DIR, { recursive: true });
  const outPath = path.join(DIGEST_DIR, `${digest.date}.json`);
  fs.writeFileSync(outPath, JSON.stringify(digest, null, 2) + "\n");
  console.log(`[fetch-digest] Wrote ${papers.length} papers to ${outPath}`);
}

main().catch((err) => {
  console.error("[fetch-digest] Fatal error:", err);
  process.exit(1);
});
