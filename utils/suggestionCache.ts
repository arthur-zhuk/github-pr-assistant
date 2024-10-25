interface CachedSuggestion {
  suggestions: string[];
  timestamp: number;
  url: string;
}

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getCachedSuggestions(
  url: string
): Promise<string[] | null> {
  const { cachedSuggestions } = await chrome.storage.local.get(
    "cachedSuggestions"
  );
  const cached = cachedSuggestions?.[url];

  if (!cached) return null;

  // Optional: Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    // Clear expired cache
    const { [url]: _, ...rest } = cachedSuggestions;
    await chrome.storage.local.set({ cachedSuggestions: rest });
    return null;
  }

  return cached.suggestions;
}

export async function cacheSuggestions(
  url: string,
  suggestions: string[]
): Promise<void> {
  const { cachedSuggestions = {} } = await chrome.storage.local.get(
    "cachedSuggestions"
  );

  await chrome.storage.local.set({
    cachedSuggestions: {
      ...cachedSuggestions,
      [url]: {
        suggestions,
        timestamp: Date.now(),
        url,
      },
    },
  });
}

export async function clearCache(url?: string): Promise<void> {
  if (url) {
    const { cachedSuggestions = {} } = await chrome.storage.local.get(
      "cachedSuggestions"
    );
    const { [url]: _, ...rest } = cachedSuggestions;
    await chrome.storage.local.set({ cachedSuggestions: rest });
  } else {
    await chrome.storage.local.remove("cachedSuggestions");
  }
}
