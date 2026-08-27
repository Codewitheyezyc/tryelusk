async function testFalAuth() {
  const key1 = "f4bc447b-2d89-4c9a-adf4-a247210a6873:efd184d529093ac234394dd17e3970f";
  const key2 = "f4bc447b-2d89-4c9a-adf4-a247210a6873:efd184d529093ac234394dd17e3970f7";

  const headersToTest = [
    { name: "Bearer key1", header: `Bearer ${key1}` },
    { name: "Key key1", header: `Key ${key1}` },
    { name: "Bearer key2", header: `Bearer ${key2}` },
    { name: "Key key2", header: `Key ${key2}` },
  ];

  console.log("--- Testing Fal MCP Transport (https://mcp.fal.ai/mcp) ---");
  for (const h of headersToTest) {
    try {
      const res = await fetch("https://mcp.fal.ai/mcp", {
        method: "POST",
        headers: {
          Authorization: h.header,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          params: {},
          id: 1,
        }),
      });
      console.log(`[MCP] ${h.name} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`      Body snippet: ${text.substring(0, 120)}`);
    } catch (e) {
      console.log(`[MCP] ${h.name} -> Error: ${e.message}`);
    }
  }

  console.log("\n--- Testing Fal Standard API (https://fal.run/fal-ai/flux/schnell) ---");
  for (const h of headersToTest) {
    try {
      const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: h.header,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "test" }),
      });
      console.log(`[RUN] ${h.name} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`      Body snippet: ${text.substring(0, 120)}`);
    } catch (e) {
      console.log(`[RUN] ${h.name} -> Error: ${e.message}`);
    }
  }
}

testFalAuth();
