const { removeJargon, containsBannedThumbnailJargon } = require("./popularization");

const forbiddenPatterns = [
  /100%\s*성공/i,
  /수익\s*보장/i,
  /확정\s*수익/i,
  /무조건\s*돈/i,
  /무조건\s*성공/i,
  /따옴표.*발언/i
];

function safeTitle(title) {
  let next = removeJargon(String(title || "").trim());
  for (const pattern of forbiddenPatterns) {
    next = next.replace(pattern, "").trim();
  }
  return next.replace(/\s+/g, " ");
}

function uniqueFive(items) {
  return [...new Set(items.map(safeTitle).filter(Boolean))].slice(0, 5);
}

function hasFinalConsonant(text) {
  const last = String(text || "").trim().slice(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function objectParticle(text) {
  return `${text}${hasFinalConsonant(text) ? "을" : "를"}`;
}

function hookPower(title) {
  const text = String(title || "");
  const weights = [
    ["내", 2],
    ["일", 2],
    ["돈", 3],
    ["콘텐츠", 3],
    ["혼자", 3],
    ["노트북", 3],
    ["지휘", 5],
    ["고치", 4],
    ["무대", 4],
    ["지키는", 4],
    ["멈춰", 4],
    ["놓치", 3],
    ["바뀌", 3],
    ["시작", 2]
  ];

  const jargonPenalty = containsBannedThumbnailJargon(text) ? 20 : 0;
  return weights.reduce((score, [word, weight]) => score + (text.includes(word) ? weight : 0), 0) - jargonPenalty;
}

function strongestTitle(items) {
  return [...items].sort((a, b) => hookPower(b) - hookPower(a))[0];
}

function generateTitleCandidates(item, popularization = {}) {
  const seed = item.editorial_seed?.content_seed || {};
  const subject = removeJargon(seed.title_subject || item.original_title || "AI 변화");
  const subjectObject = objectParticle(subject);
  const seeded = Array.isArray(seed.hook_candidates) ? seed.hook_candidates.map(removeJargon) : [];
  const nonExpertHook = popularization.non_expert_hook || "AI 뉴스 같지만 사실은 내 일 이야기입니다";
  const everyday = popularization.everyday_example || "내 일과 콘텐츠 제작 방식이 조금씩 바뀔 수 있습니다.";

  const general = uniqueFive([
    nonExpertHook,
    "AI 뉴스 같지만 사실은 내 일상 이야기입니다",
    "내 일과 콘텐츠 제작 방식이 조용히 바뀌고 있습니다",
    "이 변화가 나한테 무슨 의미인지 쉽게 정리했습니다",
    `${subjectObject} 쉽게 이해하는 법`,
    `${subject}가 내 일에 들어오면 생기는 변화`
  ]);

  const viral = uniqueFive([
    seeded[0],
    seeded[1],
    `${subject} 때문에 일하는 방식이 달라질 수 있습니다`,
    `${subjectObject} 모르고 지나치면 늦게 따라갑니다`,
    "이건 기술 뉴스가 아니라 돈과 일의 변화입니다",
    everyday.replace(/\.$/, "입니다"),
    "사람들이 아직 가볍게 보는 AI 변화"
  ]);

  const expert = uniqueFive([
    `${subject}, 원문 기준 핵심만 보면 이렇습니다`,
    `${subject}의 기술 포인트는 후반부에서만 보면 됩니다`,
    `${subjectObject} 과장 없이 보는 체크포인트`,
    "공식 발표와 해석을 분리해서 봐야 합니다",
    "가능성과 확정 사실을 나눠서 봐야 합니다"
  ]);

  const recommended = general[0] || strongestTitle(viral) || subject;

  return {
    general,
    viral,
    expert,
    clean: general,
    extreme: expert,
    all: [...general, ...viral, ...expert],
    recommended
  };
}

module.exports = {
  generateTitleCandidates
};
