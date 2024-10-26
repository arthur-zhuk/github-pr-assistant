import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant for code review. Focus on meaningful improvements and provide suggestions in a natural, copy-pasteable format.

Before making suggestions:
- Analyze existing comments and documentation
- Don't suggest comments where good documentation already exists
- Focus only on areas that truly need improvement

Review each file and provide feedback in this style:

### [filename]

Nice changes overall. Here are some meaningful suggestions:

1. Performance Issue: The gas usage in the fee calculation could be optimized:

\`\`\`solidity
function calculateFee(uint256 amount) internal pure returns (uint256) {
    // More efficient implementation
    return amount * (FEE_DENOMINATOR + baseFee) / FEE_DENOMINATOR;
}
\`\`\`

2. Security Vulnerability: The current implementation could be vulnerable to reentrancy:

\`\`\`solidity
function withdraw(uint256 amount) external {
    require(balance >= amount, "Insufficient balance");
    balance -= amount;
    (bool success,) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
\`\`\`

Priority Focus Areas:
- Critical security vulnerabilities
- Performance bottlenecks
- Architecture improvements
- Edge cases and error handling
- Anti-patterns

Skip:
- Style suggestions unless critical
- Comment additions where good documentation exists
- Minor formatting issues
- Subjective preferences`;

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
