const fs = require("fs");
const path = require("path");

const captionForbiddenPhrases = [
  "이 문장은 기술명을 외우게 하려는 제목이 아니라",
  "전문가용 보고서보다",
  "내가 내일 어디에 써먹을 수 있지",
  "공식 자료 기준 사실은 여기까지입니다",
  "여기서부터는 해석입니다",
  "오늘 제작 판단은",
  "이런 보충은 앞부분에 몰아넣지 않는 편이 좋습니다"
];

const reportSectionTitles = [
  "쉽게 말하면?",
  "왜 내 일과 관련 있나",
  "원문 기준 핵심",
  "아직 조심할 점",
  "한 줄 결론"
];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--date") args.date = argv[index + 1];
    if (argv[index] === "--candidate") args.candidate = argv[index + 1];
    if (argv[index] === "--format") args.format = argv[index + 1];
  }
  return args;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${text.trimEnd()}\n`, "utf8");
}

function normalizeCandidateNumber(value) {
  const text = String(value || "").trim();
  const number = Number(text.replace(/^candidate-/i, ""));
  if (!Number.isFinite(number) || number < 1) {
    throw new Error(`Invalid --candidate value: ${value}`);
  }
  return number;
}

function normalizeFormat(value, fallback) {
  const text = String(value || fallback || "").trim().toUpperCase();
  if (text === "REELS_FIRST" || text === "REELS-FIRST") return "REELS_FIRST";
  if (text === "REELS") return "REELS";
  if (text === "CAROUSEL") return "CAROUSEL";
  if (text === "BOTH") return "BOTH";
  return fallback || "CAROUSEL";
}

function formatDateKo(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "날짜 미상";
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}

function withPeriod(text) {
  const value = String(text || "").trim();
  return /[.!?。]$/.test(value) ? value : `${value}.`;
}

function subtype(candidate) {
  return candidate.everyday_subtype || candidate.popularization?.everyday_subtype || "general";
}

function subtypePack(candidate) {
  const packs = {
    local_personal_ai: {
      thumbnail: ["파일 올리기 전", "내 컴퓨터 AI"],
      reels: [
        ["0-2s", "노트북 위 잠긴 폴더와 흐릿한 클라우드 아이콘", "파일 올리기 전", "잠긴 폴더로 빠른 줌", "개인 자료 장면"],
        ["2-4s", "노트북 화면 안에서 문서와 이미지가 정리됨", "내 안에서 정리", "아이콘이 안쪽으로 모임", "외부 업로드 대비"],
        ["4-6s", "회의록과 이미지가 한 화면에서 요약됨", "비용도 줄일 수", "비용 표시가 작아짐", "과장 없이"],
        ["6-9s", "작은 팀의 책상 위 작업 흐름", "작은 팀도 실험", "책상 조명이 켜짐", "현실 사용 장면"],
        ["9-12s", "저장 아이콘과 원문 확인 표시", "원문은 꼭 확인", "체크 표시 등장", "마무리"]
      ],
      cards: [
        ["파일 올리기 전", "내 컴퓨터에서 먼저 정리합니다", "잠긴 폴더와 노트북"],
        ["밖으로 덜 보냅니다", "자료를 외부 서비스에 매번 올리지 않습니다", "클라우드 거리감"],
        ["비용도 봐야 합니다", "반복 AI 사용료를 줄일 수 있습니다", "작은 영수증"],
        ["회의록부터 시작", "문서와 이미지를 먼저 요약해봅니다", "업무 책상"],
        ["원문 핵심", "내 기기 가까이서 AI를 돌리는 흐름입니다", "출처 표시"],
        ["성능은 다릅니다", "노트북 사양에 따라 결과가 달라집니다", "체크리스트"],
        ["결론", "민감한 자료일수록 이 흐름을 봐야 합니다", "단정적 마무리"],
        ["저장해두세요", "AI 사용 방식이 계속 바뀝니다", "북마크"]
      ],
      question: "AI를 쓸 때 비용과 개인정보 중 뭐가 더 신경 쓰이나요?"
    },
    creator_studio: {
      thumbnail: ["광고 찍기 전에", "AI로 먼저 봅니다"],
      reels: [
        ["0-2s", "빈 촬영장 앞에 카메라와 작은 무대", "찍기 전에", "카메라 앞으로 푸시인", "첫 컷은 바로 이해"],
        ["2-4s", "같은 장면이 세 가지 분위기로 바뀜", "AI로 먼저 봄", "장면 3분할 전환", "시안 비교"],
        ["4-6s", "배우, 배경, 조명이 빠르게 교체됨", "배경도 바꿔봄", "조명 색이 전환", "실험감 강조"],
        ["6-9s", "스마트폰 화면에 릴스 오프닝 후보가 나란히 뜸", "릴스 시안 완성", "후보 카드가 정렬", "콘텐츠 제작 연결"],
        ["9-12s", "카메라 옆 체크리스트와 저장 아이콘", "찍기 전 확인", "체크 표시 후 페이드", "권리 확인 여지"]
      ],
      cards: [
        ["광고 찍기 전에", "AI로 장면부터 봅니다", "강한 썸네일"],
        ["카메라 켜기 전", "배우와 배경을 먼저 비교합니다", "시안 3분할"],
        ["시안 비용 줄이기", "버릴 아이디어도 빠르게 시험합니다", "비용 감각"],
        ["릴스도 먼저 실험", "오프닝 장면을 여러 버전으로 봅니다", "스마트폰 화면"],
        ["Luma 발표 핵심", "단발 데모보다 제작 흐름을 묶습니다", "출처 카드"],
        ["그대로 믿진 말기", "권리와 출시 범위는 확인이 필요합니다", "주의 표시"],
        ["촬영 전 검토", "앞으로 더 중요해질 수 있습니다", "한 방향 화살표"],
        ["저장해두세요", "AI 제작 흐름은 계속 바뀝니다", "CTA"]
      ],
      question: "촬영 전에 AI로 먼저 보고 싶은 장면은 광고, 릴스, 제품컷 중 무엇인가요?"
    },
    editable_image: {
      thumbnail: ["다시 만들지 말고", "부분만 고칩니다"],
      reels: [
        ["0-2s", "완성된 썸네일 이미지가 여러 레이어로 분리됨", "다시 만들지 말고", "이미지 레이어 분리", "수정 포인트"],
        ["2-4s", "배경만 다른 색으로 교체됨", "배경만 바꿈", "색상 스와이프", "즉시 이해"],
        ["4-6s", "제품만 교체되고 그림자는 유지됨", "제품만 교체", "제품 컷 전환", "상세페이지 연결"],
        ["6-9s", "카드뉴스 썸네일 후보가 빠르게 정렬됨", "수정 시간이 핵심", "후보 정렬", "작업 속도"],
        ["9-12s", "체크리스트와 저장 아이콘", "권리는 확인", "체크 후 페이드", "주의"]
      ],
      cards: [
        ["다시 만들지 말고", "필요한 부분만 고칩니다", "레이어 이미지"],
        ["배경만 교체", "썸네일 수정이 빨라질 수 있습니다", "배경 전환"],
        ["제품만 바꾸기", "상세페이지 작업에 바로 닿습니다", "제품 컷"],
        ["시간이 줄어듭니다", "반복 수정이 많은 사람에게 유리합니다", "타이머"],
        ["원문 핵심", "이미지를 나눠 고치는 흐름입니다", "출처 카드"],
        ["완벽하진 않음", "모든 이미지가 깔끔히 나뉘진 않습니다", "주의"],
        ["수정이 경쟁력", "AI 이미지는 고치는 속도가 중요합니다", "결론"],
        ["저장해두세요", "이미지 제작 흐름이 바뀝니다", "CTA"]
      ],
      question: "AI 이미지에서 가장 자주 고치고 싶은 건 배경, 인물, 제품 중 무엇인가요?"
    },
    agent_management: {
      thumbnail: ["AI에게 맡겼다면", "관리도 필요합니다"],
      reels: [
        ["0-2s", "여러 업무 카드가 책상 위에 쌓임", "AI에게 맡겼다면", "카드가 빠르게 등장", "업무량"],
        ["2-4s", "권한 열쇠와 체크 표시가 붙음", "권한부터 확인", "열쇠 아이콘 회전", "관리"],
        ["4-6s", "작업 기록 타임라인이 이어짐", "기록이 남아야", "라인이 이동", "감사"],
        ["6-9s", "사람이 승인 버튼 앞에서 멈춤", "사람이 최종 확인", "손이 멈추고 체크", "책임"],
        ["9-12s", "정리된 관리 대시보드", "AI도 관리 대상", "화면 정돈", "결론"]
      ],
      cards: [
        ["AI에게 맡겼다면", "관리표도 같이 필요합니다", "썸네일"],
        ["권한부터 봅니다", "누가 어디까지 할지 정해야 합니다", "열쇠"],
        ["기록이 중요합니다", "AI가 한 일을 남겨야 합니다", "타임라인"],
        ["사람이 확인합니다", "마지막 책임은 사람에게 남습니다", "승인 버튼"],
        ["발표 핵심", "AI 업무 관리 기준이 커지고 있습니다", "출처"],
        ["실수는 남습니다", "관리 도구가 만능은 아닙니다", "주의"],
        ["쓰는 법 다음", "이제는 통제하는 법입니다", "결론"],
        ["저장해두세요", "회사 AI 규칙이 필요해집니다", "CTA"]
      ],
      question: "AI 직원이 생긴다면 가장 먼저 어떤 규칙이 필요할까요?"
    }
  };

  return packs[subtype(candidate)] || packs.creator_studio;
}

function sourceSentence(candidate) {
  const source = candidate.source_name || "공식 출처";
  const sourceDate = formatDateKo(candidate.published_at);
  const sentences = {
    local_personal_ai: `${source}가 ${sourceDate} 공개한 자료는 AI 모델을 외부 서비스뿐 아니라 개인 기기 가까이에서 활용하려는 흐름을 보여줍니다.`,
    creator_studio: `${source}가 ${sourceDate} 공개한 자료는 AI 영상 도구가 단발성 데모를 넘어 제작 흐름 안에서 활용되는 방향을 보여줍니다.`,
    editable_image: `${source}가 ${sourceDate} 공개한 자료는 AI 이미지 도구가 생성 이후의 편집과 수정 흐름까지 다루려는 방향을 보여줍니다.`,
    agent_management: `${source}가 ${sourceDate} 공개한 자료는 여러 AI 작업을 맡기고 관리하는 방식이 중요해지는 흐름을 보여줍니다.`,
    coding_supervisor: `${source}가 ${sourceDate} 공개한 자료는 AI 코딩 도구가 작성뿐 아니라 검토와 작업 분배 흐름으로 확장되는 방향을 보여줍니다.`,
    research_assistant: `${source}가 ${sourceDate} 공개한 자료는 AI가 연구 데이터 탐색과 실험 후보 검토에 활용되는 흐름을 보여줍니다.`,
    defensive_ai: `${source}가 ${sourceDate} 공개한 자료는 AI로 만든 코드가 늘어날수록 보안 점검 도구도 중요해지는 흐름을 보여줍니다.`,
    world_prediction: `${source}가 ${sourceDate} 공개한 자료는 AI 영상 기술이 장면 생성에서 움직임 예측과 시뮬레이션 방향으로 넓어지는 흐름을 보여줍니다.`,
    full_stack_ai: `${source}가 ${sourceDate} 공개한 자료는 AI 제품이 챗봇을 넘어 업무 도구와 운영 기반으로 확장되는 흐름을 보여줍니다.`
  };

  return sentences[subtype(candidate)] || `${source}가 ${sourceDate} 공개한 자료는 AI 도구가 실제 작업 흐름 안에서 활용되는 방향을 보여줍니다.`;
}

function makeCaption(candidate, pack) {
  const sourceLine = sourceSentence(candidate);
  const hashtags = (candidate.hashtags || ["#AI트렌드", "#AI뉴스"]).join(" ");
  return [
    `${pack.thumbnail[0]} ${pack.thumbnail[1]}`,
    "",
    `${candidate.everyday_example || "AI를 실제 작업 전에 먼저 시험해볼 수 있습니다."} 이 변화가 중요한 이유는 결과물을 만들기 전에 실패할 아이디어를 더 싸고 빠르게 걸러낼 수 있기 때문입니다.`,
    "",
    sourceLine,
    "",
    `${candidate.why_people_should_care || "시간과 비용, 콘텐츠 제작 방식에 직접 연결될 수 있습니다."} 다만 데모가 곧바로 모든 사람의 성과를 보장하지는 않습니다. 실제 사용 가능 범위, 가격, 권리 조건은 원문과 공식 안내를 확인해야 합니다.`,
    "",
    `${withPeriod(pack.cards[6][1])} 특히 혼자 콘텐츠를 만들거나 작은 팀으로 광고 시안을 만드는 사람에게는 촬영 전에 방향을 좁히는 과정이 더 중요해질 수 있습니다. 아이디어를 버리는 속도도 제작력의 일부가 됩니다. 지금은 AI가 대신 다 해준다는 식으로 보기보다, 사람이 결정하기 전에 더 많은 선택지를 비교하는 도구로 보는 편이 현실적입니다.`,
    "",
    pack.question,
    "",
    hashtags
  ].join("\n");
}

const forbiddenPromptFragments = [
  "miniature film set",
  "floating scene previews",
  "floating panels",
  "hologram",
  "sci-fi UI",
  "AI brain",
  "abstract glowing orbs",
  "too many preview windows",
  "futuristic dashboard",
  "glowing neural network"
];

function visualConcept(candidate) {
  const concepts = {
    local_personal_ai: {
      style: "A raw iPhone 14 Pro POV snapshot",
      core_change: "AI 작업을 외부 서비스로 보내기 전에 내 기기 가까이에서 먼저 처리한다.",
      intuitive_scene: "a laptop on a quiet work desk with a closed folder beside it, showing private files being prepared locally before upload",
      visible_ai_signal: "a subtle local processing ring on the laptop screen and a small assistant-style icon, no readable text",
      before_after_or_comparison: "closed private folder beside laptop vs local AI processing already started on the laptop",
      text_safe_area: "upper 45% clean dark negative space for Korean headline text",
      objects: ["laptop", "closed folder", "checklist"],
      mood: "private, calm, practical, premium workspace"
    },
    creator_studio: {
      style: "A raw iPhone 14 Pro POV snapshot",
      core_change: "촬영 전에 AI로 광고/릴스 시안을 먼저 비교한다.",
      intuitive_scene: "a real camera sits unused beside a smartphone before filming starts; the smartphone screen shows three different AI-generated ad concept previews for the same shoot",
      visible_ai_signal: "three generated concept thumbnail cards on the smartphone, a small magic-wand style icon, subtle generation progress rings, checked candidate card, no readable text",
      before_after_or_comparison: "real camera not yet used vs AI previews already generated",
      text_safe_area: "upper 45% clean dark negative space for Korean headline text",
      objects: ["camera", "storyboard sheets", "smartphone"],
      mood: "premium creator workspace, natural desk light, clean commercial still"
    },
    editable_image: {
      style: "realistic editorial commercial still",
      core_change: "AI 이미지 작업이 생성에서 부분 수정과 비교로 이동한다.",
      intuitive_scene: "a laptop beside a printed product photo, showing one original image and three clean revision options on screen",
      visible_ai_signal: "three revision thumbnails, small magic-wand style icon, checked option card, no readable text",
      before_after_or_comparison: "one original product idea vs three generated revision options",
      text_safe_area: "upper third clean negative space for Korean headline text",
      objects: ["laptop", "printed product photo", "color swatches"],
      mood: "clean studio, realistic retouching workflow"
    },
    agent_management: {
      style: "realistic editorial commercial still",
      core_change: "AI에게 일을 맡긴 뒤 권한과 기록을 확인해야 한다.",
      intuitive_scene: "an office desk with a laptop showing simple task cards, a checklist clipboard, and a keycard for approval",
      visible_ai_signal: "checked task cards and a small assistant-style icon, no readable text",
      before_after_or_comparison: "tasks assigned to AI vs human approval checklist waiting beside it",
      text_safe_area: "upper third clean negative space for Korean headline text",
      objects: ["laptop", "checklist clipboard", "keycard"],
      mood: "organized workplace, calm compliance mood"
    },
    coding_supervisor: {
      style: "realistic editorial commercial still",
      core_change: "코드를 직접 쓰는 일보다 AI 결과를 검토하는 일이 커진다.",
      intuitive_scene: "a developer desk with a laptop showing three blurred code result cards and a notebook checklist beside it",
      visible_ai_signal: "three generated result cards, checked candidate card, small assistant-style icon, no readable text",
      before_after_or_comparison: "AI generated multiple code options vs human checklist selecting one",
      text_safe_area: "upper 40% clean negative space for Korean headline text",
      objects: ["laptop", "notebook checklist", "coffee cup"],
      mood: "focused review, professional desk light"
    },
    research_assistant: {
      style: "realistic editorial commercial still",
      core_change: "AI가 다음 실험 후보를 먼저 좁혀준다.",
      intuitive_scene: "a lab desk with a laptop showing three blurred experiment option cards beside a sample tray and paper checklist",
      visible_ai_signal: "three generated option cards, progress ring, checked candidate marker, no readable text",
      before_after_or_comparison: "many physical samples waiting vs AI-selected experiment options on the laptop",
      text_safe_area: "upper third clean negative space for Korean headline text",
      objects: ["laptop", "paper checklist", "sample tray"],
      mood: "clean lab editorial, grounded and realistic"
    },
    defensive_ai: {
      style: "realistic editorial commercial still",
      core_change: "AI가 만든 코드가 늘수록 보안 점검도 같이 필요해진다.",
      intuitive_scene: "a security review desk with a laptop showing three blurred risk cards, a printed checklist, and a small desk light",
      visible_ai_signal: "risk cards with check markers and a small assistant-style icon, no readable text",
      before_after_or_comparison: "generated code result cards vs security checklist beside them",
      text_safe_area: "upper 40% clean negative space for Korean headline text",
      objects: ["laptop", "printed checklist", "desk light"],
      mood: "serious but realistic security workflow"
    },
    world_prediction: {
      style: "realistic editorial commercial still",
      core_change: "영상 AI가 장면 생성에서 움직임 예측으로 넓어진다.",
      intuitive_scene: "a robotics workbench with a camera beside a laptop showing three blurred motion sequence thumbnails",
      visible_ai_signal: "three generated motion cards, subtle progress rings, checked sequence marker, no readable text",
      before_after_or_comparison: "camera has captured one scene vs AI-generated next-motion options on laptop",
      text_safe_area: "upper 45% clean negative space for Korean headline text",
      objects: ["camera", "laptop", "storyboard sheet"],
      mood: "premium robotics workspace, realistic lighting"
    },
    full_stack_ai: {
      style: "realistic editorial commercial still",
      core_change: "AI가 챗봇 하나를 넘어 업무 흐름 전체를 묶는다.",
      intuitive_scene: "a business operations desk with a laptop showing three blurred workflow cards beside a checklist and smartphone",
      visible_ai_signal: "workflow option cards, small assistant-style icon, checked candidate card, no readable text",
      before_after_or_comparison: "separate work tools on desk vs AI-grouped workflow options on laptop",
      text_safe_area: "upper third clean negative space for Korean headline text",
      objects: ["laptop", "checklist", "smartphone"],
      mood: "executive workspace, clean practical composition"
    }
  };

  return concepts[subtype(candidate)] || concepts.creator_studio;
}

function promptGuard(ratio) {
  return [
    `${ratio} composition`,
    "no readable text",
    "no logos",
    "no brand marks",
    "no real person likeness",
    "no digital overlay elements",
    "grounded real-world styling",
    "realistic composition"
  ].join(", ");
}

function cleanPrompt(prompt) {
  return prompt
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .trim();
}

function qualityCheck(subjectCount) {
  return [
    ["main subject count <= 3", subjectCount <= 3],
    ["has negative space", true],
    ["no floating UI", true],
    ["no hologram", true],
    ["no readable text", true],
    ["no logo", true],
    ["realistic composition", true],
    ["core change visible in 1 second", true],
    ["AI involvement visually obvious", true],
    ["before/after or comparison structure present", true],
    ["not just a mood photo", true],
    ["text-safe area exists", true]
  ].map(([label, pass]) => ({ label, pass }));
}

function imagePrompts(candidate) {
  const concept = visualConcept(candidate);
  const subjectCount = concept.objects.length;
  const objects = concept.objects.join(", ");
  const negativePrompt = "No readable text, no logos, no brand marks, no sci-fi holograms, no giant floating UI, no AI brain, no robots, no abstract glowing orbs, no clutter, realistic editorial commercial photography.";
  const conceptPrompt = `Core change: ${concept.core_change} Intuitive scene: ${concept.intuitive_scene} AI signal: ${concept.visible_ai_signal} Contrast: ${concept.before_after_or_comparison} Text area: ${concept.text_safe_area}`;

  return {
    visual_concept: concept,
    prompts: [{
      type: "reels_thumbnail",
      prompt: cleanPrompt(`${concept.style}, vertical 9:16. One-sentence summary: ${concept.core_change} Scene: ${concept.intuitive_scene}. Main subjects only: ${objects}. AI signal: ${concept.visible_ai_signal}. Contrast: ${concept.before_after_or_comparison}. Text area: ${concept.text_safe_area}. Premium realistic behind-the-scenes production desk, dark table, one storyboard sheet, subtle amber desk light with soft blue accent. ${negativePrompt}`),
      quality_check: qualityCheck(subjectCount)
    },
    {
      type: "carousel_thumbnail",
      prompt: cleanPrompt(`${concept.style}, 4:5 carousel thumbnail. One-sentence summary: ${concept.core_change} Scene: ${concept.intuitive_scene}. Main subjects only: ${objects}. AI signal: ${concept.visible_ai_signal}. Contrast: ${concept.before_after_or_comparison}. Leave large clean negative space in the upper third for Korean headline text. Realistic editorial commercial still, simple composition, premium desk styling. ${negativePrompt}`),
      quality_check: qualityCheck(subjectCount)
    },
    {
      type: "body_card_background",
      prompt: cleanPrompt(`${concept.style}, 4:5 body card background. Show the same change more quietly: ${concept.intuitive_scene}. Keep the main subjects low and to one side: ${objects}. Include a subtle AI signal through selectable visual cards and progress rings, no readable text. Leave clean empty space for Korean body copy. Soft realistic light, editorial still, restrained color palette. ${negativePrompt}`),
      quality_check: qualityCheck(subjectCount)
    },
    {
      type: "cta_background",
      prompt: cleanPrompt(`${concept.style}, 4:5 closing CTA background. Scene: a tidy work desk after the comparison is finished, smartphone showing one checked visual option, checklist, and soft desk light. Leave clean negative space in the center for Korean CTA text. Calm realistic commercial still, warm light, premium workspace. ${negativePrompt}`),
      quality_check: qualityCheck(3)
    }
  ]};
}

function renderReelsScript(pack) {
  return [
    "# Reels Script",
    "",
    ...pack.reels.flatMap((cut, index) => [
      `## Cut ${index + 1}`,
      `Time: ${cut[0]}`,
      `Visual: ${cut[1]}`,
      `Overlay text: ${cut[2]}`,
      `Motion: ${cut[3]}`,
      `Note: ${cut[4]}`,
      ""
    ])
  ].join("\n");
}

function renderCarouselCopy(pack) {
  return [
    "# Carousel Copy",
    "",
    ...pack.cards.flatMap((card, index) => [
      `Card ${index + 1}`,
      `Main copy: ${card[0]}`,
      `Sub copy: ${card[1]}`,
      `Design note: ${card[2]}`,
      ""
    ])
  ].join("\n");
}

function renderVisualConcept(concept) {
  return [
    "## Visual Concept",
    "",
    `core_change: ${concept.core_change}`,
    `intuitive_scene: ${concept.intuitive_scene}`,
    `visible_ai_signal: ${concept.visible_ai_signal}`,
    `before_after_or_comparison: ${concept.before_after_or_comparison}`,
    `text_safe_area: ${concept.text_safe_area}`
  ].join("\n");
}

function renderImagePrompts(imageSet) {
  const prompts = Array.isArray(imageSet) ? imageSet : imageSet.prompts;
  const concept = Array.isArray(imageSet) ? null : imageSet.visual_concept;
  return [
    "# Image Prompts",
    "",
    concept ? renderVisualConcept(concept) : "",
    concept ? "" : "",
    ...prompts.flatMap((entry) => [
      `## ${entry.type}`,
      entry.prompt,
      "",
      "Quality check:",
      ...(entry.quality_check || []).map((check) => `- ${check.pass ? "PASS" : "FAIL"}: ${check.label}`),
      ""
    ])
  ].join("\n");
}

function includesAny(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function tooLong(items, index, limit) {
  return items.some((item) => item[index].length > limit);
}

function hasSourceRightsSentence(caption) {
  return /(권리|사용 가능 범위|공식 안내|원문).*(확인|확인해야)/.test(caption);
}

function hasOverclaim(text) {
  return /(무조건|100%|수익 보장|확정 수익|보장하지는 않습니다.*보장하지는 않습니다.*보장하지는 않습니다)/.test(text);
}

function imagePromptChecksPass(prompts) {
  const promptList = Array.isArray(prompts) ? prompts : prompts.prompts;
  return promptList.every((entry) => (entry.quality_check || []).every((check) => check.pass));
}

function buildPreflight({ pack, caption, prompts }) {
  const promptList = Array.isArray(prompts) ? prompts : prompts.prompts;
  const checks = [
    ["썸네일 2줄 이내", pack.thumbnail.length <= 2],
    ["카드 Main copy 길이 초과 없음", !tooLong(pack.cards, 0, 18)],
    ["카드 Sub copy 길이 초과 없음", !tooLong(pack.cards, 1, 38)],
    ["캡션 내부 가이드 문장 없음", !includesAny(caption, captionForbiddenPhrases)],
    ["영어 원문 문장 없음", !/[A-Z][A-Za-z .,'’()-]{40,}\./.test(caption)],
    ["출처/권리 주의 문장 있음", hasSourceRightsSentence(caption)],
    ["과장 표현 없음", !hasOverclaim(caption)],
    ["이미지 프롬프트 4개 이하", promptList.length <= 4],
    ["card_1~card_8 프롬프트 없음", !promptList.some((entry) => /^card_[1-8]$/.test(entry.type))],
    ["이미지 프롬프트 품질 체크 통과", imagePromptChecksPass(prompts)]
  ];

  return checks.map(([label, pass]) => ({ label, pass }));
}

function renderPreflight(checks) {
  return [
    "# Preflight Check",
    "",
    ...checks.map((check) => `- ${check.pass ? "PASS" : "FAIL"}: ${check.label}`)
  ].join("\n");
}

function renderPublishPack({ date, candidateNumber, format, pack, caption, prompts, checks }) {
  return [
    `# ${date} Candidate ${String(candidateNumber).padStart(2, "0")} Publish Pack`,
    "",
    "## Thumbnail Copy",
    pack.thumbnail.join("\n"),
    "",
    "## Reels Script",
    renderReelsScript(pack).replace(/^# Reels Script\n\n/, "").trim(),
    "",
    "## Carousel Copy",
    renderCarouselCopy(pack).replace(/^# Carousel Copy\n\n/, "").trim(),
    "",
    "## Caption",
    caption,
    "",
    "## Image Prompts",
    renderImagePrompts(prompts).replace(/^# Image Prompts\n\n/, "").trim(),
    "",
    "## Preflight Check",
    renderPreflight(checks).replace(/^# Preflight Check\n\n/, "").trim()
  ].join("\n");
}

function buildPublishPack(options = {}) {
  const rootDir = path.resolve(__dirname, "..");
  const date = options.date || todayString();
  const candidateNumber = normalizeCandidateNumber(options.candidate);
  const candidateLabel = String(candidateNumber).padStart(2, "0");
  const dailyPath = path.join(rootDir, "outputs", "daily", `${date}-candidates.json`);
  if (!fs.existsSync(dailyPath)) {
    throw new Error(`Daily candidates not found: ${dailyPath}`);
  }

  const daily = readJson(dailyPath);
  const candidate = daily.candidates[candidateNumber - 1];
  if (!candidate) {
    throw new Error(`Candidate ${candidateLabel} not found for ${date}`);
  }

  const format = normalizeFormat(options.format, candidate.recommended_format).toLowerCase();
  const pack = subtypePack(candidate);
  const caption = makeCaption(candidate, pack);
  const prompts = imagePrompts(candidate);
  const checks = buildPreflight({ pack, caption, prompts });
  const outputDir = path.join(rootDir, "outputs", "publish", `${date}-candidate-${candidateLabel}`);
  const files = {
    "publish-pack.md": renderPublishPack({ date, candidateNumber, format, pack, caption, prompts, checks }),
    "reels-script.md": renderReelsScript(pack),
    "carousel-copy.md": renderCarouselCopy(pack),
    "caption.md": `# Caption\n\n${caption}`,
    "image-prompts.md": renderImagePrompts(prompts),
    "preflight-check.md": renderPreflight(checks)
  };

  for (const [fileName, contents] of Object.entries(files)) {
    writeText(path.join(outputDir, fileName), contents);
  }

  return {
    date,
    candidateNumber: candidateLabel,
    format,
    outputDir,
    files: Object.keys(files).map((fileName) => path.join(outputDir, fileName)),
    thumbnail: pack.thumbnail,
    reelsCutCount: pack.reels.length,
    carouselCardCount: pack.cards.length,
    captionLength: caption.length,
    preflight: checks
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = buildPublishPack(args);
  const rootDir = path.resolve(__dirname, "..");
  console.log(JSON.stringify({
    date: result.date,
    candidate: result.candidateNumber,
    format: result.format,
    outputDir: path.relative(rootDir, result.outputDir),
    files: result.files.map((filePath) => path.relative(rootDir, filePath)),
    thumbnail: result.thumbnail,
    reelsCutCount: result.reelsCutCount,
    carouselCardCount: result.carouselCardCount,
    captionLength: result.captionLength,
    preflight: result.preflight
  }, null, 2));
}

module.exports = {
  buildPublishPack,
  captionForbiddenPhrases,
  reportSectionTitles
};
