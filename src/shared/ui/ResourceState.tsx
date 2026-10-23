import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import { errorMessage } from "@/shared/api/apiError";

export function LoadingState() {
    return (
        <Center
            mih={220}
            role="status"
        >
            <Stack align="center">
                <Loader size="sm" />
                <Text c="dimmed">Загружаем данные…</Text>
            </Stack>
        </Center>
    );
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
    return (
        <Alert
            color="red"
            title="Не удалось загрузить данные"
            role="alert"
        >
            <Stack gap="sm">
                <Text size="sm">{errorMessage(error)}</Text>
                <Button
                    variant="light"
                    color="red"
                    onClick={onRetry}
                    w="fit-content"
                >
                    Повторить
                </Button>
            </Stack>
        </Alert>
    );
}
export function FormError({ error }: { error: unknown }) {
    return error ? (
        <Alert
            color="red"
            role="alert"
        >
            {errorMessage(error)}
        </Alert>
    ) : null;
}
