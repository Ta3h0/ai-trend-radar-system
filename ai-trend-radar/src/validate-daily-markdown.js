const fs = require("fs");
const path = require("path");

const forbiddenPhrases = [
  "이건 기술 뉴스가 아니라 돈과 일의 변화입니다",
  "AI를 잘 몰라도 이 변화는 봐야 합니다",
  "이제 중요한 건 AI 이름보다 내가 써먹는 방법입니다",
  "오늘 AI 변화, 쉽게 보면 이겁니다",
  "공식 발표와 해석을 분리해서 봐야 합니다",
  "가능성과 확정 사실을 나눠서 봐야 합니다",
  "이 문장은 기술명을 외우게 하려는 제목이 아니라",
  "그래서 이 소재는 전문가용 보고서보다",
  "전문가용 보고서보다",
  "내가 내일 어디에 써먹을 수 있지?",
  "원문에서 확인된 내용과 우리가 붙이는 의미를 분리해야 과장이 줄어듭니다",
  "이런 보충은 앞부분에 몰아넣지 않는 편이 좋습니다",
  "먼저 쉬운 장면으로 멈추게 하고",
  "저장한 사람이 뒤에서 기술 포인트를 확인하게 만드는 구성이 인스타에 더 맞습니다",
  "오늘 제작 판단은"
];

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--date") args.date = argv[index + 1];
  }
  return args;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function countOccurrences(text, fragment) {
  if (!fragment) return 0;
  return text.split(fragment).length - 1;
}

function lineHits(text, matcher) {
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ line, line_number: index + 1 }))
    .filter(({ line }) => matcher(line));
}

function validateDailyMarkdown({ rootDir, date }) {
  const markdownPath = path.join(rootDir, "outputs", "daily", `${date}-candidates.md`);
  const issues = [];

  if (!fs.existsSync(markdownPath)) {
    return {
      ok: false,
      markdownPath,
      issues: [{
        type: "missing_markdown",
        message: `Markdown report not found: ${markdownPath}`
      }]
    };
  }

  const text = fs.readFileSync(markdownPath, "utf8");

  for (const phrase of forbiddenPhrases) {
    const count = countOccurrences(text, phrase);
    if (count > 0) {
      issues.push({
        type: "forbidden_phrase",
        pattern: phrase,
        count
      });
    }
  }

  for (let index = 1; index <= 8; index += 1) {
    const pattern = `card_${index}:`;
    const count = countOccurrences(text, pattern);
    if (count > 0) {
      issues.push({
        type: "forbidden_card_prompt",
        pattern,
        count
      });
    }
  }

  const badCardLines = lineHits(text, (line) => /^[-*]?\s*Card\s+\d+(?:\s+(?:Thumbnail|CTA))?\s*:\s+.*\/.*$/i.test(line));
  for (const hit of badCardLines) {
    issues.push({
      type: "bad_card_structure",
      line_number: hit.line_number,
      line: hit.line
    });
  }

  const bulletCardLines = lineHits(text, (line) => /^[-*]\s+Card\s+\d+/i.test(line));
  for (const hit of bulletCardLines) {
    issues.push({
      type: "bad_card_bullet_structure",
      line_number: hit.line_number,
      line: hit.line
    });
  }

  return {
    ok: issues.length === 0,
    markdownPath,
    issues
  };
}

function formatValidationError(result) {
  const relativePath = path.relative(path.resolve(__dirname, ".."), result.markdownPath);
  const details = result.issues
    .slice(0, 20)
    .map((issue) => {
      if (issue.line_number) return `${issue.type} at line ${issue.line_number}: ${issue.line}`;
      return `${issue.type}: ${issue.pattern || issue.message} (${issue.count || 1})`;
    })
    .join("\n");
  return `Daily markdown validation failed for ${relativePath}\n${details}`;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date || todayString();
  const rootDir = path.resolve(__dirname, "..");
  const result = validateDailyMarkdown({ rootDir, date });

  if (!result.ok) {
    console.error(formatValidationError(result));
    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    date,
    markdownPath: path.relative(rootDir, result.markdownPath)
  }, null, 2));
}

module.exports = {
  forbiddenPhrases,
  validateDailyMarkdown,
  formatValidationError
};
