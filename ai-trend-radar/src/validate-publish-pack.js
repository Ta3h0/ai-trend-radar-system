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

const publishPromptTypes = [
  "reels_thumbnail",
  "carousel_thumbnail",
  "body_card_background",
  "cta_background"
];

function countOccurrences(text, fragment) {
  if (!fragment) return 0;
  return text.split(fragment).length - 1;
}

function extractPromptBlock(text, type) {
  const header = `## ${type}`;
  const start = text.indexOf(header);
  if (start === -1) return null;

  const afterHeader = text.slice(start + header.length).replace(/^\r?\n/, "");
  const nextHeader = afterHeader.search(/\r?\n##\s/);
  const block = nextHeader === -1 ? afterHeader : afterHeader.slice(0, nextHeader);
  const prompt = block.split(/\r?\n\r?\nPrompt constraint check:/)[0].trim();
  return {
    type,
    block,
    prompt
  };
}

function countKoreanChars(text) {
  const matches = String(text || "").match(/[가-힣]/g);
  return matches ? matches.length : 0;
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

    const qualityCheckCount = countOccurrences(text, "Quality check:");
    if (qualityCheckCount > 0) {
      issues.push({
        type: "publish_prompt_old_check_label",
        filePath,
        pattern: "Quality check:",
        count: qualityCheckCount
      });
    }

    for (const promptType of publishPromptTypes) {
      const promptBlock = extractPromptBlock(text, promptType);
      if (!promptBlock) {
        issues.push({
          type: "publish_prompt_missing",
          filePath,
          pattern: promptType,
          count: 1
        });
        continue;
      }

      const koreanCharCount = countKoreanChars(promptBlock.prompt);
      if (koreanCharCount > 0) {
        issues.push({
          type: "publish_prompt_non_english",
          filePath,
          pattern: promptType,
          count: koreanCharCount
        });
      }

      if (!promptBlock.block.includes("Prompt constraint check:")) {
        issues.push({
          type: "publish_prompt_constraint_check_missing",
          filePath,
          pattern: promptType,
          count: 1
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
  publishPromptTypes,
  validatePublishPacks,
  formatPublishValidationError
};
