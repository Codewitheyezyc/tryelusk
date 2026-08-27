const apiKey = "f4bc447b-2d89-4c9a-adf4-a247210a6873:efd184d529093ac234394dd17e3970f7";

const endpointsToTest = [
  // 1. Fast image (Flux Schnell)
  { name: "Flux Schnell (Fast Image)", url: "https://fal.run/fal-ai/flux/schnell", body: { prompt: "cinematic film still of a futuristic cyberpunk city at night" } },
  
  // 2. High Quality Image (Flux Dev)
  { name: "Flux Dev (Pro Image)", url: "https://fal.run/fal-ai/flux/dev", body: { prompt: "cinematic film still of a futuristic city" } },

  // 3. Video Models
  { name: "Kling v1.5 Pro Video", url: "https://fal.run/fal-ai/kling-video/v1.5/pro/text-to-video", body: { prompt: "cinematic drone shot over city", duration: "5", aspect_ratio: "16:9" } },
  { name: "Kling v1.6 Pro Video", url: "https://fal.run/fal-ai/kling-video/v1.6/pro/text-to-video", body: { prompt: "cinematic drone shot over city", duration: "5", aspect_ratio: "16:9" } },
  { name: "Minimax Video 01", url: "https://fal.run/fal-ai/minimax/video-01", body: { prompt: "cinematic drone shot over city" } },
  { name: "Luma Dream Machine", url: "https://fal.run/fal-ai/luma-dream-machine", body: { prompt: "cinematic drone shot over city", aspect_ratio: "16:9" } }
];

async function checkLiveEndpoints() {
  console.log("=== FAL.AI LIVE ENDPOINT & CARD AUTHORIZATION VERIFICATION ===");
  console.log("Using API Key:", apiKey.substring(0, 15) + "...\n");

  for (const ep of endpointsToTest) {
    try {
      console.log(`[TESTING] ${ep.name} (${ep.url})...`);
      const res = await fetch(ep.url, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ep.body),
        signal: AbortSignal.timeout(30000),
      });

      console.log(`  -> Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`  -> Output: ${text.substring(0, 250)}\n`);
    } catch (err) {
      console.log(`  -> Error: ${err.message}\n`);
    }
  }
}

checkLiveEndpoints();
