import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant for code review. Focus on meaningful improvements and provide suggestions in a natural, copy-pasteable format.

Review each file and provide feedback in this style:

### [filename]

Nice changes overall. A few suggestions:

1. The gas usage in the fee calculation could be optimized. Consider using a more efficient approach:

\`\`\`solidity
function calculateFee(uint256 amount) internal pure returns (uint256) {
    // More efficient implementation
    return amount * (FEE_DENOMINATOR + baseFee) / FEE_DENOMINATOR;
}
\`\`\`

2. We might want to add a safety check here to prevent potential overflow issues when dealing with large amounts.

3. Consider using OpenZeppelin's SafeCast library for the uint256 to uint64 conversions to handle edge cases more safely.

4. The current implementation could be vulnerable to reentrancy in the withdraw function. We should follow the checks-effects-interactions pattern:

\`\`\`solidity
function withdraw(uint256 amount) external {
    require(balance >= amount, "Insufficient balance");
    balance -= amount;
    (bool success,) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
\`\`\`

Important: 
- Focus on significant improvements
- Highlight security concerns
- Point out performance issues
- Suggest better patterns
- Skip minor style issues

Keep suggestions focused on:
- Performance optimizations
- Security vulnerabilities
- Clear anti-patterns
- Important edge cases
- Better architectural approaches`;

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
