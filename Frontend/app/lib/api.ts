const DEFAULT_API_BASE_URL = "http://localhost:3001";
const SERVER_FALLBACK_API_BASE_URL = "http://127.0.0.1:3001";

function isServer() {
  return typeof window === "undefined";
}

function buildCandidateBaseUrls() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  if (!isServer() || configuredBaseUrl !== DEFAULT_API_BASE_URL) {
    return [configuredBaseUrl];
  }

  return [configuredBaseUrl, SERVER_FALLBACK_API_BASE_URL];
}

export const API_BASE_URL = buildCandidateBaseUrls()[0];

export async function fetchFromApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const baseUrls = buildCandidateBaseUrls();
  let lastError: unknown;

  for (const baseUrl of baseUrls) {
    try {
      return await fetch(`${baseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchFromApi(path, init);

  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const body = (await response.json()) as { error?: string };
      errorMessage = body.error ?? errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
