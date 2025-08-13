"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  const [coText, setCoText] = useState("");
  const [syllabusText, setSyllabusText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!coText || !syllabusText || !questionsText) {
      toast.error("Please fill all required fields.");
      return;
    }

    toast.loading("Analyzing...");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomes: coText,
          syllabus: syllabusText,
          set1: questionsText,
        }),
      });

      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        setResult(data);
        toast.success("Analysis complete!");
      } else {
        toast.error(data.error || "Error in response");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center">Question Paper Evaluator</h1>

      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div>
            <Label>Course Outcomes *</Label>
            <Textarea
              placeholder="Enter COs..."
              value={coText}
              onChange={(e) => setCoText(e.target.value)}
            />
          </div>

          <div>
            <Label>Syllabus *</Label>
            <Textarea
              placeholder="Enter syllabus..."
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
            />
          </div>

          <div>
            <Label>Question Paper Set 1 *</Label>
            <Textarea
              placeholder="Paste questions..."
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
            />
          </div>

          <Button className="w-full mt-4" onClick={handleAnalyze}>
            Analyze
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="bg-white border p-4 rounded shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">✅ Evaluation Result</h2>
          <p><strong>Overall Score:</strong> {result.score} / 100</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(result.checklist).map(([key, value]) => (
              <li key={key}>
                {value === true ? "✅" : value === false ? "❌" : "🔸"}{" "}
                <strong>{key.replace(/_/g, " ")}:</strong> {value.toString()}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">💡 Suggestions:</h3>
          <ul className="list-disc list-inside">
            {result.suggestions.map((s: string, idx: number) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
