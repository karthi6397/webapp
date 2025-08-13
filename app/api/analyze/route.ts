import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { outcomes, syllabus, set1 } = await req.json();

    const prompt = `
You are an academic evaluator AI.

Analyze the question paper (Set 1) based on:
- Spell check ✅
- Grammar check ✅
- Clarity ✅
- Bloom's level ✅
- Higher-order thinking ✅
- Course outcome mapping ✅
- Syllabus relevance ✅
- Unit coverage (e.g. 4/5) ✅
- Difficulty level ✅
- Suggestions ✅

Return only valid JSON with this format:

{
  "score": 88,
  "checklist": {
    "spelling": true,
    "grammar": false,
    "clarity": true,
    "bloom_level": "Understand",
    "higher_order": false,
    "co_match": true,
    "syllabus_match": true,
    "unit_coverage": "3/5",
    "difficulty": "Medium"
  },
  "suggestions": [
    "Improve grammar in Q3 and Q5",
    "Add one more question from Unit 5"
  ]
}

Only return JSON. Do not explain.

Course Outcomes:
${outcomes}

Syllabus:
${syllabus}

Set 1:
${set1}
`;

    const chat = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const aiReply = chat.choices[0].message.content!;
    const jsonStart = aiReply.indexOf("{");
    const parsed = JSON.parse(aiReply.slice(jsonStart));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI or JSON parsing failed:", error);
    return NextResponse.json(
      { error: "Something went wrong during analysis." },
      { status: 500 }
    );
  }
}

