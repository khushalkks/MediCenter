import { OpenAI } from "openai";
import { retrieveMedicalContext } from "../utils/ragRetriever.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend .env
dotenv.config();

const testVectorRAG = async () => {
  try {
    console.log("🔄 Initializing Vector RAG Verification...");
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
    });

    // Test text using semantic synonyms:
    // "sugar indices" (should match Blood Glucose)
    // "thyroid activity" (should match TSH)
    const testText = "The patient's lab report reveals elevated sugar indices and sluggish thyroid activity.";
    
    console.log(`\n📝 Test Text: "${testText}"`);
    console.log("🔍 Querying Vector Embedding & Cosine Similarity search...");

    const result = await retrieveMedicalContext(testText, openai);

    console.log("\n📈 Vector Search Matches:");
    result.matchedGuidelines.forEach(item => {
      console.log(`- matched: ${item.parameter} | similarity score: ${item.score.toFixed(4)}`);
    });

    if (result.matchedGuidelines.length > 0) {
      console.log("\n✅ Verification Successful: Semantic matching retrieved parameters successfully using Vector RAG!");
    } else {
      console.log("\n⚠️ Verification Failed: No parameters matched. Threshold might be too high or API key incorrect.");
    }
  } catch (error) {
    console.error("❌ Vector RAG test failed with error:", error.message);
  }
};

testVectorRAG();
