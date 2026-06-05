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
  const subject = removeJargon(popularization.public_subject || item.editorial_seed?.content_seed?.title_subject || item.original_title || "AI 변화");
  const subjectObject = objectParticle(subject);
  const nonExpertHook = popularization.non_expert_hook || "AI 뉴스 같지만 사실은 내 일 이야기입니다";
  const audienceArea = popularization.audience_area || "일과 콘텐츠";

  const general = uniqueFive([
    nonExpertHook,
    `${subject}가 내 일에 들어오면 달라지는 것`,
    "이제 중요한 건 AI 이름보다 내가 써먹는 방법입니다",
    "오늘 AI 변화, 쉽게 보면 이겁니다",
    `${subjectObject} 처음 보는 사람도 이해하게 정리했습니다`
  ]);

  const viral = uniqueFive([
    "이건 기술 뉴스가 아니라 돈과 일의 변화입니다",
    "AI를 잘 몰라도 이 변화는 봐야 합니다",
    `${subject} 때문에 내 시간이 아껴질 수 있습니다`,
    `${subjectObject} 모르고 지나치면 AI 흐름이 더 어렵게 보입니다`,
    `${audienceArea}에 먼저 연결되는 AI 변화입니다`
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
