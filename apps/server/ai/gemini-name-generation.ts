const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

interface GeminiValidationResult {
  isValidName: boolean;
  reason: string;
}

interface GeminiGeneratedPointsResult {
  points: Record<number, number>;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1];
  }
  return text;
}

async function callGemini(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractJson(text);
  return JSON.parse(jsonText);
}

export async function validatePotentialName(
  name: string,
): Promise<GeminiValidationResult> {
  const prompt = `
You are a strict name validator for a baby-name trend archive.
Respond with JSON only:
{
  "isValidName": boolean,
  "reason": string
}

Task:
- Evaluate whether "${name}" could plausibly be used as a personal given name.
- Return false for obvious junk, profanity-only tokens, random strings, commands, URLs, or non-name garbage.
- Return true for plausible names from any culture, including rare modern names.
  `.trim();

  const raw = (await callGemini(prompt)) as {
    isValidName?: boolean;
    reason?: string;
  };

  return {
    isValidName: !!raw.isValidName,
    reason: raw.reason?.toString().slice(0, 500) ?? "No reason provided",
  };
}

export async function generateNameTrendPoints(
  name: string,
): Promise<GeminiGeneratedPointsResult> {
  const prompt = `
Generate historical U.S. baby-name trend anchor points for the name "${name}".
Output JSON only:
{
  "points": {
    "1900": number,
    "...": number,
    "2026": number
  }
}

Rules:
- Must include year 1900 and 2026.
- Include between 6 and 14 total years.
- Year keys must be integers between 1900 and 2026.
- Values are non-negative integer counts.
- Make the shape plausible for a name popularity trend over time.
  `.trim();

  const raw = (await callGemini(prompt)) as {
    points?: Record<string, number>;
  };

  const rawPoints = raw.points ?? {};
  const points: Record<number, number> = {};

  for (const [yearKey, value] of Object.entries(rawPoints)) {
    const year = Number(yearKey);
    if (!Number.isInteger(year) || year < 1900 || year > 2026) {
      continue;
    }

    const count = Number(value);
    if (!Number.isFinite(count)) {
      continue;
    }

    points[year] = Math.max(0, Math.round(count));
  }

  if (points[1900] === undefined || points[2026] === undefined) {
    const years = Object.keys(points).map(Number);
    const minYear = years.length > 0 ? Math.min(...years) : undefined;
    const maxYear = years.length > 0 ? Math.max(...years) : undefined;

    if (points[1900] === undefined) {
      points[1900] = minYear !== undefined ? points[minYear] : 0;
    }

    if (points[2026] === undefined) {
      points[2026] = maxYear !== undefined ? points[maxYear] : points[1900];
    }
  }

  return { points };
}
