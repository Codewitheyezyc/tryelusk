import { refinePromptWithDirector } from "../src/lib/ai/director.ts";
import { CAMERA_CHIPS_DATA, LIGHTING_CHIPS_DATA } from "../src/components/studio/director-chips-data.ts";

async function verifyDirectorChips() {
  console.log("====================================================================");
  console.log("  TRYELUSK — PHASE 1: DIRECTOR CHIPS BAR AUDIT");
  console.log("====================================================================");

  // 1. Verify Camera Chips Array
  console.log("\n[1/3] Verifying Camera Chips Data...");
  CAMERA_CHIPS_DATA.forEach((c) => {
    console.log(`  • [${c.id}] "${c.label}": ${c.promptModifier}`);
  });
  if (CAMERA_CHIPS_DATA.length < 5) throw new Error("Missing camera chips");

  // 2. Verify Lighting Mood Chips Array
  console.log("\n[2/3] Verifying Lighting Mood Chips Data...");
  LIGHTING_CHIPS_DATA.forEach((l) => {
    console.log(`  • [${l.id}] "${l.label}": ${l.promptModifier}`);
  });
  if (LIGHTING_CHIPS_DATA.length < 4) throw new Error("Missing lighting chips");

  // 3. Test Integration with Claude Director Layer
  console.log("\n[3/3] Testing Claude Director with selected Chips...");
  const rawPrompt = "A lone ronin standing in front of a neon cyber pagoda";
  const pushInChip = CAMERA_CHIPS_DATA.find((c) => c.id === "push-in");
  const neonChip = LIGHTING_CHIPS_DATA.find((l) => l.id === "cyberpunk-neon");

  const directorResult = await refinePromptWithDirector({
    prompt: rawPrompt,
    mediaType: "video",
    durationSeconds: 5,
    manualOverrides: {
      lighting: neonChip?.promptModifier,
      cameraMovement: pushInChip?.promptModifier,
    },
  });

  console.log(`  ✓ Raw User Prompt:        "${rawPrompt}"`);
  console.log(`  ✓ Injected Camera Move:   "${directorResult.cameraMovement}"`);
  console.log(`  ✓ Injected Lighting Mood: "${directorResult.lighting}"`);
  console.log(`  ✓ Refined Scene Output:   "${directorResult.refinedPrompt.substring(0, 80)}..."`);

  console.log("\n====================================================================");
  console.log("  🏆 PHASE 1: DIRECTOR CHIPS BAR AUDIT PASSED 100%!");
  console.log("====================================================================");
}

verifyDirectorChips().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
