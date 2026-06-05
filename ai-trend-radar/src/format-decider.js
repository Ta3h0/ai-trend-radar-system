function decideFormat(item, risk, scores) {
  const signals = item.editorial_seed?.sample_signals || {};

  if (risk.risk_level === "HIGH" || scores.publish_recommendation === "HOLD") {
    return "HOLD";
  }

  const visualImpact = signals.visual_impact || scores.visual_score || 0;
  const explainComplexity = signals.explain_complexity || scores.carousel_fit_score || 0;
  const demoAvailable = Boolean(signals.demo_available || item.video_urls.length > 0);
  const hookStrength = signals.hook_strength || scores.hook_score || 0;
  const saveValue = signals.save_value || scores.usefulness_score || 0;
  const sourceDepth = signals.source_depth || 0;
  const seededFormat = signals.recommended_format;

  if (seededFormat === "BOTH" && visualImpact >= 8 && scores.reels_fit_score >= 8) return "REELS_FIRST";
  if (seededFormat) return seededFormat;

  if (visualImpact >= 8 && scores.reels_fit_score >= 8 && explainComplexity >= 7) return "REELS_FIRST";
  if (visualImpact >= 8 && explainComplexity >= 7) return "BOTH";
  if (visualImpact >= 8 && demoAvailable && explainComplexity <= 5 && hookStrength >= 8) return "REELS";
  if (explainComplexity >= 7 && saveValue >= 7 && sourceDepth >= 7 && visualImpact <= 7) return "CAROUSEL";

  return "HOLD";
}

module.exports = {
  decideFormat
};
