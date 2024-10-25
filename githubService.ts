const GITHUB_API_URL = "https://api.github.com";

export async function fetchPullRequestDiff(
  owner: string,
  repo: string,
  pullNumber: number,
  token: string
): Promise<string> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch pull request diff");
  }
  return response.text();
}

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
