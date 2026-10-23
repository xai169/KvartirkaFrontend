import { ApiError } from "./apiError";

type RequestOptions = { signal?: AbortSignal; body?: unknown; method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export async function apiClient<T>(path: string, { signal, body, method = "GET" }: RequestOptions = {}): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api/v1${path}`, {
            method,
            signal,
            credentials: "include",
            cache: "no-store",
            headers:
                body === undefined
                    ? { Accept: "application/json" }
                    : { Accept: "application/json", "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new ApiError(null, "NETWORK_ERROR");
    }
    if (response.status === 204) return undefined as T;
    let payload: unknown;
    try {
        const text = await response.text();
        payload = text ? JSON.parse(text) : undefined;
    } catch {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        throw new ApiError(response.status, "INVALID_RESPONSE");
    }
    if (!response.ok) {
        const detail = isRecord(payload) && isRecord(payload.error) ? payload.error : {};
        const fields = isRecord(detail.fields)
            ? Object.fromEntries(
                  Object.entries(detail.fields).filter(
                      (entry): entry is [string, string] => typeof entry[1] === "string",
                  ),
              )
            : {};
        throw new ApiError(response.status, typeof detail.code === "string" ? detail.code : "HTTP_ERROR", fields);
    }
    // DTO описывает согласованный контракт API; runtime-валидация схем здесь не выполняется.
    return payload as T;
}
