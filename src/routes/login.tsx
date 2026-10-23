import { createFileRoute, redirect } from "@tanstack/react-router";
import { currentUserOptions } from "@/features/auth/api/authApi";
import { ApiError } from "@/shared/api/apiError";
import { LoginPage } from "@/pages/LoginPage";
import { safeRedirect } from "@/features/auth/model/auth";

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>) => ({ redirect: safeRedirect(search.redirect) }),
    beforeLoad: async ({ context }) => {
        try {
            await context.queryClient.fetchQuery(currentUserOptions);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) return;
            throw error;
        }
        throw redirect({ to: "/" });
    },
    component: LoginPage,
});
