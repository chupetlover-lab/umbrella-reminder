import type { OsatsScores } from "../types";

export interface OsatsDomain {
  key: keyof OsatsScores;
  label: string;
  lowAnchor: string;
  highAnchor: string;
}

// 5領域+2の技術評価軸。OSATS (Objective Structured Assessment of
// Technical Skill) の評価領域を参考にした自己評価用スケール。
export const OSATS_DOMAINS: OsatsDomain[] = [
  {
    key: "tissueHandling",
    label: "組織の扱い",
    lowAnchor: "組織を頻繁に損傷させた",
    highAnchor: "常に愛護的に扱えた",
  },
  {
    key: "timeAndMotion",
    label: "時間と動作の効率",
    lowAnchor: "無駄な動きが多かった",
    highAnchor: "無駄なく効率的だった",
  },
  {
    key: "instrumentHandling",
    label: "器具の扱い",
    lowAnchor: "ぎこちなく、持ち替えが多かった",
    highAnchor: "スムーズで的確だった",
  },
  {
    key: "useOfAssistants",
    label: "助手の活用",
    lowAnchor: "指示が不明確で活用できなかった",
    highAnchor: "的確に指示し活用できた",
  },
  {
    key: "flowAndForwardPlanning",
    label: "手術の流れ・先読み",
    lowAnchor: "都度立ち止まって考えた",
    highAnchor: "先の展開を読み計画的だった",
  },
  {
    key: "proceduralKnowledge",
    label: "術式に関する知識",
    lowAnchor: "各ステップの理解が不十分だった",
    highAnchor: "各ステップを熟知していた",
  },
  {
    key: "overallPerformance",
    label: "総合評価",
    lowAnchor: "多くの助言・介助が必要だった",
    highAnchor: "自立して遂行できた",
  },
];

export function averageScore(scores: OsatsScores): number {
  const values = OSATS_DOMAINS.map((d) => scores[d.key]);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export const PRESET_PROCEDURE_CATEGORIES = [
  "消化器外科",
  "心臓血管外科",
  "呼吸器外科",
  "整形外科",
  "脳神経外科",
  "泌尿器科",
  "産婦人科",
  "形成外科",
  "小児外科",
  "移植外科",
  "その他",
];

export const PRESET_PRACTICE_SKILLS = [
  "結紮・縫合(基本)",
  "腹腔鏡ボックストレーナー",
  "ロボット手術シミュレーター",
  "血管吻合",
  "顕微鏡下手技",
  "内視鏡操作",
  "解剖実習・カダバートレーニング",
  "その他",
];
