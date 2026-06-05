const { removeJargon } = require("./popularization");
const { officialCoreKorean, cautionKorean } = require("./koreanize");

function generateCardOutline(item, recommendedFormat, recommendedTitle, popularization = {}) {
  if (!["CAROUSEL", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    return {
      recommended_card_count: 0,
      cards: [],
      last_card_cta: ""
    };
  }

  const plainTitle = removeJargon(popularization.non_expert_hook || recommendedTitle || "이 AI 변화, 내 일과 연결됩니다");
  const plainSummary = popularization.plain_language_summary || "쉽게 말해, AI가 일과 콘텐츠 제작 방식을 바꾸는 변화입니다.";
  const care = popularization.why_people_should_care || "내 일, 돈, 콘텐츠 제작 방식과 연결될 수 있습니다.";
  const example = popularization.everyday_example || "반복 업무나 콘텐츠 시안을 더 빨리 실험하는 데 쓸 수 있습니다.";
  const caution = cautionKorean(item);

  const cards = [
    {
      number: 1,
      role: "thumbnail",
      title: plainTitle,
      body: "내 일과 콘텐츠에 생길 변화를 먼저 봅니다.",
      emphasis: "일반인용 핵심"
    },
    {
      number: 2,
      role: "body",
      title: "쉽게 말하면?",
      body: plainSummary,
      emphasis: "전문용어 없이 보기"
    },
    {
      number: 3,
      role: "body",
      title: "왜 내 일과 관련 있나",
      body: care,
      emphasis: "일, 돈, 콘텐츠와 연결"
    },
    {
      number: 4,
      role: "body",
      title: "어디에 써먹을 수 있나",
      body: example,
      emphasis: "현실 예시"
    },
    {
      number: 5,
      role: "body",
      title: "원문 기준 핵심",
      body: officialCoreKorean(item),
      emphasis: "사실과 해석 분리"
    },
    {
      number: 6,
      role: "body",
      title: "아직 조심할 점",
      body: caution,
      emphasis: "과장 금지"
    },
    {
      number: 7,
      role: "body",
      title: "한 줄 결론",
      body: "AI 뉴스는 기술 이름보다 내 일상과 일에 생기는 변화로 봐야 합니다.",
      emphasis: "쉽게 보는 AI 변화"
    },
    {
      number: 8,
      role: "cta",
      title: "다음 AI 변화도 쉽게 볼까요?",
      body: "저장해두고, 돈과 일에 연결되는 AI 해석을 계속 확인하세요.",
      emphasis: "저장하고 팔로우"
    }
  ];

  return {
    recommended_card_count: cards.length,
    cards,
    last_card_cta: "저장해두고, 다음 AI 변화도 쉽게 확인하세요."
  };
}

module.exports = {
  generateCardOutline
};
