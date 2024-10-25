import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { codeDiff } = await request.json();

  if (!codeDiff) {
    return NextResponse.json(
      { error: "No code diff provided" },
      { status: 400 }
    );
  }

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
            content: "You are a helpful assistant for code review.",
          },
          {
            role: "user",
            content: `Please provide suggestions for the following code diff:\n\n${codeDiff}`,
          },
        ],
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

    const suggestions = data.choices[0].message.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

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
