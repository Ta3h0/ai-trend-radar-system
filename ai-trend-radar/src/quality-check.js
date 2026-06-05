const genericUrlTokens = new Set([
  "http",
  "https",
  "www",
  "com",
  "en",
  "articles",
  "article",
  "blog",
  "blogs",
  "news",
  "source",
  "features",
  "innovation",
  "technology",
  "research",
  "product",
  "products",
  "introducing",
  "latest"
]);

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !genericUrlTokens.has(token));
}

function urlTokens(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    return tokenize(`${url.hostname} ${url.pathname}`);
  } catch {
    return [];
  }
}

function domainMatchesSource(item) {
  if (!item.source_url) return false;

  const sourceName = String(item.source_name || "").toLowerCase();
  let hostname = "";
  try {
    hostname = new URL(item.source_url).hostname.toLowerCase();
  } catch {
    return false;
  }

  const domainHints = [
    ["openai", "openai.com"],
    ["anthropic", "anthropic.com"],
    ["google", "google"],
    ["meta", "meta.com"],
    ["microsoft", "microsoft.com"],
    ["github", "github"],
    ["luma", "luma"],
    ["runway", "runway"],
    ["stability", "stability.ai"],
    ["mistral", "mistral.ai"]
  ];

  const hint = domainHints.find(([name]) => sourceName.includes(name));
  return hint ? hostname.includes(hint[1]) : true;
}

function validateSourceMatch(item) {
  if (!item.source_url) {
    return {
      source_match_status: "MISSING_SOURCE",
      source_match_score: 0,
      source_match_notes: ["출처 URL이 없어 발행 전 원문 확인이 필요합니다."]
    };
  }

  if (!domainMatchesSource(item)) {
    return {
      source_match_status: "MISMATCH",
      source_match_score: 0,
      source_match_notes: ["출처명과 링크 도메인이 일치하지 않습니다."]
    };
  }

  const urlTermSet = new Set(urlTokens(item.source_url));
  const sourceText = [
    item.original_title,
    item.raw_summary,
    item.raw_content_excerpt,
    ...(item.tags || [])
  ].join(" ");
  const textTermSet = new Set(tokenize(sourceText));
  const shared = [...urlTermSet].filter((token) => textTermSet.has(token));
  const score = urlTermSet.size === 0 ? 7 : Math.round((shared.length / urlTermSet.size) * 10);

  const lowerUrl = item.source_url.toLowerCase();
  const lowerText = sourceText.toLowerCase();
  const releaseNotesOnCustomInstructions =
    lowerUrl.includes("custom-instructions") &&
    (lowerText.includes("release notes") || lowerText.includes("model retirement") || lowerText.includes("active sessions"));

  if (releaseNotesOnCustomInstructions) {
    return {
      source_match_status: "MISMATCH",
      source_match_score: score,
      source_match_notes: ["요약은 ChatGPT 릴리즈 노트인데 링크 경로는 custom instructions 문서입니다."]
    };
  }

  if (urlTermSet.size >= 2 && shared.length === 0 && item.source_type !== "official_product_page") {
    return {
      source_match_status: "MISMATCH",
      source_match_score: score,
      source_match_notes: ["링크 경로의 핵심 주제어와 원자료 요약의 주제어가 겹치지 않습니다."]
    };
  }

  if (score < 4) {
    return {
      source_match_status: "WEAK_MATCH",
      source_match_score: score,
      source_match_notes: ["링크와 요약의 주제 연결이 약합니다. 발행 전 원문을 다시 확인하세요."]
    };
  }

  return {
    source_match_status: "MATCH",
    source_match_score: score,
    source_match_notes: ["출처 링크와 요약 주제가 일치합니다."]
  };
}

function factCheckStatus(item, sourceMatch) {
  if (sourceMatch.source_match_status === "MISMATCH") return "HOLD_SOURCE_MISMATCH";
  if (sourceMatch.source_match_status === "MISSING_SOURCE") return "NEEDS_SOURCE";
  if ((item.verified_facts || item.editorial_seed?.verified_facts || []).length < 2) return "NEEDS_MORE_FACTS";
  if (item.source_tier === "S" && sourceMatch.source_match_status === "MATCH") return "VERIFIED_PRIMARY_SOURCE";
  if (item.source_tier === "B") return "RESEARCH_NEEDS_CONTEXT";
  if (sourceMatch.source_match_status === "WEAK_MATCH") return "NEEDS_RECHECK";
  return "VERIFIED_WITH_CAUTION";
}

module.exports = {
  validateSourceMatch,
  factCheckStatus
};
