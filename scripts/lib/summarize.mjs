import { extractStructuredHeuristic, heuristicSummary, heuristicTitleJa } from "./heuristics.mjs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const SYSTEM_PROMPT = `あなたは消化器外科医向けに、英語の医学論文アブストラクトを日本語で要約する専門家です。
必ず有効なJSONのみを出力してください。前後に説明文やMarkdownのコードフェンスを付けないでください。
医学的に不正確な断定は避け、アブストラクトに書かれている範囲の情報のみを用いてください。`;

function buildUserPrompt({ title, journal, abstract }) {
  return `以下は消化器外科領域の論文情報です。指定のJSONスキーマに従って日本語化・構造化してください。

# 論文情報
タイトル: ${title}
掲載誌: ${journal}
アブストラクト:
${abstract}

# 出力JSONスキーマ
{
  "title_ja": "タイトルの自然な日本語訳(30〜60字目安)",
  "summary_ja": ["要点1", "要点2", "要点3", "(任意)要点4"],
  "studyType": "RCT/メタ解析/コホート研究/システマティックレビュー/後ろ向き研究 等、日本語で。不明ならnull",
  "organ": "食道 / 胃 / 大腸・直腸 / 肝臓 / 膵臓 / 胆道 / 一般腹部 のいずれか。該当なければ null",
  "procedure": "術式・処置名を日本語で(例: 腹腔鏡下胃切除術)。不明ならnull",
  "approach": "開腹 / 腹腔鏡下 / ロボット支援 / 内視鏡的 / 非手術 のいずれか。不明ならnull",
  "sampleSize": "対象症例数(数値)。不明ならnull",
  "comparison": "比較群の説明(例: 腹腔鏡下 vs 開腹)。単群研究やレビューならnull",
  "keyFinding": "結論を1文の日本語で(専門的だが平易に)",
  "trend": "positive(良好な結果) / negative(注意すべきリスク・非劣性でない等) / neutral(有意差なし・記述のみ) のいずれか",
  "statHighlight": "最も重要な数値を短く(例: '合併症率 -32%', 'OS改善 HR 0.68')。無ければnull"
}

JSONのみを出力してください。`;
}

function safeParseJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callAnthropic({ title, journal, abstract }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt({ title, journal, abstract }) }],
    }),
  });

  if (!res.ok) {
    console.warn(`[summarize] Anthropic API error ${res.status}: ${await res.text().catch(() => "")}`);
    return null;
  }

  const data = await res.json();
  const text = data?.content?.find((c) => c.type === "text")?.text;
  if (!text) return null;

  return safeParseJson(text);
}

/**
 * 論文1件を要約・構造化する。ANTHROPIC_API_KEY があればLLMで日本語化し、
 * 無い/失敗した場合はキーワードベースのフォールバックにする。
 */
export async function summarizePaper({ title, journal, abstract }) {
  try {
    const llmResult = await callAnthropic({ title, journal, abstract });
    if (llmResult && llmResult.title_ja && Array.isArray(llmResult.summary_ja)) {
      return {
        source: "llm",
        title_ja: llmResult.title_ja,
        summary_ja: llmResult.summary_ja,
        structured: {
          studyType: llmResult.studyType ?? null,
          organ: llmResult.organ ?? null,
          procedure: llmResult.procedure ?? null,
          approach: llmResult.approach ?? null,
          sampleSize: typeof llmResult.sampleSize === "number" ? llmResult.sampleSize : null,
          comparison: llmResult.comparison ?? null,
          keyFinding: llmResult.keyFinding ?? null,
          trend: ["positive", "negative", "neutral"].includes(llmResult.trend) ? llmResult.trend : "neutral",
          statHighlight: llmResult.statHighlight ?? null,
        },
      };
    }
  } catch (err) {
    console.warn(`[summarize] LLM call failed, falling back to heuristic: ${err.message}`);
  }

  return {
    source: "heuristic",
    title_ja: heuristicTitleJa(title),
    summary_ja: heuristicSummary({ abstract }),
    structured: extractStructuredHeuristic({ title, abstract }),
  };
}
