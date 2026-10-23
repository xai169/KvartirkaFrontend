import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { queryClient } from "./queryClient";
import { LoadingState } from "@/shared/ui/ResourceState";
import { NotFoundPage, RouteError } from "./RouteFeedback";

export const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultPendingComponent: LoadingState,
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFoundPage,
    scrollRestoration: true,
});
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
