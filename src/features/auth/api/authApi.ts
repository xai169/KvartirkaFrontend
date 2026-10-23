import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import type { LoginInput, User } from "../model/auth";

export const currentUserOptions = queryOptions({
    queryKey: ["auth", "me"],
    queryFn: ({ signal }) => apiClient<User>("/me", { signal }),
    staleTime: 30_000,
});
export const login = (body: LoginInput) => apiClient<{ user: User }>("/auth/login", { method: "POST", body });
export const logout = () => apiClient<void>("/auth/logout", { method: "POST" });
