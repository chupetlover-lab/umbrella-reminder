import { XMLParser } from "fast-xml-parser";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

/**
 * 消化器外科領域の論文を拾うための PubMed 検索クエリ。
 * MeSH 用語 + 主要術式・領域のキーワードを OR で結合し、
 * 総説だけでなく臨床研究(RCT/コホート/メタ解析)を優先的に拾う。
 */
export const DEFAULT_QUERY = [
  "(",
  '"Digestive System Surgical Procedures"[Mesh]',
  'OR "Gastrointestinal Surgical Procedures"[Mesh]',
  'OR gastrectomy[tiab] OR colectomy[tiab] OR esophagectomy[tiab]',
  'OR hepatectomy[tiab] OR pancreatectomy[tiab] OR cholecystectomy[tiab]',
  'OR "colorectal surgery"[tiab] OR "bariatric surgery"[tiab]',
  'OR "hepatobiliary"[tiab] OR "laparoscopic surgery"[tiab]',
  'OR "robotic surgery"[tiab] OR "robotic-assisted"[tiab]',
  ")",
  "AND",
  "(",
  'randomized controlled trial[pt] OR meta-analysis[pt] OR "systematic review"[pt]',
  "OR cohort studies[mesh] OR multicenter study[pt]",
  ")",
].join(" ");

function withApiKey(url) {
  const key = process.env.NCBI_API_KEY;
  if (key) url.searchParams.set("api_key", key);
  return url;
}

async function fetchWithRetry(url, { retries = 3, delayMs = 500 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

/**
 * 過去 lookbackDays 日以内に発行された、query に一致する PMID を検索する。
 */
export async function searchRecentPmids({ query = DEFAULT_QUERY, lookbackDays = 3, retmax = 60 } = {}) {
  const url = withApiKey(new URL(`${EUTILS_BASE}/esearch.fcgi`));
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(retmax));
  url.searchParams.set("sort", "date");
  url.searchParams.set("datetype", "pdat");
  url.searchParams.set("reldate", String(lookbackDays));
  url.searchParams.set("term", query);

  const res = await fetchWithRetry(url);
  const json = await res.json();
  return json?.esearchresult?.idlist ?? [];
}

/**
 * PMID のリストから書誌情報・抄録を取得する。
 */
export async function fetchArticles(pmids) {
  if (pmids.length === 0) return [];
  const url = withApiKey(new URL(`${EUTILS_BASE}/efetch.fcgi`));
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("retmode", "xml");
  url.searchParams.set("id", pmids.join(","));

  const res = await fetchWithRetry(url);
  const xml = await res.text();

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xml);

  const articleSet = parsed?.PubmedArticleSet?.PubmedArticle;
  const articles = Array.isArray(articleSet) ? articleSet : articleSet ? [articleSet] : [];

  return articles.map(parseArticle).filter(Boolean);
}

function textOf(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (typeof node === "object" && "#text" in node) return String(node["#text"]);
  return "";
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function parseArticle(entry) {
  try {
    const medline = entry.MedlineCitation;
    const pmid = textOf(medline.PMID);
    const article = medline.Article;

    const title = textOf(article.ArticleTitle);

    const journal = textOf(article.Journal?.Title) || textOf(article.Journal?.ISOAbbreviation);

    const abstractParts = asArray(article.Abstract?.AbstractText).map((part) => {
      const label = part?.["@_Label"];
      const text = textOf(part);
      return label ? `${label}: ${text}` : text;
    });
    const abstract = abstractParts.join("\n");

    const authorList = asArray(article.AuthorList?.Author).map((a) => {
      const last = textOf(a.LastName);
      const fore = textOf(a.ForeName) || textOf(a.Initials);
      return [last, fore].filter(Boolean).join(" ");
    });

    const pubDate = extractPubDate(article);

    const doiEntry = asArray(entry.PubmedData?.ArticleIdList?.ArticleId).find(
      (a) => a?.["@_IdType"] === "doi"
    );
    const doi = doiEntry ? textOf(doiEntry) : null;

    if (!pmid || !title || !abstract) return null;

    return {
      pmid,
      title,
      journal: journal || "Unknown Journal",
      abstract,
      authors: authorList,
      pubDate,
      doi,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  } catch {
    return null;
  }
}

function extractPubDate(article) {
  const pd =
    article.Journal?.JournalIssue?.PubDate || article.ArticleDate || {};
  const year = textOf(pd.Year) || textOf(article.ArticleDate?.Year);
  const monthRaw = textOf(pd.Month) || "01";
  const day = textOf(pd.Day) || "01";
  const month = /^\d+$/.test(monthRaw) ? monthRaw.padStart(2, "0") : monthNameToNumber(monthRaw);

  if (!year) return new Date().toISOString().slice(0, 10);
  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

const MONTHS = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};
function monthNameToNumber(name) {
  const key = String(name).slice(0, 3).toLowerCase();
  return MONTHS[key] || "01";
}
