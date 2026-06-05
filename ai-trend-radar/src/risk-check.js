const highRiskTerms = [
  "guaranteed",
  "passive income",
  "수익 보장",
  "확정 수익",
  "무조건",
  "코인",
  "투자",
  "리딩방",
  "medical",
  "legal",
  "fake quote"
];

function classifyRisk(item) {
  const seed = item.editorial_seed || {};
  const signals = seed.sample_signals || {};

  if (signals.risk_level) {
    return {
      risk_level: signals.risk_level,
      risk_notes: signals.risk_notes || []
    };
  }

  const haystack = [
    item.original_title,
    item.raw_summary,
    item.raw_content_excerpt,
    ...(item.tags || [])
  ].join(" ").toLowerCase();

  const matchedHighRisk = highRiskTerms.filter((term) => haystack.includes(term.toLowerCase()));
  if (matchedHighRisk.length > 0 || !item.source_url || item.source_tier === "D") {
    return {
      risk_level: "HIGH",
      risk_notes: ["High-risk wording, missing source, or D-tier source detected."]
    };
  }

  if (["A", "C"].includes(item.source_tier)) {
    return {
      risk_level: "MEDIUM",
      risk_notes: ["Community or trend source requires verification through primary sources."]
    };
  }

  return {
    risk_level: "LOW",
    risk_notes: ["Primary or structured source with low default risk."]
  };
}

module.exports = {
  classifyRisk
};
