import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
});

const testNotes = [
  {
    case: "Medium Urgency Follow-up",
    notes: "Patient exhibits borderline hypertensive readings. Recommend BP monitoring and a review check-up next week."
  },
  {
    case: "High Urgency Follow-up",
    notes: "Severe allergic reactions detected. Advise urgent consult within 3 days to re-examine skin lesions."
  },
  {
    case: "No Follow-up Needed",
    notes: "All symptoms resolved. Blood parameters are back to baseline. Discharged with no further action required."
  }
];

const parseDoctorNotes = async (notes) => {
  const prompt = `You are a clinical coordinator agent. Read the following doctor's diagnosis/prescription notes and determine if a follow-up appointment is recommended.
Extract standard parameters in a clean JSON format.

Notes: "${notes}"

Return your response in a clean JSON format with these exact keys:
{
  "isActionable": true/false (true if doctor explicitly or implicitly advises a follow-up, check-up, review, or testing in the future),
  "timeFrameDays": number (estimate the number of days for the follow-up. E.g. "next week" = 7, "2 weeks" = 14, "a month" = 30. If no timeframe mentioned, default to 14. Value must be a number),
  "urgency": "Low" / "Medium" / "High",
  "rationale": "One simple sentence explaining why the follow-up is needed (e.g. 'To monitor blood pressure levels')",
  "recommendedSpeciality": "Name of specialty (e.g. General physician, Dermatologist, Cardiologist)"
}`;

  const response = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

const verifyAgenticLoop = async () => {
  console.log("🔄 Starting AI Follow-up Scheduler Agent Verification...\n");

  for (const item of testNotes) {
    try {
      console.log(`📋 Case: ${item.case}`);
      console.log(`✍️ Doctor's Notes: "${item.notes}"`);
      
      const parsed = await parseDoctorNotes(item.notes);
      
      console.log("🤖 AI Extracted Recommendation Structure:");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("--------------------------------------------------\n");
    } catch (error) {
      console.error(`⚠️ Test failed for case ${item.case}:`, error.message);
    }
  }
  
  console.log("✅ Verification Finished successfully!");
};

verifyAgenticLoop();
