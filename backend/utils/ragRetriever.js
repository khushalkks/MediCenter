import { createRequire } from "module";
const require = createRequire(import.meta.url);
const guidelines = require("../config/medicalGuidelines.json");

let guidelinesWithEmbeddings = null;

// Helper to compute Dot Product (since OpenAI embeddings are normalized, Dot Product === Cosine Similarity)
const dotProduct = (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0);

/**
 * Lazily generates and caches guidelines embeddings in memory using OpenAI Embeddings API.
 * @param {Object} openai - OpenAI API client instance.
 */
const initializeEmbeddings = async (openai) => {
  if (guidelinesWithEmbeddings) return;

  console.log("🔄 Pre-computing clinical guideline embeddings for Vector RAG...");
  guidelinesWithEmbeddings = [];

  for (const item of guidelines) {
    try {
      // Create a rich text description to capture semantic meaning
      const textToEmbed = `Parameter: ${item.parameter}. Keywords: ${item.keywords.join(", ")}. Clinical Significance: ${item.significance}`;
      
      const response = await openai.embeddings.create({
        model: "openai/text-embedding-3-small",
        input: textToEmbed
      });

      const embedding = response.data[0].embedding;
      guidelinesWithEmbeddings.push({
        ...item,
        embedding
      });
    } catch (error) {
      console.error(`⚠️ Failed to embed guideline for ${item.parameter}:`, error.message);
      // Safe fallback: push item without vector
      guidelinesWithEmbeddings.push({
        ...item,
        embedding: null
      });
    }
  }
  console.log(`✅ Vector RAG ready! Cached ${guidelinesWithEmbeddings.filter(i => i.embedding).length} guideline embeddings in memory.`);
};

/**
 * Semantically searches clinical guidelines using Cosine Similarity over OpenAI Embeddings.
 * @param {string} reportText - Extracted text from the report.
 * @param {Object} openai - OpenAI client instance.
 * @returns {Promise<Object>} { contextString: string, matchedGuidelines: Array }
 */
export const retrieveMedicalContext = async (reportText, openai) => {
  if (!reportText || !openai) {
    return { contextString: "", matchedGuidelines: [] };
  }

  try {
    // 1. Lazy initialize guideline vector embeddings
    await initializeEmbeddings(openai);

    if (!guidelinesWithEmbeddings || guidelinesWithEmbeddings.length === 0) {
      return { contextString: "", matchedGuidelines: [] };
    }

    const cleanText = reportText.trim();
    if (cleanText.length === 0) {
      return { contextString: "", matchedGuidelines: [] };
    }

    // 2. Generate vector embedding for the report text
    const reportResponse = await openai.embeddings.create({
      model: "openai/text-embedding-3-small",
      input: cleanText.substring(0, 8000)
    });

    const reportEmbedding = reportResponse.data[0].embedding;
    const scoredGuidelines = [];

    // 3. Compute Cosine Similarity (Dot Product)
    for (const item of guidelinesWithEmbeddings) {
      if (!item.embedding) continue;
      const score = dotProduct(reportEmbedding, item.embedding);
      scoredGuidelines.push({
        ...item,
        score
      });
    }

    // 4. Sort and filter matching guidelines by threshold
    // A threshold of 0.25 to 0.30 catches semantic parameters without false matches
    const SIMILARITY_THRESHOLD = 0.28;
    scoredGuidelines.sort((a, b) => b.score - a.score);
    const matchedGuidelines = scoredGuidelines.filter(item => item.score >= SIMILARITY_THRESHOLD);

    // 5. Build markdown reference context string
    let contextString = "";
    if (matchedGuidelines.length > 0) {
      contextString = "\n### RETRIEVED CLINICAL GUIDELINES & REFERENCES:\n";
      matchedGuidelines.forEach((item, index) => {
        contextString += `${index + 1}. Parameter: ${item.parameter} (Cosine Similarity: ${item.score.toFixed(4)})\n`;
        contextString += `   - Standard Reference Range: ${item.ref_range}\n`;
        contextString += `   - Significance: ${item.significance}\n`;
        contextString += `   - Official Source: ${item.source_name} (${item.source_url})\n\n`;
      });
    }

    // Remove the raw float vectors from the returned matched array to keep the payload clean
    const cleanMatched = matchedGuidelines.map(item => {
      const { embedding, ...rest } = item;
      return rest;
    });

    return {
      contextString,
      matchedGuidelines: cleanMatched
    };

  } catch (error) {
    console.error("❌ Vector RAG Retrieval Error:", error);
    return { contextString: "", matchedGuidelines: [] };
  }
};
