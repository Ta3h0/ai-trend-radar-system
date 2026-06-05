const tierRank = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1
};

function clusterKey(item) {
  if (item.editorial_seed && item.editorial_seed.cluster_hint) {
    return item.editorial_seed.cluster_hint;
  }

  const primaryTag = item.tags && item.tags.length > 0 ? item.tags[0] : "general";
  return `${item.source_tier || "unknown"}-${primaryTag}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function pickPrimarySource(items) {
  return [...items].sort((a, b) => {
    const tierDiff = (tierRank[b.source_tier] || 0) - (tierRank[a.source_tier] || 0);
    if (tierDiff !== 0) return tierDiff;

    const aCred = a.editorial_seed?.sample_signals?.source_credibility || 0;
    const bCred = b.editorial_seed?.sample_signals?.source_credibility || 0;
    return bCred - aCred;
  })[0];
}

function createCluster(id, items) {
  const primary = pickPrimarySource(items);
  const keyFacts = items.flatMap((item) => item.editorial_seed?.verified_facts || []);
  const contentAngles = items
    .map((item) => item.editorial_seed?.content_angle)
    .filter(Boolean);
  const scores = items.map((item) => item.editorial_seed?.sample_signals?.source_credibility || 0);
  const clusterScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  return {
    cluster_id: id,
    cluster_title: primary.original_title,
    primary_source: primary.source_url || primary.source_name,
    supporting_sources: items
      .filter((item) => item.id !== primary.id)
      .map((item) => item.source_url || item.source_name),
    summary: primary.raw_summary,
    key_facts: [...new Set(keyFacts)],
    community_reaction: items.some((item) => ["A", "C", "D"].includes(item.source_tier))
      ? "Community or social signal exists. Treat reactions as signals, not facts."
      : "No community signal attached in this sample run.",
    content_angles: [...new Set(contentAngles)],
    cluster_score: Number(clusterScore.toFixed(1)),
    item_ids: items.map((item) => item.id)
  };
}

function clusterItems(items) {
  const groups = new Map();

  for (const item of items) {
    const key = clusterKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  return [...groups.entries()].map(([key, groupedItems]) => createCluster(`cluster-${key}`, groupedItems));
}

module.exports = {
  clusterItems
};
