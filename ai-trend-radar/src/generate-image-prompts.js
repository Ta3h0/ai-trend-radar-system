function guardrails(ratio) {
  return [
    "no readable text inside the image",
    "no logos",
    "no real person likeness",
    "no brand marks",
    "clean negative space for Korean headline overlay",
    `${ratio} composition`
  ].join(", ");
}

const briefs = {
  local_personal_ai: {
    palette: "deep graphite desk, warm screen glow, soft blue privacy light",
    base: "a closed laptop on a tidy desk, private documents, a small audio waveform, and a photo thumbnail glowing inside the screen while a distant cloud icon fades outside the window",
    object: "laptop, locked folder, local desk lamp"
  },
  creator_studio: {
    palette: "cinematic black stage, amber key light, magenta edge light",
    base: "a miniature film set on a tabletop where a camera, stage lights, and three floating scene previews are being tested before a real shoot",
    object: "director viewfinder, tiny stage, preview frames"
  },
  editable_image: {
    palette: "clean studio white, translucent glass layers, focused green accent",
    base: "a product poster separated into transparent layers, with the background, object, shadow, and color plate floating apart like editable sheets",
    object: "layered poster, product cutout, editing glove"
  },
  agent_management: {
    palette: "quiet enterprise gray, signal blue, warning amber",
    base: "a command desk where several small AI task cards move through permission gates, audit trails, and approval stamps without showing any text",
    object: "control dashboard, permission keys, audit timeline"
  },
  coding_supervisor: {
    palette: "dark workstation, cyan code glow, calm white highlights",
    base: "a developer desk seen from above, with multiple abstract code windows flowing into a single review checklist controlled by one hand",
    object: "review checklist, code panels, merge switch"
  },
  research_assistant: {
    palette: "laboratory silver, clean white light, electric blue data glow",
    base: "a research bench with sample trays, microscope glass, and a glowing suggestion path connecting possible next experiments",
    object: "sample tray, microscope, experiment path"
  },
  defensive_ai: {
    palette: "matte black security room, cool cyan scan lines, red risk pin",
    base: "a code repository visualized as a building blueprint while a scanning shield finds one small vulnerable doorway",
    object: "shield scanner, blueprint, risk marker"
  },
  world_prediction: {
    palette: "midnight robotics lab, violet simulation light, steel reflections",
    base: "a robot training scene where a moving ball, a city block, and a video frame connect into one predicted motion path",
    object: "motion path, robot camera, simulation grid"
  },
  full_stack_ai: {
    palette: "strategic operations room, charcoal table, teal connection lines",
    base: "an operations map connecting a chat window, inbox tray, factory icon, and data center block into one business workflow chain",
    object: "workflow map, inbox tray, data center block"
  },
  general: {
    palette: "modern editorial desk, neutral shadows, one bright AI signal",
    base: "a simple work desk where one everyday object is connected to a subtle AI signal, showing a practical change rather than abstract technology",
    object: "desk object, signal line, saved note"
  }
};

const cardDirections = {
  1: "make it poster-like with one unmistakable central object and strong empty space for a large hook",
  2: "show the simple explanation visually, as if a complex box is opened to reveal one clear everyday object",
  3: "connect the scene to time, money, work, or content output using objects like a calendar, receipt, clock, or creator dashboard without readable text",
  4: "show the concrete everyday use case in progress, with a hand, desk tool, camera, laptop, or lab object doing one clear action",
  5: "show an official-source moment using an abstract document page, date marker, and verification pin without readable text or logos",
  6: "show caution through a measuring ruler, checklist, small warning marker, or comparison scale, not fear imagery",
  7: "show a clean one-line-conclusion feeling: one path from input to useful outcome, minimal and decisive",
  8: "show a save-and-follow closing mood using a phone, bookmark shape, and calm desk lighting without social media logos"
};

function briefFor(popularization = {}) {
  return briefs[popularization.everyday_subtype] || briefs.general;
}

function promptForScene({ purpose, ratio, brief, direction, card }) {
  const cardLine = card
    ? `Card role: "${card.title}" / "${card.body}".`
    : "Single-purpose visual with no collage.";

  return [
    `Create ${purpose}.`,
    `Scene: ${brief.base}.`,
    `Specific visual direction: ${direction}.`,
    `Key objects: ${brief.object}.`,
    `Color and lighting: ${brief.palette}.`,
    cardLine,
    "Use realistic materials and editorial composition; avoid generic floating AI brains or abstract glowing orbs.",
    guardrails(ratio)
  ].join(" ");
}

function generateImagePrompts(item, cardOutline, recommendedFormat, popularization = {}) {
  const brief = briefFor(popularization);
  const prompts = [];

  if (["REELS", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    prompts.push({
      type: "reels_thumbnail",
      prompt: promptForScene({
        purpose: "a 9:16 reels thumbnail background with immediate visual impact",
        ratio: "9:16",
        brief,
        direction: "frame the main object close-up with motion or before-after tension, readable in under one second"
      })
    });
  }

  if (["CAROUSEL", "BOTH", "REELS_FIRST"].includes(recommendedFormat)) {
    const thumbnailCard = (cardOutline.cards || []).find((card) => card.role === "thumbnail");
    const ctaCard = (cardOutline.cards || []).find((card) => card.role === "cta");

    prompts.push({
      type: "thumbnail",
      prompt: promptForScene({
        purpose: "a 4:5 carousel thumbnail background",
        ratio: "4:5",
        brief,
        direction: cardDirections[1],
        card: thumbnailCard
      })
    });

    prompts.push({
      type: "body_card",
      prompt: promptForScene({
        purpose: "a 4:5 reusable explanatory body-card background",
        ratio: "4:5",
        brief,
        direction: "keep the center calm and place the main object lower right so Korean copy can sit clearly on the left"
      })
    });

    prompts.push({
      type: "cta_background",
      prompt: promptForScene({
        purpose: "a calm 4:5 closing CTA background",
        ratio: "4:5",
        brief,
        direction: cardDirections[8],
        card: ctaCard
      })
    });

    for (const card of cardOutline.cards || []) {
      prompts.push({
        type: `card_${card.number}`,
        prompt: promptForScene({
          purpose: `a 4:5 visual background for carousel card ${card.number}`,
          ratio: "4:5",
          brief,
          direction: cardDirections[card.number] || "make one concrete scene that supports the card copy",
          card
        })
      });
    }
  }

  return prompts;
}

module.exports = {
  generateImagePrompts
};
