function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function compactDate(value) {
  return String(value || "").slice(0, 10);
}

function emptyMetrics() {
  return {
    comments: null,
    likes: null,
    upvotes: null,
    views: null,
    stars: null
  };
}

function createNormalizedItem(raw, options = {}) {
  const date = options.date || compactDate(new Date().toISOString());
  const sourceSlug = slugify(raw.source_name || raw.source_type || "source");
  const titleSlug = slugify(raw.original_title || raw.raw_summary || "item").slice(0, 40);

  return {
    id: raw.id || `${date}-${sourceSlug}-${titleSlug}`,
    source_name: raw.source_name || "",
    source_type: raw.source_type || "",
    source_tier: raw.source_tier || "",
    source_url: raw.source_url || "",
    published_at: raw.published_at || "",
    collected_at: options.collectedAt || new Date().toISOString(),
    original_title: raw.original_title || "",
    original_author: raw.original_author || "",
    raw_summary: raw.raw_summary || "",
    raw_content_excerpt: raw.raw_content_excerpt || "",
    language: raw.language || "",
    media_urls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    video_urls: Array.isArray(raw.video_urls) ? raw.video_urls : [],
    image_urls: Array.isArray(raw.image_urls) ? raw.image_urls : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    metrics: { ...emptyMetrics(), ...(raw.metrics || {}) },
    editorial_seed: {
      cluster_hint: raw.cluster_hint || "",
      verified_facts: raw.verified_facts || [],
      uncertain_points: raw.uncertain_points || [],
      interpretation: raw.interpretation || "",
      why_it_matters: raw.why_it_matters || "",
      content_angle: raw.content_angle || "",
      sample_signals: raw.sample_signals || {},
      asset_plan: raw.asset_plan || {},
      content_seed: raw.content_seed || {}
    }
  };
}

function normalizeItems(rawItems, options = {}) {
  return rawItems.map((item) => createNormalizedItem(item, options));
}

module.exports = {
  createNormalizedItem,
  normalizeItems,
  slugify
};
