const forbiddenPatterns = [
  /100%\s*성공/i,
  /수익\s*보장/i,
  /확정\s*수익/i,
  /무조건\s*돈/i,
  /무조건\s*성공/i,
  /따옴표.*발언/i
];

function safeTitle(title) {
  let next = String(title || "").trim();
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
    ["판", 1],
    ["뒤집", 2],
    ["위험한 착각", 5],
    ["놓치", 4],
    ["돈과 일", 4],
    ["순서", 3],
    ["구경만", 3],
    ["겉만", 3],
    ["전쟁", 5],
    ["지휘", 5],
    ["노트북 안", 5],
    ["고치기", 5],
    ["무대", 5],
    ["연구실", 5],
    ["지키는", 5],
    ["로봇", 4],
    ["모델만 파는", 5],
    ["사라지는 기능", 4],
    ["단순", 2],
    ["조용히", 2]
  ];

  return weights.reduce((score, [word, weight]) => score + (text.includes(word) ? weight : 0), 0);
}

function strongestTitle(items) {
  return [...items].sort((a, b) => hookPower(b) - hookPower(a))[0];
}

function generateTitleCandidates(item) {
  const seed = item.editorial_seed?.content_seed || {};
  const subject = seed.title_subject || item.original_title || "AI 변화";
  const subjectObject = objectParticle(subject);
  const seeded = Array.isArray(seed.hook_candidates) ? seed.hook_candidates : [];

  const clean = uniqueFive([
    `${subject}, 지금 봐야 할 핵심 변화`,
    `${subject}가 일과 콘텐츠 제작에 주는 의미`,
    `${subject} 흐름을 한 번에 정리했습니다`,
    `${subject}에서 확인해야 할 포인트`,
    `${subjectObject} 과장 없이 보는 방법`,
    ...seeded.slice(0, 2)
  ]);

  const viral = uniqueFive([
    seeded[1],
    seeded[2],
    `${subjectObject} 아직 가볍게 보면 안 됩니다`,
    `${subject} 때문에 작업 방식이 조용히 바뀝니다`,
    `사람들이 놓치고 있는 ${subject}의 진짜 신호`,
    `${subject}, 단순 업데이트가 아닙니다`,
    `${subjectObject} 모르면 AI 뉴스만 보게 됩니다`
  ]);

  const extreme = uniqueFive([
    ...seeded.slice(0, 3),
    `${subject}의 판이 조용히 뒤집히고 있습니다`,
    `${subject}, 이걸 놓치면 다음 흐름을 늦게 봅니다`,
    `${subject}가 돈과 일의 순서를 바꾸고 있습니다`,
    `${subjectObject} 모르면 AI를 써도 겉만 보게 됩니다`,
    `지금 ${subject}에서 가장 위험한 착각`,
    `${subject}, 이제 구경만 할 뉴스가 아닙니다`
  ]);

  return {
    clean,
    viral,
    extreme,
    all: [...clean, ...viral, ...extreme],
    recommended: strongestTitle([...extreme, ...seeded]) || strongestTitle(viral) || clean[0] || subject
  };
}

module.exports = {
  generateTitleCandidates
};
