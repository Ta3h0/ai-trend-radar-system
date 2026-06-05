const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--date") args.date = argv[index + 1];
  }
  return args;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function bulletList(items, fallback = "None") {
  if (!items || items.length === 0) return `- ${fallback}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function numberedList(items) {
  return (items || []).map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function formatAssetList(items, fallback = "None") {
  if (!items || items.length === 0) return fallback;
  return items.join(", ");
}

function cleanReportValue(value, fallback = "None") {
  if (!value) return fallback;
  if (String(value).toLowerCase() === "not applicable") return fallback;
  return value;
}

function productionScore(candidate) {
  const formatBoost = candidate.recommended_format === "REELS_FIRST" ? 8
    : candidate.recommended_format === "REELS" ? 6
      : candidate.recommended_format === "CAROUSEL" ? 4
        : candidate.recommended_format === "BOTH" ? 5
          : 0;
  return candidate.scores.final_score
    + formatBoost
    + candidate.scores.hook_score
    + candidate.scores.visual_score
    + (candidate.scroll_stop_score || 0)
    + (candidate.easy_understanding_score || 0)
    - (candidate.jargon_penalty || 0);
}

function topCandidate(candidates, formats, excludeIds = new Set()) {
  return [...candidates]
    .filter((candidate) => formats.includes(candidate.recommended_format))
    .filter((candidate) => !excludeIds.has(candidate.id))
    .filter((candidate) => candidate.scores.publish_recommendation !== "HOLD")
    .sort((a, b) => productionScore(b) - productionScore(a))[0] || null;
}

function topPicks(candidates) {
  const topReels = topCandidate(candidates, ["REELS_FIRST", "REELS", "BOTH"]);
  const excludeForCarousel = new Set(topReels ? [topReels.id] : []);
  const topCarousel = topCandidate(candidates, ["CAROUSEL", "BOTH"], excludeForCarousel)
    || topCandidate(candidates, ["CAROUSEL", "BOTH", "REELS_FIRST"], excludeForCarousel);
  const holdCandidates = candidates
    .filter((candidate) => candidate.recommended_format === "HOLD" || candidate.scores.publish_recommendation === "HOLD")
    .map((candidate) => candidate.recommended_title);

  return {
    top_reels: topReels ? {
      id: topReels.id,
      title: topReels.recommended_title,
      format: topReels.recommended_format,
      score: topReels.scores.final_score,
      reason: `Scroll ${topReels.scroll_stop_score}/10, Easy ${topReels.easy_understanding_score}/10, ${topReels.fact_check_status}`
    } : null,
    top_carousel: topCarousel ? {
      id: topCarousel.id,
      title: topCarousel.recommended_title,
      format: topCarousel.recommended_format,
      score: topCarousel.scores.final_score,
      reason: `Easy ${topCarousel.easy_understanding_score}/10, Save ${topCarousel.scores.usefulness_score}/10, ${topCarousel.fact_check_status}`
    } : null,
    hold_candidates: holdCandidates
  };
}

function formatTopPick(label, pick) {
  if (!pick) return `- ${label}: 없음`;
  return `- ${label}: ${pick.title} (${pick.format}, ${pick.score}/100) - ${pick.reason}`;
}

function formatTitleTiers(titleCandidates) {
  const candidates = titleCandidates || { general: [], viral: [], expert: [] };
  return [
    "#### General Hook",
    numberedList(candidates.general || candidates.clean),
    "",
    "#### Viral Hook",
    numberedList(candidates.viral),
    "",
    "#### Expert Note Hook",
    numberedList(candidates.expert || candidates.extreme)
  ].join("\n");
}

function jargonList(items) {
  if (!items || items.length === 0) return "- None";
  return items.map((item) => `- ${item.term}: ${item.plain}`).join("\n");
}

function formatImagePrompts(prompts) {
  if (!prompts || prompts.length === 0) return "None";
  return prompts.map((prompt) => `- ${prompt.type}: ${prompt.prompt}`).join("\n");
}

function formatCandidate(candidate, index) {
  const assetPlan = candidate.asset_plan || {};
  const reels = candidate.content_structure?.reels || {};
  const carousel = candidate.content_structure?.carousel || {};
  const cards = carousel.cards || [];
  const sourceLinks = candidate.source_url
    ? [`${candidate.source_name}: ${candidate.source_url}`]
    : ["출처 URL 없음 - HOLD 또는 추가 검증 필요"];

  return [
    `## Candidate ${String(index + 1).padStart(2, "0")}`,
    "",
    "### Production Decision",
    `- Recommended Format: ${candidate.recommended_format}`,
    `- Publish Recommendation: ${candidate.scores.publish_recommendation}`,
    `- Final Score: ${candidate.scores.final_score}/100`,
    `- Source Match: ${candidate.source_match_status} (${candidate.source_match_score}/10)`,
    `- Fact Check: ${candidate.fact_check_status}`,
    "",
    "### Recommended Title",
    candidate.recommended_title,
    "",
    "### Popularization Filter",
    `- Audience area: ${candidate.audience_area || "None"}`,
    `- Public subject: ${candidate.public_subject || "None"}`,
    `- Non-expert hook: ${candidate.non_expert_hook}`,
    `- Plain language summary: ${candidate.plain_language_summary}`,
    `- Why people should care: ${candidate.why_people_should_care}`,
    `- Everyday example: ${candidate.everyday_example}`,
    `- Scroll stop score: ${candidate.scroll_stop_score}/10`,
    `- Easy understanding score: ${candidate.easy_understanding_score}/10`,
    `- Jargon penalty: ${candidate.jargon_penalty}/10`,
    "",
    "#### Jargon Translation",
    jargonList(candidate.jargon_translation),
    "",
    "#### Expert Note",
    candidate.expert_note,
    "",
    "### Hook Title Candidates",
    formatTitleTiers(candidate.title_candidates),
    "",
    "### Source Summary",
    candidate.source_summary,
    "",
    "### Source Match Notes",
    bulletList(candidate.source_match_notes),
    "",
    "### Verified Facts",
    bulletList(candidate.verified_facts_ko || candidate.verified_facts),
    "",
    "### Uncertain Points",
    bulletList(candidate.uncertain_points_ko || candidate.uncertain_points),
    "",
    "### Why It Matters",
    candidate.why_it_matters_ko || candidate.why_it_matters,
    "",
    "### Scores",
    `- Hook: ${candidate.scores.hook_score}/10`,
    `- Usefulness: ${candidate.scores.usefulness_score}/10`,
    `- Visual: ${candidate.scores.visual_score}/10`,
    `- Korea relevance: ${candidate.scores.korea_relevance_score}/10`,
    `- Carousel fit: ${candidate.scores.carousel_fit_score}/10`,
    `- Reels fit: ${candidate.scores.reels_fit_score}/10`,
    `- Scroll stop: ${candidate.scores.scroll_stop_score}/10`,
    `- Easy understanding: ${candidate.scores.easy_understanding_score}/10`,
    `- Jargon penalty: ${candidate.scores.jargon_penalty}/10`,
    `- Risk: ${candidate.scores.risk_score}/10`,
    `- Final: ${candidate.scores.final_score}/100`,
    "",
    "### Risk Level",
    candidate.risk_level,
    "",
    "### Source Links",
    bulletList(sourceLinks),
    "",
    "### Asset Plan",
    "",
    "#### For Reels",
    `- Related video links: ${formatAssetList(assetPlan.related_video_links)}`,
    `- Official video 여부: ${assetPlan.official_video || "Unknown"}`,
    `- Usage judgement: ${assetPlan.usage_judgement || "Needs review"}`,
    `- Recommended scene: ${cleanReportValue(assetPlan.recommended_scene)}`,
    `- Alternative no-video production: ${cleanReportValue(assetPlan.alternative_no_video_production)}`,
    "",
    "#### For Carousel",
    `- Usable image candidates: ${formatAssetList(assetPlan.usable_image_candidates)}`,
    `- Reference-only images: ${formatAssetList(assetPlan.reference_only_images)}`,
    `- Screenshot candidates: ${formatAssetList(assetPlan.screenshot_candidates)}`,
    `- Required AI-generated images: ${formatAssetList(assetPlan.required_generated_images)}`,
    "",
    "### Content Structure",
    "",
    "#### If REELS",
    `- Duration: ${reels.duration || "None"}`,
    `- Scene 1: ${reels.scenes?.[0] || "None"}`,
    `- Scene 2: ${reels.scenes?.[1] || "None"}`,
    `- Scene 3: ${reels.scenes?.[2] || "None"}`,
    `- CTA: ${reels.cta || "None"}`,
    "",
    "#### If CAROUSEL",
    `- Recommended card count: ${carousel.recommended_card_count || 0}`,
    ...cards.map((card) => `- Card ${card.number} ${card.role === "thumbnail" ? "Thumbnail" : card.role === "cta" ? "CTA" : ""}: ${card.title} / ${card.body}${card.emphasis ? ` / ${card.emphasis}` : ""}`),
    `- Last Card CTA: ${carousel.last_card_cta || "None"}`,
    "",
    "### Detailed Caption Draft",
    candidate.caption_draft,
    "",
    "### Hashtags",
    (candidate.hashtags || []).join(" "),
    "",
    "### Image Generation Prompts",
    formatImagePrompts(candidate.image_prompts),
    ""
  ].join("\n");
}

function summaryFromCandidates(candidates, fallback = {}) {
  const picks = topPicks(candidates);
  return {
    top_picks: picks,
    total_collected: fallback.total_collected ?? candidates.length,
    total_normalized: fallback.total_normalized ?? candidates.length,
    total_clusters: fallback.total_clusters ?? new Set(candidates.map((candidate) => candidate.cluster_id)).size,
    final_candidates: candidates.length,
    recommended_reels: candidates.filter((candidate) => ["REELS", "REELS_FIRST"].includes(candidate.recommended_format)).length,
    recommended_reels_first: candidates.filter((candidate) => candidate.recommended_format === "REELS_FIRST").length,
    recommended_carousel: candidates.filter((candidate) => candidate.recommended_format === "CAROUSEL").length,
    recommended_both: candidates.filter((candidate) => candidate.recommended_format === "BOTH").length,
    hold: candidates.filter((candidate) => candidate.recommended_format === "HOLD").length
  };
}

function renderMarkdown(date, candidates, stats) {
  const summary = summaryFromCandidates(candidates, stats);
  return [
    `# ${date} AI Trend Radar Daily Candidates`,
    "",
    "## Today Production Picks",
    formatTopPick("오늘 제작 추천 1순위 릴스", summary.top_picks.top_reels),
    formatTopPick("오늘 제작 추천 1순위 카드뉴스", summary.top_picks.top_carousel),
    `- 보류 후보: ${summary.top_picks.hold_candidates.length ? summary.top_picks.hold_candidates.join(", ") : "없음"}`,
    "",
    "## Summary",
    `- Total collected: ${summary.total_collected}`,
    `- Total normalized: ${summary.total_normalized}`,
    `- Total clusters: ${summary.total_clusters}`,
    `- Final candidates: ${summary.final_candidates}`,
    `- Recommended reels: ${summary.recommended_reels}`,
    `- Recommended reels first: ${summary.recommended_reels_first}`,
    `- Recommended carousel: ${summary.recommended_carousel}`,
    `- Recommended both: ${summary.recommended_both}`,
    `- Hold: ${summary.hold}`,
    "",
    "---",
    "",
    ...candidates.map(formatCandidate)
  ].join("\n");
}

function writeDailyReport({ date, candidates, stats, rootDir }) {
  const outputDir = path.join(rootDir, "outputs", "daily");
  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, `${date}-candidates.json`);
  const markdownPath = path.join(outputDir, `${date}-candidates.md`);
  const payload = {
    date,
    summary: summaryFromCandidates(candidates, stats),
    candidates
  };

  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownPath, `${renderMarkdown(date, candidates, stats)}\n`, "utf8");

  return { jsonPath, markdownPath, payload };
}

function loadScoredCandidates(rootDir, date) {
  const scoredPath = path.join(rootDir, "data", "scored", `${date}-candidates.json`);
  if (!fs.existsSync(scoredPath)) {
    throw new Error(`No scored candidates found at ${scoredPath}. Run npm run daily first.`);
  }
  return JSON.parse(fs.readFileSync(scoredPath, "utf8"));
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date || todayString();
  const rootDir = path.resolve(__dirname, "..");
  const candidates = loadScoredCandidates(rootDir, date);
  const result = writeDailyReport({ date, candidates, rootDir });
  console.log(`Wrote ${path.relative(rootDir, result.markdownPath)}`);
  console.log(`Wrote ${path.relative(rootDir, result.jsonPath)}`);
}

module.exports = {
  renderMarkdown,
  writeDailyReport,
  summaryFromCandidates
};
