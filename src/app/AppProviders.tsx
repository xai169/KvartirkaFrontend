import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { theme } from "./theme";
import { queryClient } from "./queryClient";
import { NetworkStatus } from "@/shared/ui/NetworkStatus";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <MantineProvider
            theme={theme}
            defaultColorScheme="light"
        >
            <Notifications
                position="top-right"
                limit={3}
            />
            <QueryClientProvider client={queryClient}>
                <NetworkStatus />
                {children}
            </QueryClientProvider>
        </MantineProvider>
    );
}
