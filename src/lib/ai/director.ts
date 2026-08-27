export interface DirectorRefinementOptions {
  prompt: string;
  mediaType?: "image" | "video";
  durationSeconds?: number;
  resolution?: string;
  adjustment?: string;
  bypassDirector?: boolean;
  characterSpec?: string;
  characterName?: string;
  projectWorldContext?: string;
  sequelContext?: string;
  referenceImageUrl?: string;
  manualOverrides?: {
    lens?: string;
    lighting?: string;
    colorPalette?: string;
    cameraMovement?: string;
  };
}

export interface CreditSavingGuidance {
  category: "action_scene" | "dialogue_heavy" | "continuous_motion" | "long_duration";
  title: string;
  message: string;
  suggestion: string;
}

export interface DirectorResult {
  refinedPrompt: string;
  lens: string;
  lighting: string;
  colorPalette: string;
  cameraMovement?: string;
  shotType?: string;
  reasoning: string;
  anthropicCostCredits: number;
  inputTokens: number;
  outputTokens: number;
  adjustmentApplied?: string;
  guidance?: CreditSavingGuidance;
}

/**
 * Scan prompt for known AI video generation risk patterns per Section 10 of Manifesto.
 */
export function checkCreditSavingGuidance(
  prompt: string,
  mediaType: "image" | "video" = "image",
  durationSeconds = 5
): CreditSavingGuidance | undefined {
  if (mediaType !== "video") return undefined;

  const lower = prompt.toLowerCase();

  // 1. Action / Fight Scene Pattern
  const actionKeywords = ["fight", "battle", "martial arts", "kung fu", "boxing", "sword", "combat", "stunt", "wrestling", "punching"];
  if (actionKeywords.some((kw) => lower.includes(kw))) {
    return {
      category: "action_scene",
      title: "Director Advice: Fast Action Scene",
      message: "Continuous fast-paced martial arts and fight scenes often experience physics artifacts.",
      suggestion: "Splitting action scenes into shorter 3–5 second camera beats produces much cleaner choreography and saves credits on re-renders.",
    };
  }

  // 2. Dialogue / Speaking Character Pattern
  const dialogueKeywords = ["talking", "speaking", "dialogue", "conversation", "shouting", "singing", "saying", "whispering", "interview"];
  if (dialogueKeywords.some((kw) => lower.includes(kw))) {
    return {
      category: "dialogue_heavy",
      title: "Director Advice: Spoken Dialogue",
      message: "Text-to-video models generate visuals rather than synchronized speech.",
      suggestion: "For the cleanest result, generate the expressive cinematic shot first and add audio voiceover / lip-sync separately.",
    };
  }

  // 3. Full Body Walking / Running Motion Pattern
  const motionKeywords = ["walking down the street", "running across", "marathon", "sprinting", "jogging", "walking continuously"];
  if (motionKeywords.some((kw) => lower.includes(kw))) {
    return {
      category: "continuous_motion",
      title: "Director Advice: Full-Body Motion",
      message: "Full-body continuous walking across wide angles can occasionally show subtle foot gliding.",
      suggestion: "Framing the shot from the waist up (Medium Close-Up) or using a tracking push-in delivers maximum photographic realism.",
    };
  }

  // 4. Long Duration Warning
  if (durationSeconds > 5) {
    return {
      category: "long_duration",
      title: "Director Advice: Extended Shot Length",
      message: `You are generating a ${durationSeconds}-second single take.`,
      suggestion: "Single shots longer than 5 seconds have higher credit costs. Generating 5-second master shots gives you more flexibility in editing.",
    };
  }

  return undefined;
}

/**
 * Claude 'Director' Prompt Refinement Service
 */
export async function refinePromptWithDirector(
  options: DirectorRefinementOptions
): Promise<DirectorResult> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  const rawPrompt = options.prompt.trim();
  const isVideo = options.mediaType === "video";

  // Check proactive credit saving guidance
  const guidance = checkCreditSavingGuidance(rawPrompt, options.mediaType, options.durationSeconds);

  // If user requested Raw Prompt mode, bypass Claude prompt expansion
  if (options.bypassDirector) {
    return {
      refinedPrompt: rawPrompt,
      lens: "Raw Unedited",
      lighting: "Natural Default",
      colorPalette: "Standard Color",
      cameraMovement: isVideo ? "Standard Locked-Off" : undefined,
      shotType: isVideo ? "Standard Shot" : undefined,
      reasoning: "Director prompt refinement bypassed — raw prompt passed directly to engine.",
      anthropicCostCredits: 0,
      inputTokens: 0,
      outputTokens: 0,
      guidance,
    };
  }

  // Directorial system prompt for Claude
  const systemPrompt = `You are the built-in AI Film Director for TryElusk.
Your job is to take a user's plain-language scene description and translate it into a master cinematic ${isVideo ? "video shot" : "frame"}.
Analyze the emotional mood, subject, and story intent, then output JSON with:
1. "lens": The specific camera lens and type (e.g. "35mm Anamorphic Prime", "85mm Portrait Telephoto", "24mm Ultra-Wide Cine").
2. "lighting": The lighting style and atmosphere (e.g. "Golden Hour soft side-lighting with rim flare", "Moody Chiaroscuro with volumetric shadows").
3. "color_palette": Curated color grading (e.g. "Warm Amber & Teal film stock", "Electric Cyan & Obsidian", "Kodak Portra 400").
${isVideo ? '4. "camera_movement": Smooth cinematic camera motion (e.g. "Slow Cinematic Push-in", "Dynamic Steadicam Tracking", "Smooth Orbit 360", "Low-angle Dolly In", "Static Locked-Off with ambient motion").\n5. "shot_type": (e.g. "Medium Close-up", "Wide Establishing Shot", "Over-the-Shoulder", "Low-Angle Hero Shot").' : ""}
${isVideo ? "6" : "4"}. "reasoning": 1 concise sentence explaining your directorial vision.
${isVideo ? "7" : "5"}. "refined_prompt": The complete, highly-detailed technical prompt combining subject, camera optics, ${isVideo ? "camera movement, " : ""}lighting, and color grading for cinematic rendering.

If an adjustment instruction is provided (e.g. "make it warmer", "make it more dramatic"), adapt your choices and prompt accordingly.
Return ONLY valid JSON.`;

  let userContent = `User Scene Description: "${rawPrompt}"`;
  if (options.characterSpec) {
    userContent += `\nLOCKED CHARACTER VISUAL DNA (${options.characterName || "Lead Actor"}): "${options.characterSpec}". In your refined prompt, preserve this character's exact facial structure, hair, clothing, age, and physical traits.`;
  }
  if (options.projectWorldContext) {
    userContent += `\nFILM WORLD & LOCATION CONTEXT: "${options.projectWorldContext}". Maintain this atmospheric lighting, environmental style, and scene continuity.`;
  }
  if (options.sequelContext) {
    userContent += `\nPREVIOUS SHOT ACTION (SEQUEL CONTINUITY): "${options.sequelContext}". Direct this new shot as the immediate, seamless narrative continuation of the previous take.`;
  }
  if (options.adjustment) {
    userContent += `\nDirector Look Adjustment Request: "${options.adjustment}"`;
  }
  if (isVideo) {
    userContent += `\nMedia Type: Cinematic Video (${options.durationSeconds || 5}s, ${options.resolution || "720p"})`;
  }

  // Attempt live call to Anthropic Claude API
  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const inTokens = data.usage?.input_tokens || 200;
          const outTokens = data.usage?.output_tokens || 140;
          const costDollars = (inTokens * 3 + outTokens * 15) / 1_000_000;
          const anthropicCredits = Math.max(0.1, Number((costDollars / 0.01).toFixed(2)));

          return applyManualOverrides(
            {
              refinedPrompt: parsed.refined_prompt || rawPrompt,
              lens: parsed.lens || "35mm Anamorphic Prime",
              lighting: parsed.lighting || "Cinematic Warm Key Light",
              colorPalette: parsed.color_palette || "Warm Amber & Obsidian",
              cameraMovement: parsed.camera_movement || (isVideo ? "Slow Cinematic Push-in" : undefined),
              shotType: parsed.shot_type || (isVideo ? "Medium Close-up" : undefined),
              reasoning: parsed.reasoning || "Directorial camera movement and lighting selected for cinematic immersion.",
              anthropicCostCredits: anthropicCredits,
              inputTokens: inTokens,
              outputTokens: outTokens,
              adjustmentApplied: options.adjustment,
              guidance,
            },
            options.manualOverrides,
            rawPrompt,
            isVideo
          );
        }
      }
    } catch (apiErr) {
      console.warn("Anthropic API fallback to directorial heuristic engine:", apiErr);
    }
  }

  // Built-in Directorial Intelligence Engine (Heuristic rule-set)
  return generateDirectorialHeuristic(rawPrompt, options, guidance);
}

/**
 * Directorial Rule-Engine for instant cinematic prompt structuring
 */
function generateDirectorialHeuristic(
  rawPrompt: string,
  options: DirectorRefinementOptions,
  guidance?: CreditSavingGuidance
): DirectorResult {
  const lower = rawPrompt.toLowerCase();
  const isVideo = options.mediaType === "video";

  let lens = "35mm Anamorphic Prime, shallow depth of field";
  let lighting = "Cinematic volumetric lighting with subtle atmospheric haze";
  let palette = "Teal and Warm Amber film grade, Kodak Portra 400 aesthetic";
  let cameraMovement = isVideo ? "Slow Cinematic Push-in with subtle handheld drift" : undefined;
  let shotType = isVideo ? "Medium Shot" : undefined;
  let reasoning = "Framed with a wide cinematic aperture to ground the scene with strong photographic depth.";

  if (lower.includes("portrait") || lower.includes("face") || lower.includes("close-up") || lower.includes("woman") || lower.includes("man")) {
    lens = "85mm f/1.4 Portrait Telephoto, creamy bokeh";
    lighting = "Soft wrap-around key light with gentle catchlights";
    palette = "Warm golden skin tones, rich subtle contrast";
    cameraMovement = isVideo ? "Slow gentle Push-in focusing on subject emotion" : undefined;
    shotType = isVideo ? "Close-up" : undefined;
    reasoning = "Selected an 85mm portrait telephoto to isolate the subject with natural perspective compression.";
  } else if (lower.includes("cyberpunk") || lower.includes("city") || lower.includes("neon") || lower.includes("rain")) {
    lens = "28mm Wide Anamorphic with horizontal lens flare";
    lighting = "High-contrast neon reflections on wet asphalt with atmospheric mist";
    palette = "Electric Cyan, Deep Violet, and Obsidian blacks";
    cameraMovement = isVideo ? "Smooth Steadicam Tracking forward through the street" : undefined;
    shotType = isVideo ? "Wide Establishing" : undefined;
    reasoning = "Utilized a 28mm wide anamorphic lens to capture expansive urban scale and vibrant neon reflections.";
  } else if (lower.includes("space") || lower.includes("astronaut") || lower.includes("stars") || lower.includes("nebula")) {
    lens = "24mm Ultra-Sharp Cine Prime";
    lighting = "Distant celestial glow with deep cosmic shadows and rim reflection";
    palette = "Gold, Deep Space Obsidian, and Cosmic Violet";
    cameraMovement = isVideo ? "Slow 360-degree Orbit capturing cosmic grandeur" : undefined;
    shotType = isVideo ? "Low-angle Hero Shot" : undefined;
    reasoning = "Chosen an ultra-sharp wide cine lens to convey cosmic grandeur against the vastness of space.";
  } else if (lower.includes("action") || lower.includes("fight") || lower.includes("chase") || lower.includes("car")) {
    lens = "35mm High-Speed Cine Lens";
    lighting = "Dynamic high-contrast edge lighting with motion blur";
    palette = "High-Contrast Charcoal, Ember Orange, and Deep Navy";
    cameraMovement = isVideo ? "Dynamic Handheld Action Tracking" : undefined;
    shotType = isVideo ? "Dynamic Medium Action" : undefined;
    reasoning = "Configured dynamic tracking camera to capture immediate kinetic momentum.";
  }

  // Apply look adjustment if requested
  if (options.adjustment) {
    const adjLower = options.adjustment.toLowerCase();
    if (adjLower.includes("warmer")) {
      lighting += ", enhanced with warm golden sunrise temperature";
      palette = "Warm Amber, Terracotta, and Sunset Gold";
    } else if (adjLower.includes("dramatic")) {
      lighting = "Severe Chiaroscuro high-contrast lighting with deep, hard shadows";
      palette = "High-contrast Charcoal, Stark White, and Muted Crimson";
    } else if (adjLower.includes("bright") || adjLower.includes("daylight")) {
      lighting = "Bright luminous soft-diffused natural daylight with high-key exposure";
      palette = "Clean neutral daylight, fresh vibrant tones";
    } else if (adjLower.includes("dark") || adjLower.includes("moody")) {
      lighting = "Underexposed low-key moody lighting with mysterious deep shadows";
      palette = "Midnight Navy, Graphite, and Deep Shadow tones";
    } else if (adjLower.includes("grain") || adjLower.includes("35mm") || adjLower.includes("vintage")) {
      lens += ", authentic 35mm film halation";
      palette += ", vintage 1970s chemical film grain";
    }
  }

  const baseResult: DirectorResult = {
    refinedPrompt: isVideo
      ? `Cinematic master film video clip of ${rawPrompt}, shot on ${lens}, ${cameraMovement}, ${lighting}, color graded in ${palette}, 8k cinema resolution, photorealistic motion render`
      : `Cinematic master film shot of ${rawPrompt}, shot on ${lens}, ${lighting}, color graded in ${palette}, 8k resolution, authentic film still aesthetic`,
    lens,
    lighting,
    colorPalette: palette,
    cameraMovement,
    shotType,
    reasoning,
    anthropicCostCredits: 0.2,
    inputTokens: 190,
    outputTokens: 130,
    adjustmentApplied: options.adjustment,
    guidance,
  };

  return applyManualOverrides(baseResult, options.manualOverrides, rawPrompt, isVideo);
}

/**
 * Apply manual field overrides from Advanced toggle
 */
function applyManualOverrides(
  result: DirectorResult,
  manualOverrides: DirectorRefinementOptions["manualOverrides"] | undefined,
  rawPrompt: string,
  isVideo: boolean
): DirectorResult {
  if (!manualOverrides) return result;

  const finalLens = manualOverrides.lens?.trim() || result.lens;
  const finalLighting = manualOverrides.lighting?.trim() || result.lighting;
  const finalPalette = manualOverrides.colorPalette?.trim() || result.colorPalette;
  const finalMovement = manualOverrides.cameraMovement?.trim() || result.cameraMovement;

  const hasOverrides =
    finalLens !== result.lens ||
    finalLighting !== result.lighting ||
    finalPalette !== result.colorPalette ||
    finalMovement !== result.cameraMovement;

  if (hasOverrides) {
    const movementPart = finalMovement ? `, ${finalMovement}` : "";
    return {
      ...result,
      lens: finalLens,
      lighting: finalLighting,
      colorPalette: finalPalette,
      cameraMovement: finalMovement,
      refinedPrompt: isVideo
        ? `Cinematic master film video clip of ${rawPrompt}, shot on ${finalLens}${movementPart}, ${finalLighting}, color graded in ${finalPalette}, 8k cinema resolution, photorealistic motion render`
        : `Cinematic master film shot of ${rawPrompt}, shot on ${finalLens}, ${finalLighting}, color graded in ${finalPalette}, 8k resolution, photorealistic cinema render`,
      reasoning: "Custom technical camera and optics overrides applied by creator.",
    };
  }

  return result;
}

export interface CharacterDirectorResult {
  visualSpec: string;
  turnaroundPrompt: string;
  suggestedModel: string;
  reasoning: string;
  anthropicCostCredits: number;
}

/**
 * Claude Director: Refine character description into a locked 3-panel visual spec.
 */
export async function refineCharacterWithDirector(
  name: string,
  description: string
): Promise<CharacterDirectorResult> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  const cleanName = name.trim() || "Character";
  const cleanDesc = description.trim();

  const systemPrompt = `You are the built-in AI Film Director for TryElusk.
Your mission is to translate a user's plain-language character description into a consistent single-face anchor character turnaround reference sheet.
To prevent face-hallucination and ensure 100% facial and hairstyle locking in AI generation, the reference sheet layout is:
- Panel 1 (Hero Face Anchor): Single detailed front/three-quarters close-up headshot portrait showing the face, eyes, bone structure, skin texture, and frontal hair. (This is the ONLY visible face on the entire sheet).
- Panel 2 (Full Body Front View): Complete front-facing full-body view of the character's outfit from the neck down (headless/mannequin style) displaying jacket, shirt, pants, footwear, and physique.
- Panel 3 (Full Body Back View): Complete rear back full-body view WITH head attached from behind, displaying the hairstyle from the back, rear neckline, coat back, tailoring, and accessories.
- Panel 4 (3/4 Angle Body View): Three-quarters angle body silhouette from the neck down (headless) displaying side profile and costume layers.

Output JSON with:
1. "visual_spec": A structured 2-3 sentence character design spec describing physique, facial features, hair, costume, and color palette.
2. "turnaround_prompt": The master technical generation prompt for the 4-panel single-face anchor sheet on a clean studio neutral-grey backdrop.
3. "reasoning": 1 sentence explaining the consistency decisions made.`;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 600,
          temperature: 0.2,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Character Name: "${cleanName}"\nDescription: "${cleanDesc}"`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.content?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            visualSpec: parsed.visual_spec || cleanDesc,
            turnaroundPrompt:
              parsed.turnaround_prompt ||
              `Master 4-panel character design sheet for ${cleanName}: [Panel 1] Detailed front close-up headshot portrait showing the face, eyes, and hair; [Panel 2] Full front body outfit view from neck down (headless); [Panel 3] Full back body view showing hair and head from behind with full rear outfit; [Panel 4] 3/4 angle body profile from neck down (headless). ${cleanDesc}, clean neutral grey studio backdrop, flat even lighting, photorealistic 8k concept reference sheet`,
            suggestedModel: "nano-banana",
            reasoning: parsed.reasoning || "Directorial single-face turnaround sheet engineered for persistent character and hairstyle locking.",
            anthropicCostCredits: 0.2,
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // Robust Directorial Fallback
  const visualSpec = `${cleanName}: ${cleanDesc}. Structured for consistent cinematic continuity across scenes.`;
  const turnaroundPrompt = `Master 4-panel character design reference sheet for ${cleanName}: [Panel 1] Detailed close-up headshot portrait showing the character face, eyes, skin texture, and hair style (single face anchor); [Panel 2] Full front body view of costume from neck down (headless); [Panel 3] Full back body view with head and hair from behind, showing rear costume and hairstyle; [Panel 4] 3/4 angle body silhouette from neck down (headless). ${cleanDesc}. Clean neutral grey studio backdrop, flat even studio rim lighting, photorealistic 8k master character sheet.`;

  return {
    visualSpec,
    turnaroundPrompt,
    suggestedModel: "nano-banana",
    reasoning: "Director refined character into single-face anchor sheet (Close-up face + Headless front/profile body + Full back view with rear hairstyle).",
    anthropicCostCredits: 0.2,
  };
}

// -------------------------------------------------------------------------
// Vibe Director (Conversational Agent Mode — Manifesto Section 9)
// -------------------------------------------------------------------------

export type VibeStepType = "character" | "location" | "prop" | "image" | "video" | "audio" | "lipsync";

export interface VibeProductionStep {
  stepId: string;
  type: VibeStepType;
  title: string;
  description: string;
  estimatedCredits: number;
  params: {
    prompt?: string;
    modelName?: string;
    durationSeconds?: number;
    aspectRatio?: string;
    voiceId?: string;
    name?: string;
    description?: string;
    atmosphere?: string;
    material?: string;
    videoUrl?: string;
    audioUrl?: string;
  };
}

export interface VibeSceneGroup {
  sceneNumber: number;
  heading: string;
  description: string;
  estimatedCredits: number;
  steps: VibeProductionStep[];
}

export interface VibeDirectorPlan {
  title: string;
  summary: string;
  mode?: "manual" | "agent";
  totalEstimatedCredits: number;
  steps: VibeProductionStep[];
  scenes?: VibeSceneGroup[];
  reasoning: string;
  anthropicCostCredits: number;
}

export interface VibeDirectorOptions {
  goal: string;
  mode?: "manual" | "agent";
  inputType?: "brief" | "script";
  scriptText?: string;
  manualSettings?: {
    videoModel?: string;
    imageModel?: string;
    aspectRatio?: string;
    resolution?: string;
    durationSeconds?: number;
    opticsStyle?: string;
  };
  existingElements?: {
    characters?: { name: string; id: string }[];
    locations?: { name: string; id: string }[];
    props?: { name: string; id: string }[];
  } | { name: string; id: string }[];
}

/**
 * Claude Orchestrator: Decomposes a conversational filmmaking outcome or screenplay into sequential production steps
 */
export async function planVibeDirectorSequence(
  optionsOrGoal: string | VibeDirectorOptions,
  legacyElements: {
    characters?: { name: string; id: string }[];
    locations?: { name: string; id: string }[];
    props?: { name: string; id: string }[];
  } | { name: string; id: string }[] = []
): Promise<VibeDirectorPlan> {
  const options: VibeDirectorOptions =
    typeof optionsOrGoal === "string"
      ? {
          goal: optionsOrGoal,
          mode: "agent",
          inputType: "brief",
          existingElements: legacyElements,
        }
      : optionsOrGoal;

  const cleanGoal = (options.goal || options.scriptText || "").trim();
  const mode = options.mode || "agent";
  const inputType = options.inputType || "brief";
  const manual = options.manualSettings || {};
  const existing = options.existingElements || [];
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();

  const isManual = mode === "manual";
  const isScript = inputType === "script" || Boolean(options.scriptText);

  const systemPrompt = `You are the lead AI Filmmaking Director & Executive Producer for TryElusk.
Your role is 'Vibe Director'. You translate user story briefs or full screenplays into an executive production breakdown.

Operating Mode: ${isManual ? "MANUAL DIRECTING RIG (Strictly adhere to creator's manual camera/model selections)" : "AUTONOMOUS AGENT MODE (Intelligently select the best AI models and camera moves per shot)"}
Input Format: ${isScript ? "SCREENPLAY SCRIPT (Break down by Scene Headings: INT./EXT.)" : "STORY BRIEF (Break down into sequential narrative takes)"}

${
  isManual
    ? `LOCKED CREATOR SPECIFICATIONS (Must use these exact params on relevant steps):
- Preferred Video Model: ${manual.videoModel || "kling-2.5-turbo"}
- Preferred Image/Still Model: ${manual.imageModel || "nano-banana"}
- Aspect Ratio: ${manual.aspectRatio || "16:9"}
- Resolution: ${manual.resolution || "1080p"}
- Take Duration: ${manual.durationSeconds || 5}s
${manual.opticsStyle ? `- Lens & Optics Style: ${manual.opticsStyle}` : ""}`
    : `AGENT INSTRUCTIONS:
- Dynamically pair each shot with the optimal engine (Kling 3.0 Turbo for action/physics, Seedance for fast motion, Nano Banana Pro for photoreal character turnaround, Cinema Voice HD for dialogue).
- If characters, locations, or props do not exist in the project, create them autonomously in Step 1/2/3.`
}

Available Production Tools & Pipelines:
1. 'character' — Create locked 3-panel character turnaround reference sheet (Front, Rear, Face close-up). Cost: 6 credits.
2. 'location' — Create locked architectural environment & lighting token. Cost: 6 credits.
3. 'prop' — Create locked hero object / weapon / vehicle token with macro studio textures. Cost: 6 credits.
4. 'image' — Render establishing or concept still frame (Nano Banana / GPT Image 2). Cost: 6 credits.
5. 'video' — Generate cinematic motion take (Kling 3.0 Turbo: 5s = 20 credits, 10s = 40 credits; Seedance: 5s = 10 credits).
6. 'audio' — Synthesize cinematic voiceover dialogue track (Cinema Voice Master HD). Cost: 4 credits.
7. 'lipsync' — Synchronize silent video with audio speech track (Fast Motion: 5s = 5 credits).

Rules:
- Order steps logically: Pre-production Cast/Sets/Props -> Keyframe Stills -> Motion Video Takes -> Voiceover -> (Optional Lip-Sync).
- Keep production plans focused (typically 3 to 6 high-impact steps per scene).
${isScript ? "- Group steps by scenes with scene headings and estimated credit totals." : ""}
- Return ONLY valid JSON in this exact structure:
{
  "title": "Short Film/Ad Title",
  "summary": "Creative vision and strategic breakdown",
  "scenes": [
    {
      "sceneNumber": 1,
      "heading": "SCENE 1 - INT. COFFEE SHOP - DAY",
      "description": "Scene overview",
      "estimatedCredits": 26,
      "steps": [
        {
          "stepId": "1",
          "type": "character | location | prop | image | video | audio | lipsync",
          "title": "Step Name",
          "description": "What this step creates",
          "estimatedCredits": 6,
          "params": {
            "prompt": "Detailed cinematic prompt",
            "modelName": "${isManual ? manual.videoModel || "kling-2.5-turbo" : "nano-banana | kling-2.5-turbo | seedance-video | voice-hd"}",
            "durationSeconds": ${isManual ? manual.durationSeconds || 5 : 5},
            "aspectRatio": "${isManual ? manual.aspectRatio || "16:9" : "16:9"}",
            "voiceId": "Rachel | Adam | Domi | Drew | Nicole | Clyde",
            "name": "Element Name if character/location/prop",
            "description": "Description",
            "atmosphere": "Atmosphere if location",
            "material": "Material if prop"
          }
        }
      ]
    }
  ],
  "steps": [
    {
      "stepId": "1",
      "type": "character | location | prop | image | video | audio | lipsync",
      "title": "Step Name",
      "description": "What this step creates",
      "estimatedCredits": 6,
      "params": {
        "prompt": "Detailed cinematic prompt",
        "modelName": "model-id",
        "durationSeconds": 5,
        "aspectRatio": "16:9",
        "voiceId": "Rachel",
        "name": "Name",
        "description": "Desc"
      }
    }
  ],
  "reasoning": "Directorial rationale"
}`;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1800,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `User Input (${inputType}):\n"""\n${cleanGoal}\n"""\n\nExisting Project Elements (Cast, Sets, Props):\n${JSON.stringify(
                existing
              )}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.content?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          // Flatten steps across scenes if scenes provided, or use top-level steps
          let allSteps: VibeProductionStep[] = [];
          let sceneGroups: VibeSceneGroup[] | undefined;

          if (Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            sceneGroups = parsed.scenes.map((sc: any, sIdx: number) => {
              const sceneSteps: VibeProductionStep[] = (sc.steps || []).map((st: any, stIdx: number) => ({
                stepId: String(st.stepId || `${sIdx + 1}.${stIdx + 1}`),
                type: st.type || "video",
                title: st.title || `Scene ${sIdx + 1} Take ${stIdx + 1}`,
                description: st.description || "",
                estimatedCredits: Number(st.estimatedCredits) || 6,
                params: {
                  ...st.params,
                  modelName: isManual && (st.type === "video" ? manual.videoModel : manual.imageModel) || st.params?.modelName,
                  aspectRatio: isManual && manual.aspectRatio || st.params?.aspectRatio || "16:9",
                  durationSeconds: isManual && manual.durationSeconds || st.params?.durationSeconds || 5,
                },
              }));

              const sceneCredits = sceneSteps.reduce((acc, s) => acc + s.estimatedCredits, 0);
              allSteps.push(...sceneSteps);

              return {
                sceneNumber: sc.sceneNumber || sIdx + 1,
                heading: sc.heading || `SCENE ${sIdx + 1}`,
                description: sc.description || "",
                estimatedCredits: sceneCredits,
                steps: sceneSteps,
              };
            });
          } else {
            allSteps = (parsed.steps || []).map((s: any, i: number) => ({
              stepId: String(s.stepId || i + 1),
              type: s.type || "video",
              title: s.title || `Production Step ${i + 1}`,
              description: s.description || "",
              estimatedCredits: Number(s.estimatedCredits) || 6,
              params: {
                ...s.params,
                modelName: isManual && (s.type === "video" ? manual.videoModel : manual.imageModel) || s.params?.modelName,
                aspectRatio: isManual && manual.aspectRatio || s.params?.aspectRatio || "16:9",
                durationSeconds: isManual && manual.durationSeconds || s.params?.durationSeconds || 5,
              },
            }));
          }

          const totalCredits = allSteps.reduce((acc, s) => acc + s.estimatedCredits, 0);

          return {
            title: parsed.title || "Cinematic Production Sequence",
            summary: parsed.summary || "AI Orchestrated Production Sequence",
            mode,
            totalEstimatedCredits: totalCredits,
            steps: allSteps,
            scenes: sceneGroups,
            reasoning: parsed.reasoning || "Directorial sequence planned for complete storytelling cohesion.",
            anthropicCostCredits: 0.4,
          };
        }
      }
    } catch {
      // Heuristic Fallback
    }
  }

  // Heuristic Production Plan Fallback
  const isAd = cleanGoal.toLowerCase().includes("ad") || cleanGoal.toLowerCase().includes("commercial");
  const defaultVideoModel = isManual ? manual.videoModel || "kling-2.5-turbo" : "kling-2.5-turbo";
  const defaultImageModel = isManual ? manual.imageModel || "nano-banana" : "nano-banana";
  const defaultRatio = isManual ? manual.aspectRatio || "16:9" : "16:9";
  const defaultDuration = isManual ? manual.durationSeconds || 5 : 5;

  const steps: VibeProductionStep[] = [];

  steps.push({
    stepId: "1",
    type: "character",
    title: "1. Lead Character Design & Turnaround Sheet",
    description: "Locked 3-panel identity turnaround sheet ensuring face and wardrobe continuity",
    estimatedCredits: 6,
    params: {
      name: "Lead Subject",
      description: `Central protagonist for: ${cleanGoal.slice(0, 80)}`,
      modelName: defaultImageModel,
    },
  });

  steps.push({
    stepId: "2",
    type: "location",
    title: "2. Scene Atmosphere & Location Set",
    description: "8K volumetric establishing keyframe locking lighting temperature and architectural style",
    estimatedCredits: 6,
    params: {
      name: "Primary Scene Location",
      description: `Cinematic setting for ${cleanGoal.slice(0, 80)}`,
      atmosphere: manual.opticsStyle || "Atmospheric cinematic lighting",
      modelName: defaultImageModel,
      aspectRatio: defaultRatio,
    },
  });

  steps.push({
    stepId: "3",
    type: "video",
    title: "3. Hero Cinematic Motion Take",
    description: `${defaultVideoModel} camera tracking take with locked character and lighting continuity`,
    estimatedCredits: defaultDuration === 10 ? 40 : 20,
    params: {
      prompt: `Cinematic master film video clip for: ${cleanGoal.slice(0, 100)}. ${manual.opticsStyle || "35mm anamorphic lens, steady tracking camera movement, 8k resolution"}`,
      modelName: defaultVideoModel,
      durationSeconds: defaultDuration,
      aspectRatio: defaultRatio,
    },
  });

  steps.push({
    stepId: "4",
    type: "audio",
    title: "4. Voiceover Narration & Dialogue",
    description: "Cinema Voice Master HD audio track with warm dramatic delivery",
    estimatedCredits: 4,
    params: {
      prompt: isAd
        ? `Experience perfection in every moment. Crafted with dedication, made for you.`
        : `Every shadow has a story, and some stories are written in light.`,
      voiceId: "Rachel",
    },
  });

  const totalCredits = steps.reduce((acc, s) => acc + s.estimatedCredits, 0);

  return {
    title: isAd ? "Brand Commercial Production" : "Cinematic Scene Production",
    summary: `Orchestrated ${mode.toUpperCase()} sequence for: "${cleanGoal.slice(0, 60)}..."`,
    mode,
    totalEstimatedCredits: totalCredits,
    steps,
    reasoning: isManual
      ? `Configured custom manual rig with ${defaultVideoModel} (${defaultRatio}, ${defaultDuration}s).`
      : "Autonomous AI director assigned dynamic models and optics for maximum narrative impact.",
    anthropicCostCredits: 0.4,
  };
}
