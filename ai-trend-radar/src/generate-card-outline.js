function createDefaultCards(item) {
  const seed = item.editorial_seed?.content_seed || {};
  const subject = seed.title_subject || "AI 변화";
  const angle = item.editorial_seed?.content_angle || "일과 돈의 흐름이 바뀌는 신호입니다.";

  return [
    {
      title: "무슨 일이 있었나",
      body: `${subject} 관련 공식 자료에서 새로운 변화가 확인됐습니다.`,
      emphasis: "먼저 사실부터 봅니다."
    },
    {
      title: "왜 중요한가",
      body: angle,
      emphasis: "도구보다 흐름이 중요합니다."
    },
    {
      title: "어떻게 써야 하나",
      body: "업무, 콘텐츠 제작, 자동화 흐름에서 작게 실험해볼 지점을 찾습니다.",
      emphasis: "바로 적용할 질문을 남깁니다."
    }
  ];
}

function generateCardOutline(item, recommendedFormat, recommendedTitle) {
  if (!["CAROUSEL", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    return {
      recommended_card_count: 0,
      cards: [],
      last_card_cta: ""
    };
  }

  const seedCards = item.editorial_seed?.content_seed?.carousel_cards || [];
  const middleCards = (seedCards.length > 0 ? seedCards : createDefaultCards(item)).slice(0, 7);
  const thumbnailTitle = recommendedTitle
    || item.editorial_seed?.content_seed?.recommended_title
    || middleCards[0]?.title
    || "AI 변화가 조용히 시작됐습니다";
  const thumbnailBody = item.editorial_seed?.content_angle
    || middleCards[0]?.emphasis
    || "돈과 일의 관점에서 봐야 할 변화입니다.";

  const cards = [
    {
      number: 1,
      role: "thumbnail",
      title: thumbnailTitle,
      body: thumbnailBody,
      emphasis: "오늘 저장할 AI 변화"
    },
    ...middleCards.map((card, index) => ({
      number: index + 2,
      role: "body",
      title: card.title,
      body: card.body,
      emphasis: card.emphasis || ""
    }))
  ];

  cards.push({
    number: cards.length + 1,
    role: "cta",
    title: "다음 AI 변화도 놓치지 마세요",
    body: "AI 뉴스는 많습니다. 돈과 일에 연결되는 해석은 따로 정리합니다.",
    emphasis: "저장하고 다음 변화도 확인하세요."
  });

  const safeCards = cards.slice(0, 9).map((card, index) => ({
    ...card,
    number: index + 1
  }));

  return {
    recommended_card_count: Math.min(9, Math.max(3, safeCards.length)),
    cards: safeCards,
    last_card_cta: "저장하고 다음 AI 변화도 확인하세요."
  };
}

module.exports = {
  generateCardOutline
};
