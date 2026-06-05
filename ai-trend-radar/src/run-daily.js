const fs = require("fs");
const path = require("path");

const { normalizeItems } = require("./normalize");
const { clusterItems } = require("./cluster");
const { classifyRisk } = require("./risk-check");
const { scoreItem } = require("./score");
const { decideFormat } = require("./format-decider");
const { generateTitleCandidates } = require("./generate-hooks");
const { generateCardOutline } = require("./generate-card-outline");
const { generateCaption } = require("./generate-caption");
const { generateImagePrompts } = require("./generate-image-prompts");
const { validateSourceMatch, factCheckStatus } = require("./quality-check");
const { writeDailyReport } = require("./build-daily-report");

function parseArgs(argv) {
  const args = {
    dryRun: argv.includes("--dry-run"),
    collectOnly: argv.includes("--collect-only")
  };

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--date") args.date = argv[index + 1];
    if (argv[index] === "--input") args.input = argv[index + 1];
  }

  return args;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clusterByItemId(clusters) {
  const map = new Map();
  for (const cluster of clusters) {
    for (const itemId of cluster.item_ids) {
      map.set(itemId, cluster);
    }
  }
  return map;
}

function buildReelsStructure(item, format) {
  if (!["REELS", "BOTH", "REELS_FIRST"].includes(format)) {
    return {
      duration: "",
      scenes: [],
      cta: ""
    };
  }

  const scenes = item.editorial_seed?.content_seed?.reels_scenes || [
    "0~2초: 가장 강한 장면을 먼저 보여준다.",
    "2~6초: 출처와 핵심 변화를 짧게 설명한다.",
    "6~10초: 돈, 일, 콘텐츠 제작 흐름과 연결한다."
  ];

  return {
    duration: "5~12 seconds",
    scenes,
    cta: format === "REELS_FIRST"
      ? "더 자세한 구조는 카드뉴스로 이어서 확인하세요."
      : "저장하고 다음 AI 변화도 확인하세요."
  };
}

function generateKoreanSourceSummary(item) {
  const seed = item.editorial_seed || {};
  const subject = seed.content_seed?.title_subject || item.original_title || "AI 변화";
  const cardSeeds = seed.content_seed?.carousel_cards || [];
  const firstCard = cardSeeds[0]?.body || seed.content_angle || "AI 변화가 일과 콘텐츠 제작 방식에 주는 영향을 다룹니다.";
  const secondCard = cardSeeds[1]?.body || seed.why_it_matters || "업무 자동화, 비용, 제작 속도, 신뢰도 관점에서 확인할 만한 소재입니다.";

  return `${item.source_name}의 ${item.published_at || "날짜 미상"} 자료는 ${subject} 관련 변화입니다. 핵심은 ${firstCard} ${secondCard} 발행 전에는 원문 링크, 출시 범위, 사용권, 과장 가능성을 함께 확인해야 합니다.`;
}

function buildCandidate(item, cluster, index = 0) {
  const sourceMatch = validateSourceMatch(item);
  const factStatus = factCheckStatus(item, sourceMatch);
  let risk = classifyRisk(item);

  if (sourceMatch.source_match_status === "MISMATCH") {
    risk = {
      risk_level: "HIGH",
      risk_notes: [...risk.risk_notes, ...sourceMatch.source_match_notes]
    };
  }

  const scores = scoreItem(item, risk);
  if (sourceMatch.source_match_status === "MISMATCH") {
    scores.publish_recommendation = "HOLD";
  }

  const recommendedFormat = sourceMatch.source_match_status === "MISMATCH"
    ? "HOLD"
    : decideFormat(item, risk, scores);
  const titleCandidates = generateTitleCandidates(item);
  const recommendedTitle = sourceMatch.source_match_status === "MISMATCH"
    ? "출처 링크가 맞지 않아 오늘은 보류합니다"
    : titleCandidates.recommended;
  const cardOutline = generateCardOutline(item, recommendedFormat, recommendedTitle);
  const imagePrompts = generateImagePrompts(item, cardOutline, recommendedFormat);
  const assetPlan = item.editorial_seed?.asset_plan || {};
  const hashtags = item.editorial_seed?.content_seed?.hashtags || ["#AI트렌드", "#AI뉴스"];
  const sourceSummaryKo = generateKoreanSourceSummary(item);

  const candidate = {
    id: item.id.replace(/raw|source/g, "candidate"),
    cluster_id: cluster.cluster_id,
    source_name: item.source_name,
    source_type: item.source_type,
    source_tier: item.source_tier,
    source_url: item.source_url,
    published_at: item.published_at,
    original_title: item.original_title,
    verified_facts: item.editorial_seed?.verified_facts || [],
    uncertain_points: item.editorial_seed?.uncertain_points || [],
    interpretation: item.editorial_seed?.interpretation || "",
    why_it_matters: item.editorial_seed?.why_it_matters || "",
    content_angle: item.editorial_seed?.content_angle || "",
    korea_relevance: scores.korea_relevance_score,
    visual_potential: scores.visual_score,
    viral_potential: item.editorial_seed?.sample_signals?.viral_potential || scores.hook_score,
    save_value: scores.usefulness_score,
    source_credibility: item.editorial_seed?.sample_signals?.source_credibility || 0,
    risk_level: risk.risk_level,
    risk_notes: risk.risk_notes,
    source_match_status: sourceMatch.source_match_status,
    source_match_score: sourceMatch.source_match_score,
    source_match_notes: sourceMatch.source_match_notes,
    fact_check_status: factStatus,
    recommended_format: recommendedFormat,
    recommended_title: recommendedTitle,
    title_candidates: titleCandidates,
    hook_candidates: titleCandidates.all,
    caption_draft: "",
    image_prompts: imagePrompts,
    video_links: item.video_urls,
    scores,
    source_summary: sourceSummaryKo,
    raw_source_summary: item.raw_summary,
    asset_plan: {
      related_video_links: assetPlan.related_video_links || item.video_urls,
      official_video: assetPlan.official_video || "unknown",
      usage_judgement: assetPlan.usage_judgement || "Needs review before publication.",
      recommended_scene: assetPlan.recommended_scene || "",
      alternative_no_video_production: assetPlan.alternative_no_video_production || "",
      usable_image_candidates: assetPlan.usable_image_candidates || item.image_urls,
      reference_only_images: assetPlan.reference_only_images || [],
      screenshot_candidates: assetPlan.screenshot_candidates || [],
      required_generated_images: assetPlan.required_generated_images || []
    },
    content_structure: {
      reels: buildReelsStructure(item, recommendedFormat),
      carousel: cardOutline
    },
    hashtags
  };

  candidate.caption_draft = generateCaption(item, candidate, index);
  return candidate;
}

function runDaily(options = {}) {
  const rootDir = path.resolve(__dirname, "..");
  const date = options.date || todayString();
  const collectedAt = new Date().toISOString();
  const rawPath = options.input
    ? path.resolve(rootDir, options.input)
    : path.join(rootDir, "data", "raw", "sample-items.json");
  const rawItems = readJson(rawPath);

  const rawSnapshotName = options.input
    ? `${date}-${path.basename(rawPath, path.extname(rawPath)).replace(/^\d{4}-\d{2}-\d{2}-/, "")}-snapshot.json`
    : `${date}-sample-raw.json`;
  const rawSnapshotPath = path.join(rootDir, "data", "raw", rawSnapshotName);
  if (!options.dryRun) writeJson(rawSnapshotPath, rawItems);

  if (options.collectOnly) {
    return {
      mode: "collect-only",
      date,
      total_collected: rawItems.length,
      written: options.dryRun ? [] : [rawSnapshotPath]
    };
  }

  const normalized = normalizeItems(rawItems, { date, collectedAt });
  const clusters = clusterItems(normalized);
  const clusterMap = clusterByItemId(clusters);
  const candidates = normalized.map((item, index) => buildCandidate(item, clusterMap.get(item.id), index));

  const normalizedPath = path.join(rootDir, "data", "normalized", `${date}-normalized.json`);
  const clustersPath = path.join(rootDir, "data", "clusters", `${date}-clusters.json`);
  const scoredPath = path.join(rootDir, "data", "scored", `${date}-candidates.json`);

  if (!options.dryRun) {
    writeJson(normalizedPath, normalized);
    writeJson(clustersPath, clusters);
    writeJson(scoredPath, candidates);
    const report = writeDailyReport({
      date,
      candidates,
      rootDir,
      stats: {
        total_collected: rawItems.length,
        total_normalized: normalized.length,
        total_clusters: clusters.length
      }
    });

    return {
      mode: "daily",
      date,
      total_collected: rawItems.length,
      total_normalized: normalized.length,
      total_clusters: clusters.length,
      final_candidates: candidates.length,
      written: [rawSnapshotPath, normalizedPath, clustersPath, scoredPath, report.markdownPath, report.jsonPath]
    };
  }

  return {
    mode: "dry-run",
    date,
    total_collected: rawItems.length,
    total_normalized: normalized.length,
    total_clusters: clusters.length,
    final_candidates: candidates.length,
    written: []
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = runDaily({
    date: args.date,
    input: args.input,
    dryRun: args.dryRun,
    collectOnly: args.collectOnly
  });

  console.log(JSON.stringify({
    mode: result.mode,
    date: result.date,
    total_collected: result.total_collected,
    total_normalized: result.total_normalized,
    total_clusters: result.total_clusters,
    final_candidates: result.final_candidates,
    written: result.written.map((filePath) => path.relative(path.resolve(__dirname, ".."), filePath))
  }, null, 2));
}

module.exports = {
  runDaily
};
