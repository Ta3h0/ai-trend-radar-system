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

function titleBank(subject, popularization = {}) {
  const subtype = popularization.everyday_subtype || "general";
  const audienceArea = popularization.audience_area || "일과 콘텐츠";
  const banks = {
    local_personal_ai: {
      general: [
        "AI가 내 노트북 안으로 들어오고 있습니다",
        "회사 파일을 밖에 보내지 않는 AI 사용법",
        "내 컴퓨터에서 먼저 정리하는 AI가 커집니다",
        "AI 비용과 개인정보를 같이 줄이는 흐름",
        "클라우드 밖에서 쓰는 AI가 왜 중요할까"
      ],
      viral: [
        "AI 쓸 때 파일 업로드가 부담된다면",
        "내 자료를 지키는 AI 사용 흐름",
        "AI 비용 아끼는 사람들은 이 흐름을 봅니다",
        "노트북 한 대로 AI 작업을 시작하는 변화",
        "회사 자료 많은 사람은 이 AI 흐름을 봐야 합니다"
      ]
    },
    creator_studio: {
      general: [
        "촬영 전에 장면을 먼저 테스트하는 AI",
        "릴스 아이디어를 찍기 전에 실험합니다",
        "영상 제작의 첫 단계가 바뀌고 있습니다",
        "촬영비 쓰기 전에 AI로 먼저 확인합니다",
        "콘텐츠 시안을 먼저 굴려보는 시대"
      ],
      viral: [
        "촬영장 가기 전에 이 장면부터 봅니다",
        "릴스 만드는 사람은 이 흐름을 놓치면 아깝습니다",
        "광고 시안 만드는 시간이 줄어들 수 있습니다",
        "영상 아이디어 실패 비용을 줄이는 방법",
        "카메라 켜기 전에 AI가 먼저 리허설합니다"
      ]
    },
    editable_image: {
      general: [
        "AI 이미지는 이제 다시 고치는 게 핵심입니다",
        "썸네일 수정 시간이 줄어들 수 있습니다",
        "이미지를 통째로 다시 만들 필요가 줄어듭니다",
        "배경만 바꾸는 AI 이미지 흐름",
        "AI 이미지 작업은 수정 속도 싸움입니다"
      ],
      viral: [
        "썸네일 다시 만들기 전에 이걸 봐야 합니다",
        "AI 이미지에서 진짜 편한 건 수정입니다",
        "배경만 바꾸고 싶은 사람에게 필요한 변화",
        "상세페이지 이미지 수정이 쉬워질 수 있습니다",
        "AI 이미지 작업 시간이 줄어드는 지점"
      ]
    },
    agent_management: {
      general: [
        "AI에게 일을 맡기면 관리도 필요합니다",
        "AI 직원이 늘면 규칙부터 필요해집니다",
        "AI가 한 일을 확인하는 화면이 중요해집니다",
        "업무 AI는 시키는 것보다 관리가 어렵습니다",
        "AI에게 권한을 주기 전에 봐야 할 것"
      ],
      viral: [
        "회사에 AI 직원이 생기면 누가 관리할까",
        "AI가 일할수록 기록이 더 중요해집니다",
        "AI에게 맡긴 일, 그냥 믿어도 될까요",
        "직장인이 먼저 알아야 할 AI 관리 흐름",
        "AI 업무 자동화의 다음 문제는 관리입니다"
      ]
    },
    coding_supervisor: {
      general: [
        "개발자는 이제 AI 작업을 검토합니다",
        "코딩보다 AI 결과 확인이 중요해집니다",
        "코드를 쓰는 일보다 고르는 일이 커집니다",
        "AI 코딩 시대의 개발자 역할 변화",
        "여러 AI 작업을 검토하는 개발자가 됩니다"
      ],
      viral: [
        "AI가 코드를 짜면 개발자는 뭘 할까",
        "코딩 속도보다 검토 능력이 중요해집니다",
        "AI 코드가 많아질수록 사람이 더 봐야 합니다",
        "개발자 일이 사라지는 게 아니라 바뀝니다",
        "AI 코딩 결과를 고르는 사람이 필요합니다"
      ]
    },
    research_assistant: {
      general: [
        "AI가 연구실 조수처럼 쓰이기 시작했습니다",
        "다음 실험 후보를 AI가 먼저 찾아봅니다",
        "연구 속도를 바꾸는 AI 조수",
        "실험 노트를 읽는 AI가 늘어납니다",
        "AI가 회의실을 넘어 연구실로 갑니다"
      ],
      viral: [
        "AI가 연구실에 들어가면 뭐가 달라질까",
        "다음 신약 후보를 찾는 방식이 바뀔 수 있습니다",
        "실험이 많은 산업은 이 변화를 봐야 합니다",
        "AI가 자료 정리를 넘어 실험을 돕습니다",
        "연구 시간이 줄어드는 출발점"
      ]
    },
    defensive_ai: {
      general: [
        "AI가 만든 코드를 지키는 AI도 필요합니다",
        "코드가 빨리 만들어질수록 점검도 빨라져야 합니다",
        "AI 서비스의 다음 문제는 보안입니다",
        "AI 코딩 뒤에는 보안 점검이 따라옵니다",
        "작은 서비스도 AI 보안을 봐야 합니다"
      ],
      viral: [
        "AI로 만든 코드, 그냥 배포해도 될까요",
        "개발 속도가 빨라질수록 구멍도 빨리 생깁니다",
        "AI가 만든 서비스를 지키는 방법",
        "보안 점검 없는 AI 코딩은 위험합니다",
        "작은 회사도 이 AI 보안 흐름을 봐야 합니다"
      ]
    },
    world_prediction: {
      general: [
        "AI 영상은 다음 장면을 예측하기 시작했습니다",
        "예쁜 영상 다음은 움직임을 이해하는 AI입니다",
        "AI가 장면의 다음 움직임을 봅니다",
        "로봇의 눈이 될 수 있는 영상 AI",
        "영상 AI가 현실 움직임을 배우고 있습니다"
      ],
      viral: [
        "AI 영상이 로봇과 연결되는 이유",
        "영상 생성 다음 단계는 움직임 예측입니다",
        "게임과 로봇이 같이 보는 AI 변화",
        "예쁜 장면보다 중요한 건 다음 움직임입니다",
        "AI가 화면 속 세계를 이해하려 합니다"
      ]
    },
    full_stack_ai: {
      general: [
        "AI 회사들은 챗봇 하나만 팔지 않습니다",
        "챗봇 다음은 업무 전체를 묶는 AI입니다",
        "AI가 메일과 리서치와 코딩을 한데 묶습니다",
        "기업용 AI는 도구 묶음으로 커집니다",
        "회사 업무 전체를 노리는 AI 흐름"
      ],
      viral: [
        "챗봇만 보는 사람은 이 흐름을 놓칩니다",
        "AI 회사들이 업무 전체를 노리는 이유",
        "메일부터 코딩까지 묶는 AI 경쟁",
        "기업이 AI를 사는 방식이 바뀔 수 있습니다",
        "AI 경쟁은 이제 업무 패키지 싸움입니다"
      ]
    }
  };

  const bank = banks[subtype] || {
    general: [
      `${subject}가 내 일에 들어오면 달라지는 것`,
      `${subject}로 시간이 줄어드는 지점`,
      `${audienceArea}에서 먼저 체감할 AI 변화`,
      `${subject}를 실제 일상으로 풀어보면`,
      `${subject}가 필요한 사람은 누구일까`
    ],
    viral: [
      `${subject} 때문에 내 작업 순서가 바뀔 수 있습니다`,
      `${subject}를 모르면 AI 흐름이 더 어렵게 보입니다`,
      `${subject}가 돈보다 먼저 바꾸는 것`,
      `${subject}를 써먹는 사람은 여기서 시작합니다`,
      `${audienceArea}에 바로 닿는 AI 변화`
    ]
  };

  return bank;
}

function generateTitleCandidates(item, popularization = {}) {
  const subject = removeJargon(popularization.public_subject || item.editorial_seed?.content_seed?.title_subject || item.original_title || "AI 변화");
  const subjectObject = objectParticle(subject);
  const nonExpertHook = popularization.non_expert_hook || "AI 뉴스 같지만 사실은 내 일 이야기입니다";
  const bank = titleBank(subject, popularization);

  const general = uniqueFive([
    nonExpertHook,
    ...bank.general
  ]);

  const viral = uniqueFive(bank.viral);

  const expert = uniqueFive([
    `${subject}, 원문 기준으로 확인할 핵심`,
    `${subject}, 데모와 실제 활용을 나눠 봐야 합니다`,
    `${subject}, 아직 확인해야 할 조건`,
    `${subjectObject} 과장 없이 보는 체크포인트`,
    `${subject}, 발행 전 봐야 할 원문 포인트`
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
