import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant for code review. When analyzing code changes:

1. Group suggestions by file
2. For each file:
   - Analyze the specific changes
   - Provide targeted suggestions
   - Include code examples showing improvements
3. Format your response in markdown with the following structure:

### File: [filename]
#### General Observations
- Specific observations about changes in this file

#### Suggested Improvements
1. [Title of suggestion]
   - Location: [line number or area of code]
   - Issue: [Description of the issue]
   - Recommendation: [Detailed solution]
   \`\`\`[language]
   // Code example showing the improvement
   \`\`\`

2. [Next suggestion for this file...]

[Repeat for each changed file]

### Overall Recommendations
- Any cross-cutting concerns or architectural suggestions
- General patterns that could be improved across files`;

export async function POST(request: Request) {
  const { codeDiff } = await request.json();

  if (!codeDiff) {
    return NextResponse.json(
      { error: "No code diff provided" },
      { status: 400 }
    );
  }

  // Filter out .json files from the diff
  const filteredDiff = codeDiff
    .split("diff --git")
    .filter((diff) => !diff.includes(".json"))
    .join("diff --git");

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Please review this code diff and provide detailed, file-specific suggestions with examples. Focus on concrete improvements for each file:\n\n${filteredDiff}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000, // Increased to allow for more detailed file-specific responses
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API response error:", data);
      return NextResponse.json(
        { error: "Failed to fetch suggestions from OpenAI" },
        { status: 500 }
      );
    }

    // Split the content into sections while preserving code blocks
    const content = data.choices[0].message.content;
    const suggestions = content
      .split(/\n(?=### File:|### Overall)/) // Split on file headers and overall section
      .map((section) => section.trim())
      .filter((section) => section.length > 0);

    return new NextResponse(JSON.stringify({ suggestions }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Use "*" only for development
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
