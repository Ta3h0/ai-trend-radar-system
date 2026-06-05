const fs = require("fs");
const path = require("path");

const publishForbiddenPhrases = [
  "쉽게 말하면?",
  "왜 내 일과 관련 있나",
  "원문 기준 핵심",
  "아직 조심할 점",
  "한 줄 결론",
  "이 문장은 기술명을 외우게 하려는 제목이 아니라",
  "전문가용 보고서보다",
  "오늘 제작 판단은",
  "card_1:",
  "card_2:",
  "card_3:",
  "card_4:",
  "card_5:",
  "card_6:",
  "card_7:",
  "card_8:"
];

function countOccurrences(text, fragment) {
  if (!fragment) return 0;
  return text.split(fragment).length - 1;
}

function walkPublishPacks(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPublishPacks(fullPath));
    } else if (entry.isFile() && entry.name === "publish-pack.md") {
      files.push(fullPath);
    }
  }
  return files;
}

function validatePublishPacks({ rootDir }) {
  const publishDir = path.join(rootDir, "outputs", "publish");
  const files = walkPublishPacks(publishDir);
  const issues = [];

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    for (const phrase of publishForbiddenPhrases) {
      const count = countOccurrences(text, phrase);
      if (count > 0) {
        issues.push({
          type: "publish_forbidden_phrase",
          filePath,
          pattern: phrase,
          count
        });
      }
    }
  }

  return {
    ok: issues.length === 0,
    scanned: files.length,
    files,
    issues
  };
}

function formatPublishValidationError(result) {
  const rootDir = path.resolve(__dirname, "..");
  const details = result.issues
    .slice(0, 20)
    .map((issue) => `${path.relative(rootDir, issue.filePath)}: ${issue.pattern} (${issue.count})`)
    .join("\n");
  return `Publish pack validation failed\n${details}`;
}

if (require.main === module) {
  const rootDir = path.resolve(__dirname, "..");
  const result = validatePublishPacks({ rootDir });
  if (!result.ok) {
    console.error(formatPublishValidationError(result));
    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    scanned: result.scanned,
    files: result.files.map((filePath) => path.relative(rootDir, filePath))
  }, null, 2));
}

module.exports = {
  publishForbiddenPhrases,
  validatePublishPacks,
  formatPublishValidationError
};
