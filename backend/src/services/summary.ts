import Groq from "groq-sdk";
import { Condition, Observation } from "../types/dashboard";

// --- Rule-based fallback (always works, no external calls) ---

function buildRuleBasedSummary(
  conditions: Condition[],
  observations: Observation[]
): string {
  const parts: string[] = [];

  // Conditions summary
  const activeConditions = conditions.filter((c) => c.status === "active");
  if (activeConditions.length > 0) {
    const names = activeConditions.map((c) => c.display).join(", ");
    parts.push(
      `Patient has ${activeConditions.length} active condition(s): ${names}.`
    );
  } else {
    parts.push("No active conditions on record.");
  }

  // Observations summary — pick the most recent 3
  if (observations.length > 0) {
    const recent = observations.slice(0, 3);
    const obs = recent
      .map((o) => `${o.display}: ${o.value} ${o.unit}`)
      .join(", ");
    parts.push(`Recent observations include ${obs}.`);
  } else {
    parts.push("No recent observations on record.");
  }

  return parts.join(" ");
}

// --- Groq AI summary ---

async function callGroq(
  conditions: Condition[],
  observations: Observation[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY set");

  const groq = new Groq({ apiKey });

  const condText =
    conditions.length > 0
      ? conditions.map((c) => `${c.display} (${c.status})`).join(", ")
      : "None";

  const obsText =
    observations.length > 0
      ? observations
          .map((o) => `${o.display}: ${o.value} ${o.unit} (${o.effectiveDate})`)
          .join(", ")
      : "None";

  const userPrompt = `Conditions: ${condText}\nObservations: ${obsText}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 150,
    messages: [
      {
        role: "system",
        content:
          "You are a clinical assistant. Summarize the following patient data in 2-3 clear, concise sentences for a clinician. Focus on the most clinically relevant information.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty Groq response");

  return text.trim();
}

// --- Main export: Groq first, fallback on any failure ---

export async function generateSummary(
  conditions: Condition[],
  observations: Observation[]
): Promise<string> {
  try {
    return await callGroq(conditions, observations);
  } catch {
    // Silently fall back — never throw from summary service
    return buildRuleBasedSummary(conditions, observations);
  }
}
