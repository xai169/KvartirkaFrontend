import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { Link, useRouter } from "@tanstack/react-router";
import { ErrorState } from "@/shared/ui/ResourceState";

export function NotFoundPage() {
    return (
        <Container
            size="xs"
            py={80}
        >
            <Stack align="center">
                <Text
                    c="teal"
                    fw={700}
                >
                    404
                </Text>
                <Title
                    order={1}
                    size="h2"
                >
                    Страница не найдена
                </Title>
                <Text
                    c="dimmed"
                    ta="center"
                >
                    Возможно, адрес изменился. Вернитесь к вашему дому.
                </Text>
                <Button
                    component={Link}
                    to="/"
                >
                    На главную
                </Button>
            </Stack>
        </Container>
    );
}
export function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
    const router = useRouter();
    return (
        <Container
            size="sm"
            py={80}
        >
            <ErrorState
                error={error}
                onRetry={() => {
                    void router.invalidate().then(reset);
                }}
            />
        </Container>
    );
}
