// LLaMA API Service for communication with the local LLM server

// Types for our application
export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Local LLaMA server uses a different format than OpenAI
interface LlamaRequest {
  prompt: string;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  n_keep?: number;
  n_predict?: number;
  stop?: string[];
  stream?: boolean;
  cache_prompt?: boolean;
  slot_id?: number;
}

interface StreamChunk {
  content: string;
  stop?: boolean;
  truncated?: boolean;
  slot_id?: number;
}

// Base API URL for the local server
const API_URL = "http://localhost:8080";
const COMPLETION_ENDPOINT = "/completion";

// Instruction for the LLaMA chat format
const instruction = `A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the human's questions. The assistant is called Edge Pilot and is designed to help users with Office tasks.`;

// Format the prompt in the way llama.cpp server expects it
function formatPrompt(messages: Message[]): string {
  // Convert our messages to the format expected by llama.cpp server
  let formattedChat = messages.map(msg => {
    const role = msg.isUser ? "Human" : "Assistant";
    return `### ${role}: ${msg.text}`;
  }).join("\n");
  
  return `${instruction}\n${formattedChat}\n### Assistant:`;
}

/**
 * Sends a standard (non-streaming) request to the LLaMA API
 */
export async function sendChatRequest(messages: Message[]): Promise<string> {
  const prompt = formatPrompt(messages);
  
  const payload: LlamaRequest = {
    prompt: prompt,
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || "Sorry, I couldn't generate a response.";
      
  } catch (error) {
    console.error("Error calling LLaMA API:", error);
    return "Sorry, I encountered an error communicating with the local LLM.";
  }
}

/**
 * Stream text from the LLaMA API with an abort controller
 */
export async function streamChatResponse(
  messages: Message[], 
  onChunk: (text: string) => void,
  abortController: AbortController
): Promise<string> {
  const prompt = formatPrompt(messages);
  
  const payload: LlamaRequest = {
    prompt: prompt,
    temperature: 0.7,
    top_k: 40,
    top_p: 0.9,
    n_predict: 2000,
    stop: ["\n### Human:"],
    stream: true,
    cache_prompt: true
  };

  try {
    const response = await fetch(`${API_URL}${COMPLETION_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported");
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      
      // Process the chunk based on llama.cpp server format
      try {
        // Split by lines to process each event
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          // Skip if it's not a data line
          if (!line.startsWith('data: ')) continue;
          
          // Remove the 'data: ' prefix and parse JSON
          const jsonStr = line.substring(6);
          const message: StreamChunk = JSON.parse(jsonStr);
          
          if (message.content) {
            accumulatedText += message.content;
            onChunk(accumulatedText);
          }
          
          // Check if we need to stop
          if (message.stop) {
            break;
          }
        }
      } catch (e) {
        console.warn("Error parsing stream chunk:", e);
        // Just log the error and continue
      }
    }
    
    return accumulatedText;
    
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Fetch aborted');
      return "Message generation stopped.";
    }
    
    console.error("Streaming error:", error);
    return "Sorry, I encountered an error while connecting to the local LLM.";
  }
}