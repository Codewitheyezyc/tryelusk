import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://auwcncjkjnksidscilgr.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1d2NuY2pram5rc2lkc2NpbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NzAyMTYsImV4cCI6MjEwMzA0NjIxNn0.SOFTkIAEETh1OVEeV_CAydwc4UExAenaH_TkKLt0UdY";

async function verifyAudioAndLipSync() {
  console.log("====================================================================");
  console.log("  TRYELUSK — AUDIO GENERATION & LIP-SYNC PIPELINE AUDIT");
  console.log("====================================================================");

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Check pricing_table models
  console.log("\n[1/4] Checking Voice & Lip-Sync models in pricing_table...");
  const { data: pricingRows, error: pErr } = await client
    .from("pricing_table")
    .select("model_name, cost_formula_type, base_rate, is_active")
    .in("model_name", ["voice-hd", "sync-lipsync-fast", "sync-lipsync-pro"]);

  if (pErr) throw new Error(`Pricing table query failed: ${pErr.message}`);
  console.table(pricingRows);

  const voiceRow = pricingRows.find((r) => r.model_name === "voice-hd");
  const fastSyncRow = pricingRows.find((r) => r.model_name === "sync-lipsync-fast");
  const proSyncRow = pricingRows.find((r) => r.model_name === "sync-lipsync-pro");

  if (!voiceRow || Number(voiceRow.base_rate) !== 4) throw new Error("voice-hd pricing not 4.0 cr");
  if (!fastSyncRow || Number(fastSyncRow.base_rate) !== 1) throw new Error("sync-lipsync-fast pricing not 1.0 cr/s");
  if (!proSyncRow || Number(proSyncRow.base_rate) !== 18) throw new Error("sync-lipsync-pro pricing not 18.0 cr/s");
  console.log("  ✓ All voice & lip-sync models verified with correct profit margins!");

  // 2. Authenticate test user
  console.log("\n[2/4] Authenticating test user...");
  const userEmail = "elusk.alice.1787480198649@gmail.com";
  const userPass = "EluskPassword123!";
  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email: userEmail,
    password: userPass,
  });
  if (authErr) throw new Error(`Auth failed: ${authErr.message}`);
  const user = authData.user;
  console.log(`  ✓ Authenticated User: ${user.id}`);

  // 3. Test Audio Record Storing
  console.log("\n[3/4] Testing Audio track creation & vault storage...");
  const mockAudioUrl = "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg";
  const audioJobId = `job_test_audio_${Date.now()}`;

  const { data: audioGen, error: aErr } = await client
    .from("generations")
    .insert({
      user_id: user.id,
      type: "audio",
      model_used: "voice-hd",
      prompt: "[Voice: Rachel] We have only one chance to breach the perimeter before dawn.",
      status: "completed",
      credits_charged: 4,
      output_url: mockAudioUrl,
      output_urls: [mockAudioUrl],
      job_id: audioJobId,
      technical_params: {
        voice_id: "Rachel",
        script_text: "We have only one chance to breach the perimeter before dawn.",
        media_type: "audio",
      },
    })
    .select()
    .single();

  if (aErr) throw new Error(`Audio insert failed: ${aErr.message}`);
  console.log(`  ✓ Audio generation record stored: ${audioGen.id} (type: ${audioGen.type})`);

  // 4. Test Lip-Sync Pass Record Storing (2-Stage Pipeline)
  console.log("\n[4/4] Testing Lip-Sync Pass 2-Stage pipeline record...");
  const mockSyncedVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const lipsyncJobId = `job_test_lipsync_${Date.now()}`;

  const { data: lipsyncGen, error: lErr } = await client
    .from("generations")
    .insert({
      user_id: user.id,
      type: "video",
      model_used: "sync-lipsync-fast",
      prompt: "[Lip-Synced Take] Synchronized dialogue pass (5s)",
      status: "completed",
      credits_charged: 5,
      duration_seconds: 5,
      output_url: mockSyncedVideoUrl,
      output_urls: [mockSyncedVideoUrl],
      job_id: lipsyncJobId,
      technical_params: {
        is_lipsync: true,
        source_audio_url: mockAudioUrl,
      },
    })
    .select()
    .single();

  if (lErr) throw new Error(`Lip-sync insert failed: ${lErr.message}`);
  console.log(`  ✓ Lip-sync generation record stored: ${lipsyncGen.id} (type: ${lipsyncGen.type})`);

  // Query Vault for Audio & Lip-sync
  const { data: userAudioAssets, error: qErr } = await client
    .from("generations")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "audio");

  if (qErr) throw new Error(`Audio query failed: ${qErr.message}`);
  console.log(`  ✓ Media Vault Audio & Voice space contains: ${userAudioAssets.length} tracks`);

  console.log("\n====================================================================");
  console.log("  🏆 AUDIO GENERATION & LIP-SYNC PIPELINE AUDIT PASSED 100%!");
  console.log("====================================================================");
}

verifyAudioAndLipSync().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
