const GITHUB_API_URL = "https://api.github.com";

export const validateGitHubToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      console.error("Token validation failed:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const fetchPullRequestDiff = async (
  owner: string,
  repo: string,
  pullNumber: number,
  token: string
) => {
  console.log("Fetching diff with token:", token.slice(0, 4) + "..."); // Log partial token for debugging

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Accept: "application/vnd.github.v3.diff",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (response.status === 401) {
        throw new Error("GitHub token is invalid or expired");
      } else if (response.status === 403) {
        throw new Error("GitHub token lacks required permissions");
      } else if (response.status === 404) {
        throw new Error("Pull request or repository not found");
      } else {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }
    }

    const diff = await response.text();
    return diff;
  } catch (error) {
    console.error("Error fetching PR diff:", error);
    throw error;
  }
};

export async function postReviewComment(
  owner: string,
  repo: string,
  pullNumber: number,
  comment: string,
  token: string
): Promise<any> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: comment,
        event: "COMMENT",
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to post review comment");
  }
  return response.json();
}
