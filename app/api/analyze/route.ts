import { NextResponse } from "next/server";
import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { outcomes, syllabus, set1, set2 } = await req.json();

    const sanitize = (txt: string) =>
      txt.replace(/•/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

    const parseQuestions = (set: string) =>
      set.split(/\n\s*\n/).map(sanitize).filter((q: string) => q.trim().length > 0);

    const evaluateQuestions = async (questions: string[]) => {
      const systemPrompt = `
You are an expert academic evaluator.

Return only a valid JSON array. No commentary.

For each question:
- "question": original question
- "bloom": Bloom's level
- "higherOrder": true/false
- "clarityScore": out of 100
- "grammarScore": out of 100
- "spellingScore": out of 100
- "overallScore": out of 100 (average of above)
- "suggestions": list of 2 improvement suggestions
      `.trim();

      const userPrompt = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

      const completion = await openai.chat.completions.create({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
      });

      let raw = completion.choices[0].message.content || "[]";
      if (!raw.trim().startsWith("[")) raw = raw.slice(raw.indexOf("["));
      if (!raw.trim().endsWith("]")) raw += "]";

      let evaluations = [];
      try {
        evaluations = JSON.parse(raw);
      } catch {
        try {
          const repaired = jsonrepair(raw);
          evaluations = JSON.parse(repaired);
        } catch (err) {
          console.error("🔴 JSON repair failed:", raw);
          throw new Error("AI response could not be parsed.");
        }
      }

      const avg = (val: number) => evaluations.length ? Math.round(val / evaluations.length) : 0;
      let totalScore = 0;
      const metricTotals = { spelling: 0, grammar: 0, clarity: 0 };

      evaluations.forEach((q: any) => {
        totalScore += q.overallScore;
        metricTotals.spelling += q.spellingScore;
        metricTotals.grammar += q.grammarScore;
        metricTotals.clarity += q.clarityScore;
      });

      return {
        totalScore: avg(totalScore),
        metrics: [
          { label: "Spelling", score: avg(metricTotals.spelling) },
          { label: "Grammar", score: avg(metricTotals.grammar) },
          { label: "Clarity", score: avg(metricTotals.clarity) },
          { label: "Bloom Level", score: 90 },
          { label: "Higher Order", score: 85 },
          { label: "CO Match", score: 70 },
          { label: "Syllabus Match", score: 75 },
        ],
        unitCoverage: "3 / 5",
        difficulty: "Medium",
        evaluations,
      };
    };

    const set1Questions = parseQuestions(set1);
    const resultSet1 = await evaluateQuestions(set1Questions);

    if (!set2) {
      return NextResponse.json(resultSet1);
    }

    const set2Questions = parseQuestions(set2);
    const resultSet2 = await evaluateQuestions(set2Questions);

    const similarityPrompt = `
You are a strict question-paper auditor. Compare two sets of questions.

Identify questions in Set 1 that are similar or paraphrased versions of questions in Set 2.

Return a JSON array of similar question pairs like:
[
  {
    "set1": "question from set1",
    "set2": "matching question from set2",
    "similarity": "High" or "Medium" or "Low"
  }
]

Only include matches with Medium or High similarity.

Set 1:
${set1Questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Set 2:
${set2Questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;

    const simResponse = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: "You are an expert question-paper analyzer." },
        { role: "user", content: similarityPrompt },
      ],
      max_tokens: 2048,
    });

    let simRaw = simResponse.choices[0].message.content || "[]";
    if (!simRaw.trim().startsWith("[")) simRaw = simRaw.slice(simRaw.indexOf("["));
    if (!simRaw.trim().endsWith("]")) simRaw += "]";

    let similarityMatches = [];
    try {
      similarityMatches = JSON.parse(simRaw);
    } catch (err) {
      console.error("🔴 JSON parse failed in compare mode:", simRaw);
      return NextResponse.json({ error: "Could not parse similarity response." }, { status: 500 });
    }

    const matchPercent = ((similarityMatches.length / set1Questions.length) * 100).toFixed(1);

    return NextResponse.json({
      set1Result: resultSet1,
      set2Result: resultSet2,
      similarity: {
        matchPercent,
        totalSet1: set1Questions.length,
        totalSet2: set2Questions.length,
        similarityMatches,
      }
    });

  } catch (err: any) {
    console.error("❌ Server Error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Evaluation failed." }, { status: 500 });
  }
}
