export interface User {
    id: string;
    login: string;
    username: string;
}
export interface LoginInput {
    login: string;
    password: string;
}

export function safeRedirect(value: unknown): string {
    if (typeof value !== "string") return "/";
    try {
        const target = new URL(value, window.location.origin);
        if (target.origin !== window.location.origin || !["/", "/purchases", "/profile"].includes(target.pathname))
            return "/";
        return target.pathname + target.search;
    } catch {
        return "/";
    }
}
