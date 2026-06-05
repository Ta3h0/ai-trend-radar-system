function formatDateKo(value) {
  const text = String(value || "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "날짜 미상";
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}

function officialCoreKorean(item) {
  const seed = item.editorial_seed || {};
  const cards = seed.content_seed?.carousel_cards || [];
  const primary = cards[0]?.body || seed.content_angle || "원문에서 확인된 AI 관련 변화입니다.";
  const source = item.source_name || "공식 출처";
  return `${source}의 ${formatDateKo(item.published_at)} 원문 기준: ${primary}`;
}

function cautionKorean(item) {
  const cards = item.editorial_seed?.content_seed?.carousel_cards || [];
  const cautionCard = cards.find((card) => /주의|한계|조심|리스크|확인/.test(`${card.title || ""} ${card.body || ""}`));
  if (cautionCard?.body) return cautionCard.body;

  const raw = String(item.editorial_seed?.uncertain_points?.[0] || "");
  if (!raw) return "출시 범위, 사용권, 실제 성능은 원문 기준으로 다시 확인해야 합니다.";
  if (/performance|hardware|workload|smoothly/i.test(raw)) {
    return "실제 성능은 기기 사양, 설정, 작업 종류에 따라 달라질 수 있습니다.";
  }
  if (/availability|pricing/i.test(raw)) {
    return "출시 범위와 가격은 원문에서 다시 확인해야 합니다.";
  }
  if (/generalized|outcomes|case evidence|claims/i.test(raw)) {
    return "특정 사례를 모든 사용자에게 똑같이 적용된다고 해석하면 안 됩니다.";
  }
  if (/license|usage|terms/i.test(raw)) {
    return "사용권과 상업적 활용 조건은 발행 전에 다시 확인해야 합니다.";
  }
  if (/benchmark|comparison/i.test(raw)) {
    return "성능 비교 수치는 원문 기준으로 직접 확인한 뒤 인용해야 합니다.";
  }
  if (/not mean|does not mean|should not/i.test(raw)) {
    return "공식 발표가 모든 사용자의 즉시 활용을 보장한다는 뜻은 아닙니다.";
  }

  return "원문 기준으로 출시 범위, 실제 성능, 과장 가능성을 다시 확인해야 합니다.";
}

function interpretationKorean(candidate) {
  const subtype = candidate.everyday_subtype || candidate.popularization?.everyday_subtype;
  const interpretations = {
    local_personal_ai: "AI 작업이 외부 서비스 중심에서 개인 기기 가까이로 내려오는 흐름",
    creator_studio: "콘텐츠 제작자가 촬영 전에 아이디어를 더 많이 실험하는 흐름",
    editable_image: "AI 이미지 제작의 중심이 생성에서 수정과 재활용으로 이동하는 흐름",
    agent_management: "AI를 쓰는 단계를 넘어 AI 작업을 관리하는 기준이 중요해지는 흐름",
    coding_supervisor: "개발자가 직접 작성자에서 AI 작업 검토자로 역할을 넓히는 흐름",
    research_assistant: "AI가 사무실 도구를 넘어 연구와 실험 보조로 들어오는 흐름",
    defensive_ai: "AI가 만든 결과물을 다시 AI로 점검해야 하는 흐름",
    world_prediction: "영상 AI가 장면 생성에서 움직임 예측으로 확장되는 흐름",
    full_stack_ai: "AI 경쟁이 챗봇 하나에서 업무 전체 운영권으로 넓어지는 흐름"
  };
  if (interpretations[subtype]) return interpretations[subtype];

  const raw = candidate.content_angle || "AI가 일과 콘텐츠 제작 방식에 더 깊게 들어오는 흐름";
  return String(raw)
    .replace(/[.'"]+$/g, "")
    .replace(/설명한다$/g, "설명하는 흐름")
    .replace(/다룬다$/g, "다루는 흐름")
    .replace(/보여준다$/g, "보여주는 흐름")
    .replace(/강조한다$/g, "강조하는 흐름");
}

function officialFactKorean(item, candidate) {
  const source = candidate?.source_name || item.source_name || "공식 출처";
  const date = formatDateKo(candidate?.published_at || item.published_at);
  const core = candidate?.content_structure?.carousel?.cards?.find((card) => card.number === 5)?.body
    || officialCoreKorean(item);
  return `${source}가 ${date} 공개한 원문에서 확인되는 내용입니다. ${core}`;
}

function stripEnglishSourceText(text) {
  return String(text || "")
    .replace(/[A-Z][A-Za-z0-9 .,'’()/-]{30,}\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function verifiedFactsKorean(item) {
  const cards = item.editorial_seed?.content_seed?.carousel_cards || [];
  const facts = [
    officialCoreKorean(item),
    ...cards
      .map((card) => card.body)
      .filter(Boolean)
      .filter((body) => !/주의|다릅니다|확인|보장|가능성과 보장/.test(body))
  ];
  return [...new Set(facts)].slice(0, 4);
}

function uncertainPointsKorean(item) {
  const caution = cautionKorean(item);
  const points = [
    caution,
    "공식 발표와 실제 운영 결과는 분리해서 봐야 합니다.",
    "가격, 출시 범위, 사용권은 발행 전에 원문 기준으로 다시 확인해야 합니다."
  ];
  return [...new Set(points)].slice(0, 3);
}

module.exports = {
  formatDateKo,
  officialCoreKorean,
  cautionKorean,
  interpretationKorean,
  officialFactKorean,
  stripEnglishSourceText,
  verifiedFactsKorean,
  uncertainPointsKorean
};
