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

async function getAudioPricing() {
  console.log("====================================================================");
  console.log("  CHECKING PRICING FOR AUDIO & LIP-SYNC ENDPOINTS");
  console.log("====================================================================");

  const endpoints = [
    "fal-ai/elevenlabs/tts/multilingual-v2",
    "fal-ai/elevenlabs/tts/eleven-v3",
    "fal-ai/minimax/speech-2.8-hd",
    "fal-ai/sync-lipsync/v3",
    "fal-ai/sync-lipsync/v2/pro",
    "fal-ai/latentsync",
  ];

  for (const ep of endpoints) {
    try {
      const res = await callFalMCP("get_pricing", { endpoint_id: ep });
      console.log(`\nEndpoint: [${ep}]`);
      if (res && res.content) {
        console.log(res.content.map((c) => c.text).join("\n"));
      } else {
        console.log(JSON.stringify(res));
      }
    } catch (e) {
      console.log(`  Error for ${ep}: ${e.message}`);
    }
  }
}

getAudioPricing();
