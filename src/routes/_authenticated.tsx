import { createFileRoute, redirect } from "@tanstack/react-router";
import { currentUserOptions } from "@/features/auth/api/authApi";
import { ApiError } from "@/shared/api/apiError";
import { AppShell } from "@/app/AppShell";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: async ({ context, location }) => {
        try {
            await context.queryClient.fetchQuery(currentUserOptions);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401)
                throw redirect({ to: "/login", search: { redirect: location.href } });
            throw error;
        }
    },
    component: AppShell,
});
