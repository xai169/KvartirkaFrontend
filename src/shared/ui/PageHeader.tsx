import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
    return (
        <Group
            justify="space-between"
            align="flex-start"
            mb="xl"
            gap="md"
        >
            <Stack gap={4}>
                <Title
                    order={1}
                    size="h2"
                >
                    {title}
                </Title>
                <Text
                    c="dimmed"
                    size="sm"
                >
                    {description}
                </Text>
            </Stack>
            {action}
        </Group>
    );
}
