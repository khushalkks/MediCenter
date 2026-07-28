import express from "express";
import { OpenAI } from "openai";

const router = express.Router();

// OpenRouter uses the OpenAI-compatible API with a different base URL
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", // Your site URL
    "X-Title": "MediCare Medical Chatbot",    // Your app name
  },
});

router.post("/", async (req, res) => {
  const { message, messages } = req.body;

  // We require either a single message or a messages history array
  if (!message && (!messages || !Array.isArray(messages) || messages.length === 0)) {
    return res.status(400).json({ reply: "Message or messages array is required." });
  }

  try {
    // Construct chat completion messages array
    const systemPrompt = {
      role: "system",
      content:
        "You are MediCare's helpful medical assistant. You help users understand symptoms, suggest which specialist to visit, answer general health questions, and guide users through booking appointments. Always recommend consulting a real doctor for serious concerns.",
    };

    let apiMessages = [systemPrompt];

    if (messages && Array.isArray(messages)) {
      // Map history ensuring only clean role and content properties are passed
      const formattedHistory = messages
        .filter(msg => msg.role && msg.content)
        .map(msg => ({
          role: msg.role === "assistant" || msg.role === "bot" ? "assistant" : "user",
          content: msg.content,
        }));
      apiMessages = [...apiMessages, ...formattedHistory];
    } else {
      // Single message fallback
      apiMessages.push({ role: "user", content: message });
    }

    console.log("DEBUG: apiMessages =", JSON.stringify(apiMessages, null, 2));

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Upgraded to faster, smarter gpt-4o-mini
      messages: apiMessages,
      max_tokens: 500,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Chatbot Error:", error?.message || error);
    res.status(500).json({
      reply: "Sorry, I'm having trouble responding right now. Please try again later.",
    });
  }
});

export default router;
