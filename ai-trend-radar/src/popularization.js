const jargonDictionary = {
  "멀티모달": "글, 이미지, 소리처럼 여러 종류의 입력을 함께 이해하는 방식",
  "에이전틱": "AI가 여러 단계를 스스로 계획하고 실행하려는 방식",
  "agentic": "AI가 여러 단계를 스스로 계획하고 실행하려는 방식",
  "VLM": "이미지와 글을 함께 이해하는 AI",
  "로컬 실행": "인터넷 서버가 아니라 내 기기에서 직접 돌리는 방식",
  "오픈 모델": "누구나 내려받아 실험하거나 수정할 수 있게 공개된 AI 모델",
  "파운데이션 모델": "여러 작업에 재사용되는 큰 기본 AI 모델",
  "월드 모델": "AI가 장면과 행동의 다음 변화를 예측하는 모델",
  "컨텍스트 레이어": "AI가 업무 배경과 필요한 정보를 함께 보게 해주는 구조",
  "거버넌스": "AI를 누가, 어디까지, 어떻게 쓰는지 관리하는 규칙",
  "인프라": "AI 서비스를 돌리기 위한 서버, 데이터센터, 운영 기반",
  "벤치마크": "AI 성능을 비교하기 위해 만든 시험",
  "encoder-free": "별도 변환 장치를 줄이고 입력을 더 직접 처리하는 구조",
  "world model": "AI가 장면과 행동의 다음 변화를 예측하는 모델",
  "foundation model": "여러 작업에 재사용되는 큰 기본 AI 모델",
  "context layer": "AI가 업무 배경과 필요한 정보를 함께 보게 해주는 구조"
};

const bannedThumbnailTerms = [
  "멀티모달",
  "에이전틱",
  "VLM",
  "로컬 실행",
  "오픈 모델",
  "파운데이션 모델",
  "월드 모델",
  "컨텍스트 레이어",
  "거버넌스",
  "인프라",
  "벤치마크"
];

function textBlob(item) {
  return [
    item.original_title,
    item.raw_summary,
    item.raw_content_excerpt,
    item.editorial_seed?.content_seed?.title_subject,
    ...(item.tags || [])
  ].join(" ");
}

function detectedJargon(item) {
  const blob = textBlob(item).toLowerCase();
  return Object.keys(jargonDictionary)
    .filter((term) => blob.includes(term.toLowerCase()))
    .map((term) => ({
      term,
      plain: jargonDictionary[term]
    }));
}

function subject(item) {
  return item.editorial_seed?.content_seed?.title_subject || item.original_title || "AI 변화";
}

function classifyEverydayUse(item) {
  const blob = textBlob(item).toLowerCase();
  const hint = String(item.editorial_seed?.cluster_hint || "").toLowerCase();

  if (hint.includes("gemma") || blob.includes("gemma") || blob.includes("laptop-ready")) {
    return {
      area: "개인 AI 사용",
      subtype: "local_personal_ai",
      example: "회사 자료나 개인 파일을 매번 외부 서비스에 올리지 않고, 내 노트북 안에서 먼저 정리하고 분석하는 흐름이 커질 수 있습니다."
    };
  }
  if (hint.includes("human-after-all") || blob.includes("luma") || blob.includes("creator studio")) {
    return {
      area: "콘텐츠 제작",
      subtype: "creator_studio",
      example: "릴스나 광고를 찍기 전에 배우, 배경, 분위기를 여러 버전으로 먼저 실험해볼 수 있습니다."
    };
  }
  if (hint.includes("stable-layers") || blob.includes("stable-layers") || blob.includes("layer decomposition")) {
    return {
      area: "디자인",
      subtype: "editable_image",
      example: "카드뉴스 썸네일을 통째로 다시 만들지 않고, 배경과 물체를 나눠 고치는 식으로 작업할 수 있습니다."
    };
  }
  if (hint.includes("microsoft-build") || blob.includes("agent 365") || blob.includes("microsoft iq")) {
    return {
      area: "업무 자동화",
      subtype: "agent_management",
      example: "AI에게 일을 맡긴 뒤, 누가 어떤 권한으로 무엇을 했는지 확인하는 관리 화면이 필요해질 수 있습니다."
    };
  }
  if (hint.includes("majorana") || blob.includes("quantum") || blob.includes("scientific")) {
    return {
      area: "연구와 실험",
      subtype: "research_assistant",
      example: "복잡한 실험에서 AI가 데이터를 살피고 다음 실험 후보를 제안하는 조수처럼 쓰일 수 있습니다."
    };
  }
  if (hint.includes("mistral") || blob.includes("vibe") || blob.includes("industrial")) {
    return {
      area: "기업 업무",
      subtype: "full_stack_ai",
      example: "AI 회사가 챗봇 하나만 파는 것이 아니라, 업무 도구와 데이터센터까지 묶어서 제공하려는 흐름입니다."
    };
  }
  if (hint.includes("github-copilot") || blob.includes("github copilot") || blob.includes("coding work")) {
    return {
      area: "개발 업무",
      subtype: "coding_supervisor",
      example: "개발자가 직접 모든 코드를 쓰기보다, 여러 AI 작업을 맡기고 결과를 검토하는 식으로 일이 바뀔 수 있습니다."
    };
  }
  if (hint.includes("glasswing") || blob.includes("security") || blob.includes("cyber")) {
    return {
      area: "보안",
      subtype: "defensive_ai",
      example: "회사 코드나 홈페이지에서 위험한 구멍을 더 빨리 찾고 고치는 도구가 늘어날 수 있습니다."
    };
  }
  if (hint.includes("cosmos") || blob.includes("world model") || blob.includes("physical ai")) {
    return {
      area: "콘텐츠와 로봇",
      subtype: "world_prediction",
      example: "AI가 영상 속 장면을 이해하고 다음 움직임을 예측하면, 로봇·게임·시뮬레이션 제작 방식도 달라질 수 있습니다."
    };
  }

  return {
    area: "일과 돈의 흐름",
    example: "반복 업무를 줄이거나, 콘텐츠 아이디어를 더 빨리 시험해보는 방식으로 연결될 수 있습니다."
  };
}

function plainSummary(item, useCase) {
  const summaries = {
    local_personal_ai: "쉽게 말해, 더 많은 AI 작업을 외부 서버가 아니라 내 기기 가까이에서 처리하려는 흐름입니다.",
    creator_studio: "쉽게 말해, 촬영 전에 여러 장면과 분위기를 AI로 먼저 실험해보는 제작 방식입니다.",
    editable_image: "쉽게 말해, AI 이미지를 한 번 뽑고 끝내는 게 아니라 필요한 부분만 나눠 고치려는 기술입니다.",
    agent_management: "쉽게 말해, 여러 AI에게 일을 맡기려면 관리표와 안전장치도 같이 필요해진다는 이야기입니다.",
    coding_supervisor: "쉽게 말해, 개발자가 코드를 전부 직접 쓰기보다 AI 작업을 나눠 맡기고 검토하는 흐름입니다.",
    research_assistant: "쉽게 말해, AI가 연구 데이터를 살피고 다음 실험 후보를 제안하는 조수처럼 쓰이는 흐름입니다.",
    defensive_ai: "쉽게 말해, AI가 만든 코드가 늘어날수록 그 코드를 지키는 AI도 필요해진다는 이야기입니다.",
    world_prediction: "쉽게 말해, AI가 장면을 예쁘게 만드는 수준을 넘어 다음 움직임까지 이해하려는 흐름입니다.",
    full_stack_ai: "쉽게 말해, AI 회사들이 챗봇 하나가 아니라 업무 도구와 운영 기반까지 함께 묶으려는 흐름입니다."
  };

  return summaries[useCase.subtype] || "쉽게 말해, AI가 사람의 일이나 콘텐츠 제작 과정을 더 빠르게 실험하게 만드는 변화입니다.";
}

function careReason(item, useCase) {
  const why = item.editorial_seed?.why_it_matters || "";
  if (why.includes("privacy") || why.includes("API")) {
    return "AI를 쓰는 비용, 개인정보, 작업 속도와 연결되기 때문에 개인 사용자와 작은 팀이 관심을 가질 만합니다.";
  }
  if (why.includes("creator") || why.includes("video") || why.includes("content")) {
    return "콘텐츠를 만드는 사람이 촬영, 편집, 시안 제작 전에 더 많은 아이디어를 싸게 시험해볼 수 있기 때문입니다.";
  }
  if (why.includes("developers") || why.includes("code")) {
    return "AI가 일을 대신 끝내는 것이 아니라, 사람이 여러 AI 작업을 검토하고 지휘하는 방식으로 역할이 바뀔 수 있기 때문입니다.";
  }
  return `${useCase.area}에 직접 연결될 수 있기 때문에, 기술 뉴스가 아니라 내 일상과 일의 방식 변화로 볼 수 있습니다.`;
}

function nonExpertHook(item, useCase) {
  if (useCase.subtype === "local_personal_ai") return "AI를 인터넷 밖, 내 노트북 안에서 쓰는 흐름이 커지고 있습니다";
  if (useCase.subtype === "creator_studio") return "촬영 전에 영상 아이디어를 먼저 실험하는 시대가 오고 있습니다";
  if (useCase.subtype === "editable_image") return "AI 이미지는 이제 만드는 것보다 고치는 게 더 중요해집니다";
  if (useCase.subtype === "agent_management") return "AI에게 일을 맡겼다면, 이제 관리하는 법도 필요합니다";
  if (useCase.subtype === "coding_supervisor") return "개발자는 코드를 쓰는 사람에서 AI 작업을 검토하는 사람으로 바뀝니다";
  if (useCase.subtype === "research_assistant") return "AI가 회의실을 넘어 연구실 조수처럼 쓰이기 시작했습니다";
  if (useCase.subtype === "defensive_ai") return "AI가 코드를 짜는 만큼, 코드를 지키는 AI도 필요해집니다";
  if (useCase.subtype === "world_prediction") return "AI 영상은 이제 예쁜 장면을 넘어 로봇의 눈이 되고 있습니다";
  if (useCase.subtype === "full_stack_ai") return "AI 회사들은 이제 챗봇 하나만 팔지 않습니다";
  if (useCase.area === "보안") return "AI가 코드를 짜는 만큼, 코드를 지키는 AI도 필요해집니다";
  if (useCase.area === "개인 AI 사용") return "AI를 인터넷 서비스가 아니라 내 기기에서 쓰는 흐름이 커지고 있습니다";
  if (useCase.area === "업무 자동화") return "직접 일하는 사람에서 AI 작업을 지휘하는 사람으로 바뀌고 있습니다";
  if (useCase.area === "연구와 실험") return "AI가 회의실을 넘어 연구실 조수처럼 쓰이기 시작했습니다";

  return "AI 뉴스 같지만 사실은 일하는 방식 이야기입니다";
}

function expertNote(item, jargon) {
  if (jargon.length === 0) {
    return "전문 보충: 원문 기준 사실과 출시 범위를 확인한 뒤, 기능보다 활용 맥락을 중심으로 설명합니다.";
  }

  return `전문 보충: 이 후보에는 ${jargon.map((entry) => entry.term).join(", ")} 같은 용어가 포함됩니다. 본문 앞부분에서는 쉬운 비유로 풀고, 기술 설명은 후반부에 배치합니다.`;
}

function scorePopularization(item, useCase, jargon) {
  const visual = item.editorial_seed?.sample_signals?.visual_impact || 5;
  const hook = item.editorial_seed?.sample_signals?.hook_strength || 5;
  const save = item.editorial_seed?.sample_signals?.save_value || 5;
  const jargonPenalty = Math.min(10, jargon.length * 2);
  const scrollStopScore = Math.max(1, Math.min(10, Math.round((visual * 0.5) + (hook * 0.4) + (useCase.area === "콘텐츠 제작" ? 1 : 0))));
  const easyUnderstandingScore = Math.max(1, Math.min(10, Math.round((save * 0.4) + 6 - jargonPenalty * 0.35)));

  return {
    scroll_stop_score: scrollStopScore,
    easy_understanding_score: easyUnderstandingScore,
    jargon_penalty: jargonPenalty
  };
}

function createPopularization(item) {
  const useCase = classifyEverydayUse(item);
  const jargon = detectedJargon(item);
  const scores = scorePopularization(item, useCase, jargon);

  return {
    non_expert_hook: nonExpertHook(item, useCase),
    plain_language_summary: plainSummary(item, useCase),
    why_people_should_care: careReason(item, useCase),
    everyday_example: useCase.example,
    jargon_translation: jargon,
    expert_note: expertNote(item, jargon),
    ...scores
  };
}

function removeJargon(title) {
  let next = String(title || "");
  const replacements = {
    "멀티모달 AI": "여러 자료를 한 번에 이해하는 AI",
    "멀티모달": "여러 자료를 이해하는",
    "에이전틱": "스스로 일을 나누는",
    "VLM": "이미지 이해 AI",
    "로컬 실행": "내 기기에서 쓰는 방식",
    "오픈 모델": "공개형 AI",
    "파운데이션 모델": "기본 AI 모델",
    "월드 모델": "세상을 예측하는 AI",
    "컨텍스트 레이어": "업무 맥락 연결",
    "거버넌스": "관리 규칙",
    "인프라": "운영 기반",
    "벤치마크": "성능 시험"
  };

  for (const [term, replacement] of Object.entries(replacements)) {
    next = next.replaceAll(term, replacement);
  }
  return next;
}

function containsBannedThumbnailJargon(title) {
  return bannedThumbnailTerms.some((term) => String(title || "").includes(term));
}

module.exports = {
  createPopularization,
  removeJargon,
  containsBannedThumbnailJargon,
  bannedThumbnailTerms
};
