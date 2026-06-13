import express from "express";
import { OpenAI } from "openai";

const router = express.Router();

// OpenRouter uses the OpenAI-compatible API with a different base URL
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", // Your site URL
    "X-Title": "Wellora Medical Chatbot",    // Your app name
  },
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // OpenRouter model format
      messages: [
        {
          role: "system",
          content:
            "You are Wellora's helpful medical assistant. You help users understand symptoms, suggest which specialist to visit, answer general health questions, and guide users through booking appointments. Always recommend consulting a real doctor for serious concerns.",
        },
        { role: "user", content: message },
      ],
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
