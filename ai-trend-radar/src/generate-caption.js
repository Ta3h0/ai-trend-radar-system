function cardLines(item) {
  return (item.editorial_seed?.content_seed?.carousel_cards || [])
    .slice(0, 4)
    .map((card) => `${card.title}: ${card.body}`)
    .join(" ");
}

function formatLabel(format) {
  if (format === "REELS_FIRST") return "릴스 먼저, 이후 카드뉴스";
  if (format === "REELS") return "릴스";
  if (format === "CAROUSEL") return "카드뉴스";
  if (format === "BOTH") return "릴스와 카드뉴스";
  return "보류";
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

function commonContext(item, candidate) {
  const seed = item.editorial_seed || {};
  return {
    subject: seed.content_seed?.title_subject || item.original_title || "AI 변화",
    subject_object: objectParticle(seed.content_seed?.title_subject || item.original_title || "AI 변화"),
    sourceName: item.source_name || "공식 출처",
    title: candidate.recommended_title,
    angle: seed.content_angle || candidate.source_summary_ko || "AI 변화가 일과 돈, 콘텐츠 제작 방식에 주는 의미를 정리합니다.",
    why: seed.why_it_matters || "업무 방식, 자동화 흐름, 콘텐츠 제작 속도에 영향을 줄 수 있기 때문입니다.",
    cards: cardLines(item),
    format: formatLabel(candidate.recommended_format),
    hashtags: (seed.content_seed?.hashtags || ["#AI트렌드", "#AI뉴스", "#AI자동화"]).join(" ")
  };
}

function holdCaption(item, candidate) {
  const context = commonContext(item, candidate);
  const reason = candidate.source_match_status === "MISMATCH"
    ? "원자료 요약과 링크 주제가 맞지 않습니다. 이런 경우에는 아무리 소재가 좋아 보여도 발행 전에 멈춰야 합니다."
    : "출처, 사용권, 검증 상태 중 하나가 발행 기준에 부족합니다.";

  return [
    `${context.title}`,
    "",
    `오늘 이 후보는 만들지 않는 쪽이 맞습니다. 이유는 간단합니다. ${reason}`,
    "",
    `AI 트렌드 계정에서 가장 위험한 순간은 소재가 재미있어 보일 때입니다. 제목은 뽑히고, 카드 구성도 가능하고, 사람들의 관심도 받을 수 있어 보이지만 출처가 어긋나 있으면 그 순간부터 콘텐츠 전체가 흔들립니다. 특히 ${context.subject}처럼 많은 사람이 업무, 돈, 자동화와 연결해서 해석할 수 있는 주제는 더 엄격하게 봐야 합니다.`,
    "",
    `이번 후보는 ${context.sourceName} 관련 자료로 분류되어 있지만, source_match_status는 ${candidate.source_match_status}, fact_check_status는 ${candidate.fact_check_status}입니다. 즉 지금 필요한 작업은 후킹이 아니라 원문 재확인입니다. 실제 원문 URL, 제목, 날짜, 발표 주체, 핵심 문장이 서로 같은 주제를 가리키는지 먼저 맞춰야 합니다.`,
    "",
    "보류 후보를 남기는 이유는 실패가 아니라 필터링입니다. 오늘 바로 발행하지 않더라도, 나중에 정확한 원문을 찾으면 좋은 카드뉴스가 될 수 있습니다. 반대로 지금 억지로 발행하면 계정이 쌓아야 할 신뢰를 한 번에 깎을 수 있습니다.",
    "",
    "오늘 결론: 이 후보는 아이디어 창고에는 남기되, 발행 후보에서는 제외합니다. AI 콘텐츠는 빠른 것보다 정확한 것이 오래 갑니다.",
    "",
    "여러분은 AI 뉴스 볼 때 제목과 링크가 안 맞는 자료를 본 적 있나요?",
    "",
    context.hashtags
  ].join("\n");
}

const captionStyles = [
  (ctx, candidate) => [
    `${ctx.title}`,
    "",
    `오늘 이건 카드뉴스로 저장 가치가 있습니다. ${ctx.sourceName} 자료에서 볼 핵심은 "${ctx.subject}" 자체보다, 이 변화가 개인 장비와 업무 흐름 쪽으로 내려오고 있다는 점입니다. 예전에는 AI를 쓰려면 클라우드 서비스, 요금제, API 사용량부터 떠올렸지만 이제는 로컬 실행, 개인정보, 비용, 반복 작업까지 같이 봐야 합니다.`,
    "",
    `${ctx.angle} 그래서 이 소재는 단순한 신제품 소개로 끝내면 아깝습니다. 1장은 강하게 후킹하고, 2장부터는 왜 중요한지, 어디에 쓸 수 있는지, 어떤 과장은 피해야 하는지 순서대로 정리하는 편이 좋습니다.`,
    "",
    `카드 흐름은 이렇게 잡으면 됩니다. ${ctx.cards} 이 정도면 독자가 "그래서 나한테 무슨 의미인데?"라는 질문에 바로 답할 수 있습니다. 특히 크리에이터, 1인 사업자, 자동화에 관심 있는 직장인은 비용과 실행 환경 변화에 민감하기 때문에 저장할 이유가 생깁니다.`,
    "",
    "주의할 점도 분명합니다. 공식 발표라고 해서 모든 사람이 바로 같은 결과를 얻는다는 뜻은 아닙니다. 성능, 사용 가능 지역, 권한, 하드웨어 조건은 따로 확인해야 합니다.",
    "",
    `오늘 제작 판단: ${ctx.format}. 댓글로는 "클라우드 AI와 로컬 AI 중 어디에 더 관심 있나요?"를 던지면 좋습니다.`,
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `이 후보는 릴스로 먼저 꺼내는 게 좋습니다. 이유는 설명보다 장면이 먼저 먹히는 소재이기 때문입니다. ${ctx.subject}는 말로 길게 설명하면 조금 멀게 느껴질 수 있지만, 실제 사람이 있고 그 주변 세계가 AI로 바뀌는 식의 장면을 먼저 보여주면 반응이 훨씬 빠르게 옵니다.`,
    "",
    `다만 메시지는 "AI가 사람을 대체한다"로 가면 안 됩니다. 이번 소재의 좋은 포인트는 ${ctx.angle}는 쪽입니다. 창작자가 사라진다는 공포보다, 창작자가 더 많은 배경과 세계관을 빠르게 실험할 수 있다는 쪽으로 잡아야 안전하고 설득력도 있습니다.`,
    "",
    `릴스는 10초 안에 끝내면 좋습니다. 첫 2초는 가장 강한 장면, 다음 3초는 출처와 변화, 마지막 4초는 크리에이터에게 의미 있는 이유입니다. 이후 카드뉴스로 넘길 때는 ${ctx.cards} 이런 식으로 제작 구조를 풀면 됩니다.`,
    "",
    "영상이나 이미지는 반드시 공식 링크와 사용 가능성을 확인해야 합니다. 공식 페이지에 있다고 해서 그대로 가져다 써도 된다는 뜻은 아닙니다. 직접 생성 이미지나 자체 편집 모션으로 대체할 수 있으면 더 안전합니다.",
    "",
    "오늘 결론: 릴스로 도달을 만들고, 카드뉴스로 신뢰를 회수하는 후보입니다. 이런 소재는 빠르게 보여주고, 천천히 설명해야 합니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `디자인과 콘텐츠 제작을 하는 사람이라면 이 후보는 꽤 중요합니다. 겉으로는 ${ctx.subject} 이야기처럼 보이지만, 실제 포인트는 "AI 결과물을 얼마나 다시 고칠 수 있느냐"입니다. 예쁜 이미지 한 장보다 더 중요한 건 수정 가능성입니다.`,
    "",
    `${ctx.angle} 카드뉴스에서는 이걸 "생성형 AI의 다음 단계"로 잡으면 좋습니다. 첫 장은 강하게, 중간 카드는 레이어와 재사용성, 마지막은 디자이너와 마케터가 봐야 할 체크포인트로 마무리합니다.`,
    "",
    `카드에 들어갈 문구는 실제 작업자 언어로 바꿔야 합니다. ${ctx.cards} 이렇게 쓰면 기술 논문 느낌을 줄이고, "내가 만드는 카드뉴스나 광고 소재에 어떤 의미가 있지?"로 연결됩니다.`,
    "",
    "주의할 점은 연구와 제품을 분리하는 것입니다. 연구 결과가 흥미롭다고 해서 오늘 당장 모든 디자인 툴에서 똑같이 쓸 수 있다는 뜻은 아닙니다. 그래서 제목은 강하게 가되, 본문은 정확히 가야 합니다.",
    "",
    "오늘 결론: 카드뉴스로 만들면 저장 가치가 있습니다. 댓글 질문은 'AI 이미지에서 가장 불편한 점은 생성인가요, 수정인가요?'가 좋습니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `기업 AI 이야기는 자칫 멀게 느껴집니다. 그런데 이번 후보는 다릅니다. ${ctx.subject}의 핵심은 "AI를 하나 만들어보자"가 아니라 "AI를 실제 업무 시스템 안에서 어떻게 운영할 것인가"로 넘어갔다는 점입니다.`,
    "",
    `${ctx.angle} 이걸 카드뉴스로 만들 때는 특정 회사나 제품 이름보다 운영 개념을 앞에 세우는 게 좋습니다. 에이전트가 많아질수록 권한, 로그, 감사, 실패 처리, 사람의 승인 지점이 필요해집니다. 이건 대기업만의 이야기가 아니라, 작은 자동화를 만드는 사람에게도 그대로 적용됩니다.`,
    "",
    `카드 흐름은 ${ctx.cards} 순서로 가면 자연스럽습니다. 독자는 "에이전트가 대단하다"보다 "내가 자동화를 만들 때 뭘 조심해야 하지?"에 더 오래 머뭅니다.`,
    "",
    "과장하면 안 되는 지점도 있습니다. 프리뷰, 특정 고객 대상, 지역별 출시 차이 같은 조건은 반드시 남겨야 합니다. 발표 자료의 방향은 설명하되, 모든 기능이 바로 누구에게나 열린 것처럼 쓰면 안 됩니다.",
    "",
    "오늘 결론: 화려한 릴스보다 저장형 카드뉴스가 강합니다. 이 소재는 빠른 반응보다 신뢰를 쌓는 데 좋습니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `개발자 입장에서 이건 그냥 새 앱 소식이 아닙니다. ${ctx.subject}는 AI가 코드를 조금 도와주는 단계를 지나, 여러 작업 흐름을 동시에 굴리는 방향으로 가고 있다는 신호입니다.`,
    "",
    `${ctx.angle} 그래서 이 후보는 "AI 코딩 도구 추천"처럼 소비하면 약합니다. 더 강한 포인트는 개발자의 역할 변화입니다. 직접 코드를 치는 시간보다 이슈를 쪼개고, 에이전트 작업을 검토하고, 테스트 결과를 확인하고, 병합 여부를 판단하는 시간이 중요해질 수 있습니다.`,
    "",
    `카드뉴스 구성은 ${ctx.cards} 이렇게 잡으면 됩니다. 특히 팀 단위 개발자에게는 작업 로그와 PR, 검증 흔적이 중요합니다. AI가 코드를 만들수록 인간은 더 좋은 감독자가 되어야 합니다.`,
    "",
    "주의할 점은 프리뷰와 실제 운영을 구분하는 것입니다. 공개된 방향은 흥미롭지만, 내 저장소와 팀 규칙에 바로 맞는지는 별개의 문제입니다.",
    "",
    "오늘 결론: 개발자 계정이나 생산성 계정이라면 카드뉴스로 매우 좋습니다. 댓글 질문은 'AI 코딩에서 제일 불안한 건 품질인가요, 책임 소재인가요?'가 어울립니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `이 소재는 어렵지만 잘 만들면 강합니다. ${ctx.subject}는 일반적인 업무 자동화보다 훨씬 큰 그림을 보여줍니다. AI 에이전트가 단순히 문서를 요약하거나 코드를 짜는 수준을 넘어, 실험과 측정, 결함 탐지, 해결책 제안 같은 연구 흐름으로 들어가는 이야기이기 때문입니다.`,
    "",
    `${ctx.angle} 릴스에서는 칩, 연구실, 데이터 대시보드 같은 이미지를 강하게 보여주고, 카드뉴스에서는 "AI 에이전트가 지식노동의 어디까지 들어가는가"를 풀면 좋습니다.`,
    "",
    `카드 문구는 ${ctx.cards} 방향이면 충분합니다. 어려운 양자 기술 설명을 길게 하기보다, "복잡한 실험을 AI가 어떻게 보조하는가"로 좁히는 게 핵심입니다. 그래야 일반 독자도 따라옵니다.`,
    "",
    "여기서 조심할 점은 로드맵을 확정처럼 쓰지 않는 것입니다. 기업이 말한 전망과 실제 과학적 검증은 분리해야 합니다. 숫자가 나와도 원문 기준으로만 말하고, 미래 성과를 보장하면 안 됩니다.",
    "",
    "오늘 결론: 릴스로 시선을 잡고, 카드뉴스로 큰 그림을 설명하세요. 잘 만들면 계정의 전문성을 올릴 수 있는 후보입니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `보안 소재는 후킹을 잘못 잡으면 위험합니다. 이번 후보는 ${ctx.subject_object} 다루지만, 절대 "이렇게 뚫는다" 쪽으로 가면 안 됩니다. 방향은 방어, 점검, 운영 리스크입니다.`,
    "",
    `${ctx.angle} 개발자와 작은 회사 입장에서 중요한 건 AI가 취약점을 찾는다는 사실 자체보다, AI 자동화가 커질수록 보안 자동화도 같이 커져야 한다는 점입니다. 코드를 더 빨리 만들 수 있다면, 더 빨리 검토하고 더 자주 패치하는 구조도 필요합니다.`,
    "",
    `카드 흐름은 ${ctx.cards} 정도가 적당합니다. 악용 가능한 절차나 명령어는 빼고, 왜 이런 도구가 필요한지, 어떤 기준으로 안전하게 다뤄야 하는지 중심으로 씁니다.`,
    "",
    "이 후보는 리스크가 MEDIUM입니다. 그래서 제목은 강하게 쓰되 내용은 방어 관점으로만 유지해야 합니다. 출처가 공식이어도 보안 주제는 항상 더 보수적으로 다루는 편이 안전합니다.",
    "",
    "오늘 결론: 발행 가능하지만 안전 장치가 필요한 카드뉴스 후보입니다. 댓글은 'AI가 코드를 짜는 속도와 보안 검토 속도 중 뭐가 더 부족하다고 느끼나요?'가 좋습니다.",
    "",
    ctx.hashtags
  ].join("\n"),
  (ctx) => [
    `${ctx.title}`,
    "",
    `이건 당장 써먹는 툴 팁이라기보다 큰 흐름을 읽는 소재입니다. 이번 주제는 어렵게 느껴질 수 있지만, 핵심은 AI가 이미지를 만드는 데서 끝나지 않고 세상과 행동을 이해하는 방향으로 간다는 점입니다.`,
    "",
    `${ctx.angle} 카드뉴스에서는 "영상 생성 다음은 세계 이해"라는 축으로 잡으면 좋습니다. AI 영상, 로봇, 시뮬레이션, 게임, 교육 콘텐츠가 왜 같은 방향으로 묶이는지 보여주면 저장 가치가 생깁니다.`,
    "",
    `카드 문구는 ${ctx.cards} 흐름이면 충분합니다. 너무 기술적으로 깊게 들어가기보다, 일반인이 이해할 수 있게 "AI가 장면을 보고 다음을 예측한다"는 식으로 풀어야 합니다.`,
    "",
    "주의할 점은 아직 공개되지 않은 성능이나 출시 일정을 단정하지 않는 것입니다. 큰 그림은 말해도 되지만, 제품처럼 포장하면 안 됩니다.",
    "",
    "오늘 결론: 트렌드 정리형 카드뉴스로 좋습니다. 바로 매출로 연결되는 소재는 아니지만, 계정의 시야를 넓혀주는 후보입니다.",
    "",
    ctx.hashtags
  ].join("\n")
];

function generateCaption(item, candidate, index = 0) {
  if (candidate.recommended_format === "HOLD") {
    return holdCaption(item, candidate);
  }

  const context = commonContext(item, candidate);
  let style = captionStyles[0];

  if (["REELS", "REELS_FIRST", "BOTH"].includes(candidate.recommended_format)) {
    style = context.subject.includes("과학") || context.subject.includes("연구")
      ? captionStyles[5]
      : captionStyles[1];
  } else if (context.subject.includes("이미지")) {
    style = captionStyles[2];
  } else if (context.subject.includes("코딩")) {
    style = captionStyles[4];
  } else if (context.subject.includes("보안")) {
    style = captionStyles[6];
  } else if (context.subject.includes("월드")) {
    style = captionStyles[7];
  } else if (context.subject.includes("에이전트") || context.subject.includes("풀스택")) {
    style = captionStyles[3];
  } else if (index % 3 === 1) {
    style = captionStyles[4];
  } else if (index % 3 === 2) {
    style = captionStyles[2];
  }

  return style(context, candidate);
}

module.exports = {
  generateCaption
};
