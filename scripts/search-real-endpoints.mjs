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

async function searchRealEndpoints() {
  console.log("====================================================================");
  console.log("  SEARCHING FAL.AI MCP FOR REAL MODEL ENDPOINTS");
  console.log("====================================================================");

  const searches = [
    { query: "imagen", cat: "text-to-image", label: "Google Imagen / Nano Banana" },
    { query: "google", cat: "text-to-image", label: "Google Models" },
    { query: "seedream", cat: "text-to-image", label: "ByteDance Seedream" },
    { query: "bytedance", cat: "text-to-image", label: "ByteDance Images" },
    { query: "dall-e", cat: "text-to-image", label: "OpenAI DALL-E / GPT Image" },
    { query: "openai", cat: "text-to-image", label: "OpenAI Models" },
    { query: "gpt", cat: "text-to-image", label: "GPT Image" },
    { query: "flux", cat: "text-to-image", label: "Flux Models" },
    { query: "recraft", cat: "text-to-image", label: "Recraft Models" },
    { query: "ideogram", cat: "text-to-image", label: "Ideogram Models" },
  ];

  for (const s of searches) {
    console.log(`\n--- Searching [${s.label}] (query: "${s.query}") ---`);
    try {
      const res = await callFalMCP("search_models", { query: s.query, category: s.cat });
      if (res && res.content) {
        const text = res.content.map((c) => c.text).join("\n");
        const parsed = JSON.parse(text);
        if (parsed.models && parsed.models.length > 0) {
          parsed.models.forEach((m) => {
            console.log(`  • [${m.endpoint_id}] - "${m.name}": ${m.description.substring(0, 90)}...`);
          });
        } else {
          console.log("  No models found.");
        }
      } else {
        console.log(JSON.stringify(res));
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
}

searchRealEndpoints();
