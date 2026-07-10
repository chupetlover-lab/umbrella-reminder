/**
 * ANTHROPIC_API_KEY が無い場合や LLM 呼び出しが失敗した場合の
 * フォールバック用ヒューリスティック抽出。翻訳は行わず、
 * キーワード辞書によるラベリングと簡易な文抽出のみを行う。
 */

const ORGAN_KEYWORDS = [
  [/esophag/i, "食道"],
  [/gastr(?!ointestinal)/i, "胃"],
  [/(colo(?!n)|colon|rectal|rectum|colorectal)/i, "大腸・直腸"],
  [/hepat(ic|ectomy)|liver/i, "肝臓"],
  [/pancrea/i, "膵臓"],
  [/(biliary|cholecyst|gallbladder|bile duct)/i, "胆道"],
];

const PROCEDURE_KEYWORDS = [
  [/gastrectomy/i, "胃切除術"],
  [/esophagectomy/i, "食道切除術"],
  [/colectomy/i, "大腸切除術"],
  [/proctectomy|rectal resection/i, "直腸切除術"],
  [/hepatectomy|liver resection/i, "肝切除術"],
  [/pancreatectomy|pancreaticoduodenectomy/i, "膵切除術"],
  [/cholecystectomy/i, "胆嚢摘出術"],
  [/bariatric|sleeve gastrectomy|gastric bypass/i, "肥満外科手術"],
  [/anastomosis/i, "吻合術"],
];

const APPROACH_KEYWORDS = [
  [/robot(ic)?[- ]?assisted|robotic surgery/i, "ロボット支援"],
  [/laparoscop/i, "腹腔鏡下"],
  [/endoscop/i, "内視鏡的"],
  [/open surgery|laparotomy/i, "開腹"],
];

const STUDY_TYPE_KEYWORDS = [
  [/systematic review/i, "システマティックレビュー"],
  [/meta-analysis/i, "メタ解析"],
  [/randomi[sz]ed controlled trial|\bRCT\b/i, "ランダム化比較試験(RCT)"],
  [/multicenter|multi-center/i, "多施設研究"],
  [/cohort/i, "コホート研究"],
  [/case-control/i, "症例対照研究"],
  [/retrospective/i, "後ろ向き研究"],
  [/prospective/i, "前向き研究"],
];

const POSITIVE_WORDS = /reduc|lower|improv|safe|non-?inferior|superior|benefit|decreas|favorab/i;
const NEGATIVE_WORDS = /increas(e|ed) risk|higher (mortality|morbidity|complication)|worse|advers|harm/i;

function firstMatch(text, dict) {
  for (const [re, label] of dict) {
    if (re.test(text)) return label;
  }
  return null;
}

export function extractStructuredHeuristic({ title, abstract }) {
  const text = `${title}\n${abstract}`;

  const sampleSizeMatch = text.match(/\bn\s*=\s*([\d,]{2,7})\b/i) || text.match(/([\d,]{2,7})\s+patients/i);
  const sampleSize = sampleSizeMatch ? Number(sampleSizeMatch[1].replace(/,/g, "")) : null;

  let trend = "neutral";
  if (POSITIVE_WORDS.test(text)) trend = "positive";
  if (NEGATIVE_WORDS.test(text)) trend = "negative";

  return {
    studyType: firstMatch(text, STUDY_TYPE_KEYWORDS),
    organ: firstMatch(text, ORGAN_KEYWORDS),
    procedure: firstMatch(text, PROCEDURE_KEYWORDS),
    approach: firstMatch(text, APPROACH_KEYWORDS),
    sampleSize: Number.isFinite(sampleSize) ? sampleSize : null,
    comparison: null,
    keyFinding: null,
    trend,
    statHighlight: sampleSize ? `n=${sampleSize.toLocaleString("en-US")}` : null,
  };
}

/**
 * 抄録の先頭 2〜3 文を英語のまま箇条書きにするフォールバック要約。
 * (翻訳API/LLMが使えない環境でも digest が空にならないようにするため)
 */
export function heuristicSummary({ abstract }) {
  const sentences = abstract
    .replace(/\s+/g, " ")
    .split(/(?<=[.?!])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences.slice(0, 3).map((s) => `(原文) ${s}`);
}

export function heuristicTitleJa(titleEn) {
  return `[未翻訳] ${titleEn}`;
}
