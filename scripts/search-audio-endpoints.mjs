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

async function searchAudioEndpoints() {
  console.log("====================================================================");
  console.log("  SEARCHING FAL.AI MCP FOR REAL AUDIO & LIP-SYNC ENDPOINTS");
  console.log("====================================================================");

  const searches = [
    { query: "tts", label: "Text-to-Speech Voice Models" },
    { query: "voice", label: "Voice Models" },
    { query: "audio", label: "Audio Models" },
    { query: "elevenlabs", label: "ElevenLabs Models" },
    { query: "lipsync", label: "Lip-Sync Video Models" },
    { query: "sync", label: "Sync Labs / LatentSync Models" },
    { query: "latentsync", label: "LatentSync Models" },
    { query: "sound", label: "Sound Effects & Audio" },
  ];

  for (const s of searches) {
    console.log(`\n--- Searching [${s.label}] (query: "${s.query}") ---`);
    try {
      const res = await callFalMCP("search_models", { query: s.query });
      if (res && res.content) {
        const text = res.content.map((c) => c.text).join("\n");
        const parsed = JSON.parse(text);
        if (parsed.models && parsed.models.length > 0) {
          parsed.models.slice(0, 8).forEach((m) => {
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

searchAudioEndpoints();
