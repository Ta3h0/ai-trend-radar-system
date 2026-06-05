function formatLabel(format) {
  if (format === "REELS_FIRST") return "릴스 먼저, 이후 카드뉴스";
  if (format === "REELS") return "릴스";
  if (format === "CAROUSEL") return "카드뉴스";
  if (format === "BOTH") return "릴스와 카드뉴스";
  return "보류";
}

function jargonLines(popularization) {
  const translations = popularization.jargon_translation || [];
  if (translations.length === 0) {
    return "전문용어로 복잡하게 볼 필요는 없습니다. 핵심은 이 변화가 내 일과 콘텐츠 제작에 어떤 영향을 주는지입니다.";
  }

  return translations
    .slice(0, 3)
    .map((entry) => `${entry.term}은 쉽게 말해 ${entry.plain}입니다.`)
    .join(" ");
}

function koreanizeFact(fact, candidate) {
  const text = String(fact || "");
  if (!text) return "공식 자료에서 확인된 변화가 있습니다.";

  if (/published/i.test(text)) {
    return `${candidate.source_name || "공식 출처"}가 ${candidate.published_at || "해당 날짜"}에 관련 내용을 공개했습니다.`;
  }
  if (/announced/i.test(text)) {
    return `${candidate.source_name || "공식 출처"}가 원문에서 이 내용을 발표했습니다.`;
  }
  if (/says/i.test(text) || /describes/i.test(text)) {
    return `${candidate.source_name || "공식 출처"} 원문에서 확인되는 설명입니다.`;
  }
  if (/introduced/i.test(text)) {
    return `${candidate.source_name || "공식 출처"}가 원문에서 새 변화로 소개한 내용입니다.`;
  }

  return text;
}

function holdCaption(item, candidate) {
  const pop = candidate.popularization || {};
  const hashtags = (candidate.hashtags || ["#AI트렌드", "#AI뉴스"]).join(" ");

  return [
    "이건 오늘 만들지 않는 게 맞습니다.",
    "",
    "겉으로 보면 좋은 AI 소재처럼 보일 수 있습니다. 제목도 만들 수 있고, 카드뉴스 구조도 잡을 수 있습니다. 그런데 원문 요약과 링크 주제가 맞지 않으면, 일반인에게 쉽게 설명하기 전에 먼저 멈춰야 합니다.",
    "",
    `쉽게 말하면 이런 상황입니다. ${pop.plain_language_summary || "자료의 핵심과 링크가 서로 다른 방향을 가리키고 있습니다."} 이런 후보를 그대로 발행하면 독자는 내용보다 신뢰 문제를 먼저 느낄 수 있습니다.`,
    "",
    `공식 자료 기준으로 다시 확인해야 할 지점은 source_match_status=${candidate.source_match_status}, fact_check_status=${candidate.fact_check_status}입니다. 이건 편집국 입장에서 "좋은 아이디어지만 오늘 발행할 자료는 아니다"에 가깝습니다.`,
    "",
    "이런 보류 후보는 버리는 게 아닙니다. 원문 링크를 다시 찾고, 발표 날짜와 제목, 핵심 문장이 같은 주제를 가리키는지 확인하면 나중에 다시 살릴 수 있습니다. 하지만 지금은 빠르게 만드는 것보다 정확하게 거르는 게 더 중요합니다.",
    "",
    "특히 일반인용 콘텐츠는 더 조심해야 합니다. 전문가 보고서는 독자가 원문을 다시 확인할 가능성이 높지만, 인스타 콘텐츠는 첫 장과 캡션만 보고 내용을 받아들이는 경우가 많습니다. 그래서 링크가 어긋난 후보는 '조금 이상하지만 그냥 만들자'가 아니라 '오늘은 만들지 말자'로 처리하는 편이 맞습니다.",
    "",
    "다시 살리려면 세 가지를 확인하면 됩니다. 첫째, 원문 제목이 후보 주제와 같은지 봅니다. 둘째, 발표 주체가 실제로 그 내용을 말했는지 확인합니다. 셋째, 링크가 도움말 문서나 다른 주제 문서가 아니라 해당 발표의 원문인지 확인합니다.",
    "",
    "오늘 결론: 출처가 흔들리는 AI 뉴스는 아무리 흥미로워도 보류합니다.",
    "",
    "여러분은 AI 뉴스 볼 때 제목과 링크가 안 맞는 자료를 본 적 있나요?",
    "",
    hashtags
  ].join("\n");
}

function captionIntro(candidate) {
  const pop = candidate.popularization || {};
  const hook = pop.non_expert_hook || candidate.recommended_title;
  const example = pop.everyday_example || "내 일과 콘텐츠 제작 방식이 조금씩 달라질 수 있습니다.";

  if (candidate.recommended_format === "REELS_FIRST") {
    return [
      hook,
      "",
      `이건 먼저 보여주고, 나중에 설명해야 하는 소재입니다. 어려운 기술 이름부터 꺼내면 대부분 그냥 넘기지만, ${example}라고 말하면 훨씬 빨리 이해됩니다.`
    ].join("\n");
  }

  return [
    hook,
    "",
    `AI 뉴스처럼 보이지만 사실은 일상 이야기입니다. ${example} 이 한 문장으로 시작하면, AI를 잘 모르는 사람도 "그래서 나한테 무슨 변화가 생기는데?" 하고 멈출 수 있습니다.`
  ].join("\n");
}

function generateCaption(item, candidate) {
  if (candidate.recommended_format === "HOLD") {
    return holdCaption(item, candidate);
  }

  const pop = candidate.popularization || {};
  const hashtags = (candidate.hashtags || ["#AI트렌드", "#AI뉴스", "#AI자동화"]).join(" ");
  const officialFact = koreanizeFact((candidate.verified_facts || [])[0], candidate);
  const caution = (candidate.uncertain_points || [])[0] || "실제 사용 가능 범위와 조건은 원문 기준으로 다시 확인해야 합니다.";
  const format = formatLabel(candidate.recommended_format);

  return [
    captionIntro(candidate),
    "",
    `쉽게 말하면, ${pop.plain_language_summary || candidate.source_summary} 여기서 중요한 건 모델 이름이나 회사 이름을 외우는 게 아닙니다. 이 변화가 내 일, 돈, 콘텐츠 제작 흐름에 어떤 영향을 주는지 보는 겁니다.`,
    "",
    `왜 신경 써야 할까요? ${pop.why_people_should_care || candidate.why_it_matters} 예전에는 전문 장비나 큰 팀이 있어야 가능했던 실험을, 이제는 더 작은 단위로 먼저 해볼 수 있는 흐름이 생기고 있습니다. 보고서를 읽는 느낌보다 "내가 내일 써먹을 수 있는가"로 봐야 합니다.`,
    "",
    `현실 예시로 보면 더 쉽습니다. ${pop.everyday_example || "반복 업무를 줄이거나 콘텐츠 시안을 더 빨리 만들어보는 식으로 연결할 수 있습니다."} 이런 식으로 설명하면 기술을 잘 모르는 사람도 자기 일상과 연결해서 이해할 수 있습니다.`,
    "",
    `공식 자료 기준 사실은 여기까지입니다. ${officialFact} 여기서부터는 해석입니다. 이 변화는 ${candidate.content_angle || "AI가 일과 콘텐츠 제작 방식에 들어오는 흐름"}으로 볼 수 있습니다. 사실과 해석을 섞지 않는 게 중요합니다.`,
    "",
    `${jargonLines(pop)} 전문 보충은 뒤로 미뤄도 됩니다. 먼저 쉬운 예시로 붙잡고, 저장한 사람에게만 원문 기준 기술 포인트를 설명하는 식이 인스타에서는 더 잘 맞습니다.`,
    "",
    `조심할 점도 있습니다. ${caution} 공식 발표라고 해도 모든 사람이 바로 같은 결과를 얻는다는 뜻은 아닙니다. 사용권, 출시 범위, 실제 성능은 확인해야 합니다.`,
    "",
    `오늘 제작 판단은 ${format}입니다. 첫 장은 쉬운 일상 변화로 멈추게 하고, 중간에는 현실 예시, 후반에는 공식 사실과 전문 보충을 넣는 구성이 좋습니다.`,
    "",
    "여러분이라면 이 변화를 일에서 먼저 써보고 싶나요, 콘텐츠 제작에서 먼저 써보고 싶나요?",
    "",
    hashtags
  ].join("\n");
}

module.exports = {
  generateCaption
};
