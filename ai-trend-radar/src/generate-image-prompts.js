function guardrails(ratio) {
  return [
    "no text inside the image",
    "no logos",
    "no real person likeness",
    "no brand marks",
    "leave clean negative space for Korean headline overlay",
    `${ratio} composition`,
    "premium editorial tech magazine style"
  ].join(", ");
}

function sceneFromItem(item) {
  const seed = item.editorial_seed || {};
  const required = seed.asset_plan?.required_generated_images?.[0];
  if (required) return required;

  const subject = seed.content_seed?.title_subject || item.original_title || "AI trend";
  const tags = (item.tags || []).join(", ");
  return `${subject} represented through a concrete scene built from these signals: ${tags}`;
}

function promptForScene(scene, purpose, ratio) {
  return [
    `Create ${purpose}.`,
    `Scene: ${scene}.`,
    "Use one clear central object, not a collage.",
    "Make the subject understandable within one second.",
    "Use cinematic lighting, realistic materials, and a restrained dark high-tech environment.",
    guardrails(ratio)
  ].join(" ");
}

function cardScene(baseScene, card) {
  return `${baseScene}. Visualize the card idea "${card.title}" through a specific object or environment: ${card.body}`;
}

function generateImagePrompts(item, cardOutline, recommendedFormat) {
  const baseScene = sceneFromItem(item);
  const prompts = [];

  if (["REELS", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    prompts.push({
      type: "reels_thumbnail",
      prompt: promptForScene(baseScene, "a 9:16 reels thumbnail background with immediate visual impact", "9:16")
    });
  }

  if (["CAROUSEL", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    const thumbnailCard = (cardOutline.cards || []).find((card) => card.role === "thumbnail");
    const ctaCard = (cardOutline.cards || []).find((card) => card.role === "cta");

    prompts.push({
      type: "thumbnail",
      prompt: promptForScene(cardScene(baseScene, thumbnailCard || { title: "main hook", body: "show the core AI change" }), "a 4:5 carousel thumbnail background", "4:5")
    });

    prompts.push({
      type: "body_card",
      prompt: promptForScene(baseScene, "a 4:5 explanatory body-card background with room for Korean copy blocks", "4:5")
    });

    prompts.push({
      type: "cta_background",
      prompt: promptForScene(cardScene(baseScene, ctaCard || { title: "CTA", body: "invite saving and following" }), "a calm 4:5 closing CTA background", "4:5")
    });

    for (const card of cardOutline.cards || []) {
      prompts.push({
        type: `card_${card.number}`,
        prompt: promptForScene(cardScene(baseScene, card), `a 4:5 visual background for carousel card ${card.number}`, "4:5")
      });
    }
  }

  return prompts;
}

module.exports = {
  generateImagePrompts
};
