const fetch = require('node-fetch');

const API_URL = "http://127.0.0.1:8081";
const COMPLETION_ENDPOINT = "/completion";

async function testServer() {
  const payload = {
    prompt: "Hello, how are you?",
    temperature: 0.7,
    top_k: 40,
    top_p: 0.9,
    n_predict: 2000,
    stop: ["\n### Human:"],
    stream: false,
    cache_prompt: true
  };

  try {
    const response = await fetch(`${API_URL}${COMPLETION_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
  } catch (error) {
    console.error("Error calling LLaMA API:", error);
  }
}

testServer();