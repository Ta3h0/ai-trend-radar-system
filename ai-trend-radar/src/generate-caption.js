const { cautionKorean, officialFactKorean, interpretationKorean } = require("./koreanize");

function jargonLines(popularization) {
  const translations = popularization.jargon_translation || [];
  if (translations.length === 0) {
    return "어려운 이름보다 중요한 건 실제로 어디에 쓰이는지입니다.";
  }

  return translations
    .slice(0, 3)
    .map((entry) => `${entry.term}${topicParticle(entry.term)} 쉽게 말해 ${entry.plain}입니다.`)
    .join(" ");
}

function hasFinalConsonant(text) {
  const last = String(text || "").trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function topicParticle(text) {
  return /[A-Za-z0-9-]$/.test(String(text || "").trim())
    ? "는"
    : hasFinalConsonant(text) ? "은" : "는";
}

function removeEasyPrefix(text) {
  return String(text || "")
    .replace(/^쉽게\s*말해[,\s]*/g, "")
    .trim();
}

const profiles = {
  local_personal_ai: {
    first: "회사 파일을 AI에 맡길 때 제일 먼저 떠오르는 걱정은 '이 자료를 밖으로 보내도 되나?'입니다.",
    analogy: "비유하면 공동 사무실에 서류를 들고 가는 대신, 내 책상 위에 작은 비서를 두는 쪽에 가깝습니다.",
    practical: "개인 파일 정리, 회의록 요약, 이미지 확인처럼 사소하지만 자주 반복되는 일에서 먼저 체감될 수 있습니다.",
    caution: "다만 내 기기에서 쓴다는 말이 모든 노트북에서 매끄럽게 돈다는 뜻은 아닙니다.",
    takeaway: "핵심은 AI를 더 안전하고 가볍게 쓰려는 흐름이 개인 사용자에게도 가까워지고 있다는 점입니다.",
    question: "여러분은 AI를 쓸 때 비용이 더 신경 쓰이나요, 개인정보가 더 신경 쓰이나요?"
  },
  creator_studio: {
    first: "촬영장 잡기 전에 머릿속 장면을 먼저 굴려볼 수 있다면, 콘텐츠 제작 속도는 꽤 달라집니다.",
    analogy: "비유하면 카메라를 켜기 전에 작은 가상 무대에서 조명, 배우, 분위기를 미리 리허설하는 겁니다.",
    practical: "릴스 콘셉트, 광고 시안, 쇼츠 오프닝처럼 실패 비용이 큰 장면을 먼저 시험하는 데 잘 맞습니다.",
    caution: "멋진 데모가 곧바로 상업 제작의 완성도를 보장한다는 뜻은 아닙니다.",
    takeaway: "핵심은 촬영 전에 더 많은 아이디어를 미리 비교해볼 수 있다는 점입니다.",
    question: "여러분이라면 촬영 전에 어떤 장면을 AI로 먼저 테스트해보고 싶나요?"
  },
  editable_image: {
    first: "AI 이미지의 진짜 시간 절약은 '처음 만들기'보다 '다시 고치기'에서 나옵니다.",
    analogy: "비유하면 그림을 통째로 지우고 다시 그리는 게 아니라, 배경지와 인물 스티커를 따로 떼어 고치는 방식입니다.",
    practical: "썸네일 배경만 바꾸기, 제품만 교체하기, 상세페이지 분위기만 바꾸기처럼 반복 수정에 바로 연결됩니다.",
    caution: "레이어가 나뉜다고 해서 모든 이미지가 완벽하게 편집 가능한 파일이 되는 것은 아닙니다.",
    takeaway: "핵심은 AI 이미지 작업의 시간이 생성보다 수정 단계에서 더 많이 줄어들 수 있다는 점입니다.",
    question: "AI 이미지에서 여러분이 제일 자주 고치고 싶은 건 배경인가요, 인물인가요, 제품인가요?"
  },
  agent_management: {
    first: "AI에게 일을 시키는 순간, 다음 질문은 '누가 이 일을 관리하지?'가 됩니다.",
    analogy: "비유하면 아르바이트생을 여러 명 뽑아놓고 출근표, 권한표, 업무일지를 새로 만드는 상황과 비슷합니다.",
    practical: "보고서 작성, 고객 응대, 자료 검색처럼 AI가 맡는 일이 늘수록 누가 무엇을 했는지 남기는 장치가 필요합니다.",
    caution: "관리 도구가 나온다고 해서 AI 실수가 사라지는 것은 아닙니다.",
    takeaway: "핵심은 AI를 많이 쓰는 회사일수록 맡기는 법만큼 관리하는 법도 중요해진다는 점입니다.",
    question: "여러분 회사에 AI 직원이 생긴다면 제일 먼저 어떤 규칙이 필요할까요?"
  },
  coding_supervisor: {
    first: "개발자의 일은 코드를 많이 치는 일에서, AI가 만든 결과를 고르는 일로 이동하고 있습니다.",
    analogy: "비유하면 혼자 벽돌을 쌓는 사람에서 여러 작업자를 감독하는 현장 소장에 가까워지는 겁니다.",
    practical: "버그 수정, 기능 초안, 문서화처럼 작은 작업을 나눠 맡기고 사람은 방향과 품질을 확인하는 그림입니다.",
    caution: "AI가 만든 코드가 많아질수록 검토, 보안, 책임 소재는 더 중요해집니다.",
    takeaway: "핵심은 개발자의 가치가 작성 속도보다 검토와 판단 쪽으로 넓어질 수 있다는 점입니다.",
    question: "AI가 코드를 대신 짠다면, 사람 개발자는 어디까지 맡아야 한다고 보시나요?"
  },
  research_assistant: {
    first: "AI가 회의록만 정리하는 도구를 넘어, 연구실에서 다음 실험 후보를 고르는 조수처럼 쓰이기 시작했습니다.",
    analogy: "비유하면 수많은 실험 노트를 뒤져 '다음에는 이 조합을 먼저 보자'고 말해주는 보조 연구원입니다.",
    practical: "신소재, 반도체, 의약품처럼 실험 후보가 너무 많은 분야에서 탐색 시간을 줄이는 방향으로 연결될 수 있습니다.",
    caution: "연구 보조가 곧 발견 보장을 뜻하지는 않습니다. 실험과 검증은 여전히 필요합니다.",
    takeaway: "핵심은 AI가 사무 도구를 넘어 실험과 발견의 속도에도 영향을 줄 수 있다는 점입니다.",
    question: "AI가 연구 속도를 높이면 가장 먼저 바뀔 산업은 어디라고 보시나요?"
  },
  defensive_ai: {
    first: "AI가 코드를 빨리 만들수록, 위험한 구멍도 더 빨리 생길 수 있습니다.",
    analogy: "비유하면 집을 빠르게 짓는 기술이 좋아질수록, 문단속을 확인하는 사람도 더 필요해지는 셈입니다.",
    practical: "작은 쇼핑몰, 사내 도구, 랜딩페이지처럼 개발 속도를 높인 서비스일수록 보안 점검의 중요성이 커집니다.",
    caution: "보안 AI가 있다고 해서 사람이 확인해야 할 책임이 사라지는 것은 아닙니다.",
    takeaway: "핵심은 AI로 만든 코드가 늘어날수록 점검과 방어도 함께 커져야 한다는 점입니다.",
    question: "AI로 만든 서비스가 늘어나면, 보안 점검은 누가 책임져야 할까요?"
  },
  world_prediction: {
    first: "영상 AI가 예쁜 장면을 만드는 단계를 넘어, 다음에 무슨 일이 일어날지 이해하려는 쪽으로 가고 있습니다.",
    analogy: "비유하면 사진 한 장을 꾸미는 앱이 아니라, 공이 굴러가면 어디로 갈지 예상하는 눈을 만드는 일입니다.",
    practical: "로봇 훈련, 게임 장면, 시뮬레이션, 영상 제작에서 움직임을 예측하는 재료가 될 수 있습니다.",
    caution: "장면을 예측한다고 해서 현실 세계를 완벽하게 이해한다는 뜻은 아닙니다.",
    takeaway: "핵심은 영상 AI가 보기 좋은 그림을 넘어 움직임과 물리적 상황을 이해하려 한다는 점입니다.",
    question: "여러분은 이런 AI가 영상 제작에 먼저 쓰일 것 같나요, 로봇에 먼저 쓰일 것 같나요?"
  },
  full_stack_ai: {
    first: "AI 회사들이 이제 챗봇 하나만 팔지 않는 이유가 보이기 시작했습니다.",
    analogy: "비유하면 계산기 하나를 파는 게 아니라, 책상, 직원, 서류함, 전기까지 한 번에 묶어 파는 흐름입니다.",
    practical: "메일 정리, 리서치, 코딩, 산업 현장 도구처럼 회사 업무 전체를 한 묶음으로 잡으려는 방향입니다.",
    caution: "큰 기업의 발표를 작은 팀의 즉시 성과로 바로 일반화하면 안 됩니다.",
    takeaway: "핵심은 AI 회사들의 경쟁이 챗봇 하나에서 업무 전체를 묶는 방향으로 넓어진다는 점입니다.",
    question: "여러분은 AI 회사가 챗봇보다 어떤 업무 도구를 먼저 잘 만들어야 한다고 보시나요?"
  },
  general: {
    first: "AI 뉴스가 어렵게 느껴지는 이유는 기술 이름부터 보기 때문입니다.",
    analogy: "비유하면 제품 설명서를 읽기 전에, 이 물건이 내 책상에서 어디에 놓일지 먼저 보는 겁니다.",
    practical: "일, 돈, 콘텐츠 제작 중 어디에 연결되는지만 먼저 잡아도 훨씬 쉽게 읽힙니다.",
    caution: "가능성과 확정 사실은 분리해서 봐야 합니다.",
    takeaway: "핵심은 기술 이름보다 내 일과 돈, 콘텐츠 제작에서 먼저 바뀌는 부분을 보는 것입니다.",
    question: "여러분은 AI 뉴스를 볼 때 어떤 부분이 제일 어렵게 느껴지나요?"
  }
};

function profileFor(candidate) {
  const subtype = candidate.popularization?.everyday_subtype || "general";
  return profiles[subtype] || profiles.general;
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
    `검증 상태는 source_match_status=${candidate.source_match_status}, fact_check_status=${candidate.fact_check_status}입니다. 이건 편집 판단으로 보면 "좋은 아이디어일 수 있지만 오늘 발행할 자료는 아니다"에 가깝습니다.`,
    "",
    "보류 후보는 버리는 자료가 아닙니다. 원문 링크를 다시 찾고, 발표 날짜와 제목, 핵심 문장이 같은 주제를 가리키는지 확인하면 나중에 다시 살릴 수 있습니다. 지금은 빠르게 만드는 것보다 정확하게 거르는 게 더 중요합니다.",
    "",
    "특히 일반인용 콘텐츠는 더 조심해야 합니다. 인스타 콘텐츠는 첫 장과 캡션만 보고 내용을 받아들이는 경우가 많습니다. 그래서 링크가 어긋난 후보는 '조금 이상하지만 그냥 만들자'가 아니라 '오늘은 만들지 말자'로 처리하는 편이 맞습니다.",
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

function generateCaption(item, candidate) {
  if (candidate.recommended_format === "HOLD") {
    return holdCaption(item, candidate);
  }

  const pop = candidate.popularization || {};
  const profile = profileFor(candidate);
  const hashtags = (candidate.hashtags || ["#AI트렌드", "#AI뉴스", "#AI자동화"]).join(" ");
  const officialFact = officialFactKorean(item, candidate);
  const caution = cautionKorean(item);
  const interpretation = interpretationKorean(candidate);
  const example = pop.everyday_example || profile.practical;
  const plainSummary = removeEasyPrefix(pop.plain_language_summary || "AI가 일과 콘텐츠 제작 방식을 바꾸는 흐름입니다.");

  return [
    profile.first,
    "",
    `${pop.non_expert_hook || candidate.recommended_title}. ${profile.analogy}`,
    "",
    `쉽게 말하면 ${plainSummary} ${example} 내 작업 시간, 비용, 결과물의 속도와 연결해서 보면 훨씬 가깝게 느껴집니다.`,
    "",
    `왜 봐야 하냐면, ${pop.why_people_should_care || "내 일, 돈, 콘텐츠 제작 방식과 연결될 수 있기 때문입니다."} ${profile.practical}`,
    "",
    `공식 자료 기준으로 확인되는 내용은 이렇습니다. ${officialFact} 여기서 해석을 붙이면, 이 변화는 ${interpretation}으로 볼 수 있습니다.`,
    "",
    `${jargonLines(pop)} 처음에는 낯설어도, 실제 사용 장면과 연결하면 훨씬 덜 어렵습니다.`,
    "",
    `조심할 점도 있습니다. ${caution} ${profile.caution} 공식 발표는 방향을 보여주지만, 가격, 사용권, 실제 성능, 적용 범위는 발행 전에 다시 확인해야 합니다.`,
    "",
    profile.takeaway,
    "",
    profile.question,
    "",
    hashtags
  ].join("\n");
}

module.exports = {
  generateCaption
};
