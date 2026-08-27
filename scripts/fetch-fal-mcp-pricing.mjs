async function callFalMCP(toolName, args) {
  const apiKey = "f4bc447b-2d89-4c9a-adf4-a247210a6873:efd184d529093ac234394dd17e3970f7";
  const res = await fetch("https://mcp.fal.ai/mcp", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
      id: Date.now(),
    }),
  });

  const rawText = await res.text();
  // Parse event-stream data: line
  const lines = rawText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      try {
        const json = JSON.parse(line.substring(6));
        return json.result;
      } catch (e) {}
    }
  }
  return rawText;
}

async function checkAllPricing() {
  console.log("====================================================================");
  console.log("  FAL.AI MCP SERVER — LIVE MODEL CATALOG & PRICING INSPECTION");
  console.log("====================================================================");

  const modelsToCheck = [
    // Image models
    { id: "fal-ai/flux/schnell", name: "Nano Banana Lite (Flux Schnell)" },
    { id: "fal-ai/flux/dev", name: "Nano Banana Cinema (Flux Dev)" },
    { id: "fal-ai/flux-pro/v1.1", name: "Nano Banana Pro (Flux Pro 1.1)" },
    { id: "fal-ai/flux-pro/v1.1-ultra", name: "Flux Ultra 8K (Flux Pro Ultra)" },
    { id: "fal-ai/recraft-v3", name: "GPT Image 2 (Recraft V3)" },
    { id: "fal-ai/bytedance/sdxl-lightning", name: "Seedream Cinema (SDXL Lightning)" },
    // Video models
    { id: "fal-ai/kling-video/v3/pro/text-to-video", name: "Kling 3.0 Cinema Pro" },
    { id: "fal-ai/kling-video/v3/turbo/pro/text-to-video", name: "Kling 3.0 Turbo" },
    { id: "fal-ai/bytedance/seedance-2.5/text-to-video", name: "Seedance 2.5 Motion" },
    { id: "fal-ai/kling-video/v1.5/pro/text-to-video", name: "Kling 1.5 Pro" },
    { id: "fal-ai/kling-video/v1.5/standard/text-to-video", name: "Kling 1.5 Standard" },
  ];

  console.log("\n[1/2] Fetching pricing via fal MCP `get_pricing`...");
  for (const m of modelsToCheck) {
    try {
      const result = await callFalMCP("get_pricing", { endpoint_id: m.id });
      console.log(`\nModel: [${m.name}] (${m.id})`);
      if (result && result.content) {
        console.log(result.content.map((c) => c.text).join("\n"));
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (err) {
      console.log(`  Error querying ${m.id}: ${err.message}`);
    }
  }

  console.log("\n[2/2] Searching video models via fal MCP `search_models` query='kling'...");
  try {
    const searchRes = await callFalMCP("search_models", { query: "kling", category: "text-to-video" });
    if (searchRes && searchRes.content) {
      console.log(searchRes.content.map((c) => c.text).join("\n"));
    }
  } catch (err) {
    console.log(`  Search error: ${err.message}`);
  }

  console.log("\n[3/3] Searching video models via fal MCP `search_models` query='seedance'...");
  try {
    const searchRes = await callFalMCP("search_models", { query: "seedance", category: "text-to-video" });
    if (searchRes && searchRes.content) {
      console.log(searchRes.content.map((c) => c.text).join("\n"));
    }
  } catch (err) {
    console.log(`  Search error: ${err.message}`);
  }
}

checkAllPricing();
