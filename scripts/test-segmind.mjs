const segmindKey = "SG_fbdcf8b773f374d6";

async function testSegmind() {
  console.log("=== TESTING SEGMIND PROVIDER ===");
  try {
    const res = await fetch("https://api.segmind.com/v1/sdxl1.0-txt2img", {
      method: "POST",
      headers: {
        "x-api-key": segmindKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "cinematic film still of a futuristic city",
        samples: 1,
        scheduler: "Euler_a",
        num_inference_steps: 20,
        guidance_scale: 7.5,
        seed: 12345,
      }),
    });
    console.log("Segmind Status:", res.status, res.statusText);
    const contentType = res.headers.get("content-type");
    console.log("Content-Type:", contentType);
    if (contentType && contentType.includes("image")) {
      console.log("Segmind Success! Returned live generated image buffer.");
    } else {
      const text = await res.text();
      console.log("Segmind Response:", text.substring(0, 200));
    }
  } catch (err) {
    console.log("Segmind Error:", err.message);
  }
}

testSegmind();
