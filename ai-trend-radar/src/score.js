function clamp(value, min = 0, max = 10) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function average(values) {
  const safeValues = values.map((value) => clamp(value));
  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
}

function riskScoreFromLevel(level, sourceCredibility) {
  if (level === "HIGH") return 9;
  if (level === "MEDIUM") return Math.max(4, 8 - sourceCredibility / 2);
  return Math.max(1, 5 - sourceCredibility / 3);
}

function recommendation(finalScore100, riskLevel) {
  if (riskLevel === "HIGH") return "HOLD";
  if (finalScore100 >= 78) return "A";
  if (finalScore100 >= 65) return "B";
  if (finalScore100 >= 52) return "C";
  return "HOLD";
}

function scoreItem(item, risk, popularization = {}) {
  const signals = item.editorial_seed?.sample_signals || {};
  const sourceCredibility = clamp(signals.source_credibility || 5);
  const riskScore = clamp(signals.risk_score || riskScoreFromLevel(risk.risk_level, sourceCredibility));

  const hookScore = clamp(signals.hook_strength || 5);
  const usefulnessScore = clamp(signals.save_value || signals.source_depth || 5);
  const visualScore = clamp(signals.visual_impact || (item.image_urls.length || item.video_urls.length ? 6 : 4));
  const koreaRelevanceScore = clamp(signals.korea_relevance || 5);
  const carouselFitScore = clamp(signals.explain_complexity || 5);
  const reelsFitScore = clamp(signals.demo_available ? visualScore : Math.max(3, visualScore - 2));

  const materialScore = average([
    hookScore,
    visualScore,
    koreaRelevanceScore,
    signals.viral_potential || hookScore,
    sourceCredibility
  ]);
  const contentScore = average([
    hookScore,
    usefulnessScore,
    visualScore,
    carouselFitScore,
    reelsFitScore
  ]);
  const baseScore = materialScore * 0.4 + contentScore * 0.4;
  const riskPenalty = riskScore * 0.08;
  const confidenceBoost = sourceCredibility * 0.12;
  const scrollBoost = (popularization.scroll_stop_score || 5) * 0.08;
  const easyBoost = (popularization.easy_understanding_score || 5) * 0.08;
  const jargonPenalty = (popularization.jargon_penalty || 0) * 0.05;
  const finalScore10 = clamp(baseScore - riskPenalty + confidenceBoost + scrollBoost + easyBoost - jargonPenalty);
  const finalScore100 = Math.round(finalScore10 * 10);

  return {
    hook_score: Number(hookScore.toFixed(1)),
    usefulness_score: Number(usefulnessScore.toFixed(1)),
    visual_score: Number(visualScore.toFixed(1)),
    korea_relevance_score: Number(koreaRelevanceScore.toFixed(1)),
    carousel_fit_score: Number(carouselFitScore.toFixed(1)),
    reels_fit_score: Number(reelsFitScore.toFixed(1)),
    risk_score: Number(riskScore.toFixed(1)),
    scroll_stop_score: popularization.scroll_stop_score || 0,
    easy_understanding_score: popularization.easy_understanding_score || 0,
    jargon_penalty: popularization.jargon_penalty || 0,
    final_score: finalScore100,
    final_score_scale: "100",
    final_score_raw_10: Number(finalScore10.toFixed(1)),
    publish_recommendation: recommendation(finalScore100, risk.risk_level),
    material_score: Number(materialScore.toFixed(1)),
    content_score: Number(contentScore.toFixed(1))
  };
}

module.exports = {
  scoreItem
};
