import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/apiError";

let isLeavingSession = false;
function handleUnauthorized(error: unknown) {
    if (
        error instanceof ApiError &&
        error.status === 401 &&
        window.location.pathname !== "/login" &&
        !isLeavingSession
    ) {
        isLeavingSession = true;
        const redirect = window.location.pathname + window.location.search;
        void queryClient.cancelQueries();
        queryClient.clear();
        // Новый документ завершает старые callbacks и изолирует cache следующей сессии.
        window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
        queries: {
            networkMode: "always",
            staleTime: 15_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: (failureCount, error) =>
                failureCount < 1 && error instanceof ApiError && (error.status === null || error.status >= 500),
        },
        // При отсутствии сети сразу сообщаем об ошибке, не ставим сохранение в offline-очередь.
        mutations: { retry: false, networkMode: "always" },
    },
});
