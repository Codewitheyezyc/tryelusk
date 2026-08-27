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

async function getRealPricing() {
  console.log("====================================================================");
  console.log("  CHECKING PRICING FOR REAL NAMED MODEL ENDPOINTS");
  console.log("====================================================================");

  const realEndpoints = [
    // Google Nano Banana
    "fal-ai/nano-banana",
    "fal-ai/nano-banana-pro",
    "google/nano-banana-lite",
    "fal-ai/nano-banana-2",
    // ByteDance Seedream
    "bytedance/seedream/v5/lite/text-to-image",
    "bytedance/seedream/v5/pro/text-to-image",
    "fal-ai/bytedance/seedream/v4.5/text-to-image",
    "fal-ai/bytedance/seedream/v4/text-to-image",
    // OpenAI GPT Image
    "openai/gpt-image-2",
    "fal-ai/gpt-image-1.5",
    "fal-ai/gpt-image-1-mini",
    "fal-ai/gpt-image-1/text-to-image",
  ];

  for (const ep of realEndpoints) {
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

getRealPricing();
